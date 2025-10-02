// 🚀 Unified Data Service - Centralized API Management with Role-Based Optimization
import { supabase } from '../lib/supabase';
import { trackUserEvent } from './enterpriseAnalytics';

class UnifiedDataService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.requestQueue = new Map(); // Prevent duplicate requests
    this.batchQueue = new Map(); // Batch similar requests
    this.batchTimeout = 100; // 100ms batch window
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  getCacheKey(endpoint, params = {}, userRole = 'user') {
    return `${endpoint}_${userRole}_${JSON.stringify(params)}`;
  }

  isValidCache(cacheKey) {
    const cached = this.cache.get(cacheKey);
    return cached && (Date.now() - cached.timestamp) < this.cacheTimeout;
  }

  setCache(cacheKey, data) {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache(pattern = null) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // ============================================================================
  // REQUEST DEDUPLICATION
  // ============================================================================

  async deduplicatedRequest(key, requestFn) {
    // If same request is already in progress, wait for it
    if (this.requestQueue.has(key)) {
      return await this.requestQueue.get(key);
    }

    // Execute request and cache the promise
    const promise = requestFn();
    this.requestQueue.set(key, promise);

    try {
      const result = await promise;
      return result;
    } finally {
      this.requestQueue.delete(key);
    }
  }

  // ============================================================================
  // BATCH OPERATIONS
  // ============================================================================

  async batchRequest(batchKey, requestFn, delay = this.batchTimeout) {
    return new Promise((resolve, reject) => {
      if (!this.batchQueue.has(batchKey)) {
        this.batchQueue.set(batchKey, {
          requests: [],
          timeout: setTimeout(async () => {
            const batch = this.batchQueue.get(batchKey);
            this.batchQueue.delete(batchKey);
            
            try {
              const result = await requestFn(batch.requests.map(r => r.params));
              batch.requests.forEach((req, index) => {
                req.resolve(result[index] || null);
              });
            } catch (error) {
              batch.requests.forEach(req => req.reject(error));
            }
          }, delay)
        });
      }

      this.batchQueue.get(batchKey).requests.push({
        params: arguments[1],
        resolve,
        reject
      });
    });
  }

  // ============================================================================
  // ROLE-BASED DATA LOADING
  // ============================================================================

  async loadPageData(page, userRole = 'user', userId = null) {
    const cacheKey = this.getCacheKey(`page_${page}`, { userId }, userRole);
    
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    const data = await this.deduplicatedRequest(cacheKey, async () => {
      switch (page) {
        case 'home':
          return await this.loadHomePageData(userRole, userId);
        case 'community':
          return await this.loadCommunityPageData(userRole, userId);
        case 'admin':
          return await this.loadAdminPageData(userRole, userId);
        case 'profile':
          return await this.loadProfilePageData(userRole, userId);
        default:
          return await this.loadDefaultPageData(userRole, userId);
      }
    });

    this.setCache(cacheKey, data);
    return data;
  }

  async loadHomePageData(userRole, userId) {
    const baseData = [
      this.getWebsiteContent(['hero', 'contest', 'winners']),
      this.getUpcomingEvents(5)
    ];

    if (userRole === 'admin') {
      baseData.push(
        this.getAdminStats(),
        this.getRecentActivity(10)
      );
    } else if (userId) {
      baseData.push(
        this.getUserDashboardSummary(userId)
      );
    }

    const results = await Promise.all(baseData);
    return {
      website: results[0],
      events: results[1],
      adminStats: results[2] || null,
      recentActivity: results[3] || null,
      userSummary: results[2] || results[3] || null
    };
  }

  async loadCommunityPageData(userRole, userId) {
    const [categories, recentPosts, userLikes] = await Promise.all([
      this.getForumCategories(),
      this.getRecentPosts(20, userRole),
      userId ? this.getUserLikes(userId) : Promise.resolve([])
    ]);

    // Batch load comments and likes for posts
    const postIds = recentPosts.map(p => p.id);
    const [comments, likes] = await Promise.all([
      this.getBulkComments(postIds),
      this.getBulkLikes(postIds)
    ]);

    return {
      categories,
      posts: recentPosts.map(post => ({
        ...post,
        comments: comments[post.id] || [],
        likes_count: likes[post.id] || 0,
        user_liked: userLikes.includes(post.id)
      })),
      userLikes
    };
  }

  async loadAdminPageData(userRole, userId) {
    if (userRole !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    const [stats, activities, pendingPosts, submissions] = await Promise.all([
      this.getAdminStats(),
      this.getRecentActivity(50),
      this.getPendingPosts(),
      this.getPendingSubmissions()
    ]);

    return {
      stats,
      activities,
      pendingPosts,
      submissions
    };
  }

  async loadProfilePageData(userRole, userId) {
    if (!userId) {
      throw new Error('User ID required for profile data');
    }

    const [profile, resumes, boards, posts] = await Promise.all([
      this.getUserProfile(userId),
      this.getUserResumes(userId),
      this.getUserBoards(userId),
      this.getUserPosts(userId)
    ]);

    return {
      profile,
      resumes,
      boards,
      posts
    };
  }

  async loadDefaultPageData(userRole, userId) {
    return await this.getWebsiteContent();
  }

  // ============================================================================
  // OPTIMIZED DATA FETCHERS
  // ============================================================================

  async getWebsiteContent(sections = null) {
    if (!supabase) {
      const local = localStorage.getItem('local_website_content');
      return local ? JSON.parse(local) : {};
    }

    const { data, error } = await supabase
      .from('website_content')
      .select('content')
      .single();

    if (error) throw error;

    if (sections && Array.isArray(sections)) {
      const filtered = {};
      sections.forEach(section => {
        if (data.content[section]) {
          filtered[section] = data.content[section];
        }
      });
      return filtered;
    }

    return data.content || {};
  }

  async getForumCategories() {
    if (!supabase) {
      return [
        { id: 'local-general', name: 'General QA', slug: 'general' },
        { id: 'local-automation', name: 'Test Automation', slug: 'automation' },
        { id: 'local-manual', name: 'Manual Testing', slug: 'manual' },
        { id: 'local-career', name: 'Career & Interview', slug: 'career' }
      ];
    }

    const { data, error } = await supabase
      .from('forum_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async getRecentPosts(limit = 20, userRole = 'user') {
    if (!supabase) {
      const local = JSON.parse(localStorage.getItem('local_forum_posts') || '[]');
      return local.slice(0, limit);
    }

    const query = supabase
      .from('forum_posts')
      .select(`
        *,
        forum_categories(name),
        user_profiles(username, full_name, avatar_url, email)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Admin sees all posts, users see only active posts
    if (userRole !== 'admin') {
      query.eq('status', 'active');
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(post => ({
      ...post,
      category_name: post.forum_categories?.name || 'Uncategorized'
    }));
  }

  async getBulkComments(postIds) {
    if (!postIds.length || !supabase) return {};

    const { data, error } = await supabase
      .from('post_comments')
      .select('*')
      .in('post_id', postIds)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const grouped = {};
    (data || []).forEach(comment => {
      if (!grouped[comment.post_id]) {
        grouped[comment.post_id] = [];
      }
      grouped[comment.post_id].push(comment);
    });

    return grouped;
  }

  async getBulkLikes(postIds) {
    if (!postIds.length || !supabase) return {};

    const { data, error } = await supabase
      .from('post_likes')
      .select('post_id')
      .in('post_id', postIds);

    if (error) throw error;

    const counts = {};
    (data || []).forEach(like => {
      counts[like.post_id] = (counts[like.post_id] || 0) + 1;
    });

    return counts;
  }

  async getUserLikes(userId) {
    if (!supabase || !userId) return [];

    const { data, error } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map(like => like.post_id);
  }

  async getUpcomingEvents(limit = 10) {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('upcoming_events')
      .select('*')
      .eq('is_active', true)
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // ============================================================================
  // ADMIN-SPECIFIC DATA FETCHERS
  // ============================================================================

  async getAdminStats() {
    if (!supabase) return null;

    const { data, error } = await supabase.rpc('get_admin_dashboard_stats');
    if (error) throw error;
    return data;
  }

  async getRecentActivity(limit = 50) {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('user_activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getPendingPosts() {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('forum_posts')
      .select(`
        *,
        forum_categories(name),
        user_profiles(username, email)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getPendingSubmissions() {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('contest_submissions')
      .select('*')
      .eq('status', 'pending')
      .order('submission_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // ============================================================================
  // USER-SPECIFIC DATA FETCHERS
  // ============================================================================

  async getUserProfile(userId) {
    if (!supabase || !userId) return null;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async getUserResumes(userId) {
    if (!supabase || !userId) return [];

    const { data, error } = await supabase
      .from('user_resumes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getUserBoards(userId) {
    if (!supabase || !userId) return [];

    const { data, error } = await supabase
      .from('user_boards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getUserPosts(userId) {
    if (!supabase || !userId) return [];

    const { data, error } = await supabase
      .from('forum_posts')
      .select(`
        *,
        forum_categories(name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getUserDashboardSummary(userId) {
    if (!supabase || !userId) return null;

    const [resumes, boards, posts] = await Promise.all([
      supabase.from('user_resumes').select('id').eq('user_id', userId),
      supabase.from('user_boards').select('id').eq('user_id', userId),
      supabase.from('forum_posts').select('id').eq('user_id', userId)
    ]);

    return {
      resumeCount: resumes.data?.length || 0,
      boardCount: boards.data?.length || 0,
      postCount: posts.data?.length || 0
    };
  }

  // ============================================================================
  // WRITE OPERATIONS (Optimized)
  // ============================================================================

  async createPost(postData, userRole, userId) {
    if (!supabase) {
      // Local fallback
      const local = JSON.parse(localStorage.getItem('local_forum_posts') || '[]');
      const newPost = {
        id: `local-${Date.now()}`,
        ...postData,
        created_at: new Date().toISOString(),
        user_id: userId,
        status: 'active'
      };
      local.unshift(newPost);
      localStorage.setItem('local_forum_posts', JSON.stringify(local));
      
      // Clear relevant caches
      this.clearCache('community');
      this.clearCache('page_community');
      
      return newPost;
    }

    const { data, error } = await supabase
      .from('forum_posts')
      .insert([{
        ...postData,
        user_id: userId,
        status: userRole === 'admin' ? 'active' : 'active' // Auto-approve for now
      }])
      .select()
      .single();

    if (error) throw error;

    // Clear relevant caches
    this.clearCache('community');
    this.clearCache('page_community');
    
    // Track analytics
    try {
      trackUserEvent.community.postCreate(postData.category_id);
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }

    return data;
  }

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
      this.clearCache(`likes_${postId}`);
      return false;
    } else {
      await supabase.from('post_likes').insert({
        post_id: postId,
        user_id: userId,
        user_email: userEmail
      });
      this.clearCache(`likes_${postId}`);
      
      // Track analytics
      try {
        trackUserEvent.community.like(postId);
      } catch (error) {
        console.warn('Analytics tracking failed:', error);
      }
      
      return true;
    }
  }

  async addComment(postId, content, userId, userEmail) {
    if (!supabase) return null;

    const { data, error } = await supabase
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

    if (error) throw error;

    // Clear relevant caches
    this.clearCache(`comments_${postId}`);
    
    // Track analytics
    try {
      trackUserEvent.community.comment(postId);
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }

    return data;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      hitRate: this.cacheHits / (this.cacheHits + this.cacheMisses) || 0
    };
  }

  clearAllCaches() {
    this.cache.clear();
    this.requestQueue.clear();
    
    // Clear batch timeouts
    for (const batch of this.batchQueue.values()) {
      clearTimeout(batch.timeout);
    }
    this.batchQueue.clear();
  }
}

// Export singleton instance
export const unifiedDataService = new UnifiedDataService();

// Export convenience methods
export const loadPageData = (page, userRole, userId) => 
  unifiedDataService.loadPageData(page, userRole, userId);

export const clearCache = (pattern) => 
  unifiedDataService.clearCache(pattern);

export const getCacheStats = () => 
  unifiedDataService.getCacheStats();