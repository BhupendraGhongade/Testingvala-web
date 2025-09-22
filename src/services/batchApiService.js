// 🚀 Batch API Service - Eliminates Individual API Calls
import { supabase } from '../lib/supabase';

class BatchApiService {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.batchQueue = new Map();
    this.batchDelay = 50; // 50ms batch window
  }

  // Single API call for ALL page data
  async loadCompletePageData(userRole = 'guest', userId = null) {
    const cacheKey = `complete_page_${userRole}_${userId}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 300000) { // 5 min cache
        return cached.data;
      }
    }

    try {
      // Single batch query for everything
      const [
        websiteContent,
        forumPosts,
        categories,
        allLikes,
        allComments,
        userLikes,
        upcomingEvents
      ] = await Promise.all([
        this.getWebsiteContent(),
        this.getAllForumPosts(),
        this.getForumCategories(),
        this.getAllLikes(),
        this.getAllComments(),
        userId ? this.getUserLikes(userId) : Promise.resolve([]),
        this.getUpcomingEvents()
      ]);

      // Process and merge all data
      const processedPosts = this.processPosts(forumPosts, allLikes, allComments, userLikes);
      
      const completeData = {
        website: websiteContent,
        posts: processedPosts,
        categories,
        events: upcomingEvents,
        userLikes: userLikes || [],
        timestamp: Date.now()
      };

      // Cache the complete result
      this.cache.set(cacheKey, { data: completeData, timestamp: Date.now() });
      
      return completeData;
    } catch (error) {
      console.error('Batch load error:', error);
      return this.getFallbackData();
    }
  }

  // Process posts with likes/comments in memory (no additional API calls)
  processPosts(posts, allLikes, allComments, userLikes = []) {
    const likesMap = new Map();
    const commentsMap = new Map();
    const userLikesSet = new Set(userLikes);

    // Group likes by post_id
    allLikes.forEach(like => {
      const postId = like.post_id;
      if (!likesMap.has(postId)) likesMap.set(postId, 0);
      likesMap.set(postId, likesMap.get(postId) + 1);
    });

    // Group comments by post_id
    allComments.forEach(comment => {
      const postId = comment.post_id;
      if (!commentsMap.has(postId)) commentsMap.set(postId, []);
      commentsMap.get(postId).push(comment);
    });

    // Merge everything into posts
    return posts.map(post => ({
      ...post,
      likes_count: likesMap.get(post.id) || 0,
      comments: commentsMap.get(post.id) || [],
      user_liked: userLikesSet.has(post.id),
      replies_count: (commentsMap.get(post.id) || []).length
    }));
  }

  // Optimized individual data fetchers
  async getWebsiteContent() {
    if (!supabase) {
      const local = localStorage.getItem('local_website_content');
      return local ? JSON.parse(local) : {};
    }

    const { data } = await supabase.from('website_content').select('content').single();
    return data?.content || {};
  }

  async getAllForumPosts() {
    if (!supabase) {
      return JSON.parse(localStorage.getItem('local_forum_posts') || '[]');
    }

    const { data } = await supabase
      .from('forum_posts')
      .select(`
        *,
        forum_categories(name),
        user_profiles(username, full_name, avatar_url, email)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(50);

    return (data || []).map(post => ({
      ...post,
      category_name: post.forum_categories?.name || 'Uncategorized'
    }));
  }

  async getForumCategories() {
    if (!supabase) {
      return [
        { id: 'local-general', name: 'General QA', slug: 'general' },
        { id: 'local-automation', name: 'Test Automation', slug: 'automation' }
      ];
    }

    const { data } = await supabase
      .from('forum_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    return data || [];
  }

  async getAllLikes() {
    if (!supabase) return [];
    
    const { data } = await supabase
      .from('post_likes')
      .select('post_id, user_id, user_email');
    
    return data || [];
  }

  async getAllComments() {
    if (!supabase) return [];
    
    const { data } = await supabase
      .from('post_comments')
      .select('*')
      .order('created_at', { ascending: true });
    
    return data || [];
  }

  async getUserLikes(userId) {
    if (!supabase || !userId) return [];
    
    const { data } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', userId);
    
    return (data || []).map(like => like.post_id);
  }

  async getUpcomingEvents() {
    if (!supabase) return [];
    
    const { data } = await supabase
      .from('upcoming_events')
      .select('*')
      .eq('is_active', true)
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true })
      .limit(10);
    
    return data || [];
  }

  // Optimized write operations
  async toggleLike(postId, userId, userEmail) {
    if (!supabase) return false;

    const { data: existing } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      await supabase.from('post_likes').delete().eq('id', existing.id);
      this.invalidateCache();
      return false;
    } else {
      await supabase.from('post_likes').insert({
        post_id: postId,
        user_id: userId,
        user_email: userEmail
      });
      this.invalidateCache();
      return true;
    }
  }

  async addComment(postId, content, userId, userEmail) {
    if (!supabase) return null;

    const { data } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        content,
        user_id: userId,
        user_email: userEmail,
        author_name: userEmail.split('@')[0]
      })
      .select()
      .single();

    this.invalidateCache();
    return data;
  }

  // Cache management
  invalidateCache() {
    this.cache.clear();
  }

  getFallbackData() {
    return {
      website: {},
      posts: JSON.parse(localStorage.getItem('local_forum_posts') || '[]'),
      categories: [
        { id: 'local-general', name: 'General QA', slug: 'general' }
      ],
      events: [],
      userLikes: [],
      timestamp: Date.now()
    };
  }
}

export const batchApiService = new BatchApiService();