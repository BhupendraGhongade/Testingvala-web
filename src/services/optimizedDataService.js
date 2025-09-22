import { supabase } from '../lib/supabase';
import { logApiCall } from '../utils/globalApiLogger';

// Single source of truth for all data
class OptimizedDataService {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.subscribers = new Map();
    this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  }

  // Get cached data or fetch if needed
  async getData(key, fetchFn, options = {}) {
    const { force = false, component = 'OptimizedDataService' } = options;
    
    // Check cache first
    if (!force) {
      const cached = this.cache.get(key);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        logApiCall(key, component, 'cache', { hit: true });
        return cached.data;
      }
    }

    // Check for pending request
    if (this.pendingRequests.has(key)) {
      logApiCall(key, component, 'dedupe', { pending: true });
      return await this.pendingRequests.get(key);
    }

    // Execute request
    logApiCall(key, component, 'api', { executing: true });
    const requestPromise = fetchFn();
    this.pendingRequests.set(key, requestPromise);

    try {
      const data = await requestPromise;
      this.cache.set(key, { data, timestamp: Date.now() });
      this.notifySubscribers(key, data);
      return data;
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  // Subscribe to data changes
  subscribe(key, callback) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key).add(callback);

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(key);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscribers.delete(key);
        }
      }
    };
  }

  notifySubscribers(key, data) {
    const subs = this.subscribers.get(key);
    if (subs) {
      subs.forEach(callback => callback(data));
    }
  }

  // Optimized forum posts fetch with proper joins
  async getForumPosts() {
    return this.getData('forum_posts', async () => {
      if (!supabase) return [];

      // Try with join first, fallback to separate queries if relationship fails
      try {
        const { data, error } = await supabase
          .from('forum_posts')
          .select(`
            *,
            user_profiles(id, username, full_name, avatar_url, email)
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error && error.code === 'PGRST200') {
          // Relationship doesn't exist, fetch separately
          return this.getForumPostsSeparately();
        }

        if (error) throw error;
        return data || [];
      } catch (err) {
        console.warn('Forum posts join failed, using separate queries:', err);
        return this.getForumPostsSeparately();
      }
    });
  }

  async getForumPostsSeparately() {
    const [postsResult, profilesResult] = await Promise.all([
      supabase.from('forum_posts').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(50),
      supabase.from('user_profiles').select('id, username, full_name, avatar_url, email')
    ]);

    const posts = postsResult.data || [];
    const profiles = profilesResult.data || [];
    const profileMap = new Map(profiles.map(p => [p.id, p]));

    return posts.map(post => ({
      ...post,
      user_profiles: post.user_id ? profileMap.get(post.user_id) : null
    }));
  }

  async getWebsiteContent() {
    return this.getData('website_content', async () => {
      if (!supabase) return {};
      const { data, error } = await supabase.from('website_content').select('content').single();
      if (error) throw error;
      return data?.content || {};
    });
  }

  async getForumCategories() {
    return this.getData('forum_categories', async () => {
      if (!supabase) return [];
      const { data, error } = await supabase.from('forum_categories').select('*').eq('is_active', true).order('name');
      if (error) throw error;
      return data || [];
    });
  }

  async getUpcomingEvents() {
    return this.getData('upcoming_events', async () => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('upcoming_events')
        .select('*')
        .eq('is_active', true)
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true })
        .limit(10);
      if (error) throw error;
      return data || [];
    });
  }

  async getContestWinners() {
    return this.getData('contest_winners', async () => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('contest_submissions')
        .select('*')
        .in('winner_rank', [1, 2, 3])
        .order('winner_rank');
      if (error) throw error;
      return data || [];
    });
  }

  // Batch fetch all data in one call
  async getAllData() {
    logApiCall('batch_all_data', 'OptimizedDataService', 'batch', { batch: true });
    
    const [website, posts, categories, events, winners] = await Promise.allSettled([
      this.getWebsiteContent(),
      this.getForumPosts(),
      this.getForumCategories(),
      this.getUpcomingEvents(),
      this.getContestWinners()
    ]);

    return {
      website: website.status === 'fulfilled' ? website.value : {},
      posts: posts.status === 'fulfilled' ? posts.value : [],
      categories: categories.status === 'fulfilled' ? categories.value : [],
      events: events.status === 'fulfilled' ? events.value : [],
      winners: winners.status === 'fulfilled' ? winners.value : []
    };
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
}

export const dataService = new OptimizedDataService();
export default dataService;