import { supabase } from '../lib/supabase';

class DataService {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  }

  async request(key, queryFn, options = {}) {
    const { force = false } = options;
    
    // Check cache
    if (!force) {
      const cached = this.cache.get(key);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.data;
      }
    }

    // Check pending
    if (this.pendingRequests.has(key)) {
      return await this.pendingRequests.get(key);
    }

    // Execute
    const promise = queryFn();
    this.pendingRequests.set(key, promise);

    try {
      const result = await promise;
      this.cache.set(key, { data: result, timestamp: Date.now() });
      return result;
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  async getWebsiteContent() {
    return this.request('website_content', async () => {
      if (!supabase) return {};
      const { data, error } = await supabase.from('website_content').select('content').single();
      if (error) throw error;
      return data?.content || {};
    });
  }

  async getForumPosts() {
    return this.request('forum_posts', async () => {
      if (!supabase) return [];
      
      // Fixed query - removed invalid join
      const { data, error } = await supabase
        .from('forum_posts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    });
  }

  async getForumCategories() {
    return this.request('forum_categories', async () => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    });
  }

  async getUpcomingEvents() {
    return this.request('upcoming_events', async () => {
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

  async getContestSubmissions() {
    return this.request('contest_submissions', async () => {
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

  async getUserProfiles() {
    return this.request('user_profiles', async () => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, username, full_name, avatar_url, email');
      
      if (error) throw error;
      return data || [];
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
}

export const dataService = new DataService();
export default dataService;