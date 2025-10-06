import { supabase } from '../lib/supabase';
import { smartCache } from '../utils/smartCacheManager';

class DataService {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    this.smartCache = smartCache;
  }

  async request(key, queryFn, options = {}) {
    const { force = false, useSmartCache = true } = options;
    
    // BYPASS ALL CACHING FOR FORUM POSTS
    if (key.includes('forum_posts')) {
      console.log('🚫 Bypassing all caches for:', key);
      return await queryFn();
    }
    
    // Check smart cache first (localStorage with quota management)
    if (!force && useSmartCache) {
      const cached = this.smartCache.get('data', key);
      if (cached && cached.data) {
        console.log('📦 Smart cache hit for:', key);
        return cached.data;
      }
    }
    
    // Check memory cache
    if (!force) {
      const cached = this.cache.get(key);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        console.log('📦 Memory cache hit for:', key);
        return cached.data;
      }
    }

    // Check pending
    if (this.pendingRequests.has(key)) {
      console.log('⏳ Waiting for pending request:', key);
      return await this.pendingRequests.get(key);
    }

    // Execute
    console.log('🔄 Fetching fresh data for:', key);
    const promise = queryFn();
    this.pendingRequests.set(key, promise);

    try {
      const result = await promise;
      
      // Store in memory cache (except forum posts)
      if (!key.includes('forum_posts')) {
        this.cache.set(key, { data: result, timestamp: Date.now() });
      }
      
      // Store in smart cache (except forum posts)
      if (useSmartCache && !key.includes('forum_posts')) {
        this.smartCache.set('data', key, result, {
          maxAge: this.CACHE_TTL,
          priority: 'normal'
        });
      }
      
      console.log('✅ Data fetched for:', key, 'Items:', Array.isArray(result) ? result.length : 'N/A');
      return result;
    } catch (error) {
      console.error('❌ Error fetching data for:', key, error);
      throw error;
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  async getWebsiteContent() {
    return this.request('website_content', async () => {
      if (!supabase) return {};
      const { data, error } = await supabase.from('website_content').select('content').single();
      if (error) {
        console.warn('Website content not found, using defaults');
        return {};
      }
      return data?.content || {};
    });
  }

  async getForumPosts() {
    const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');
    console.log('🔄 getForumPosts - Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
    
    // Get localStorage posts (always fresh)
    let localPosts = [];
    try {
      const raw = localStorage.getItem('testingvala_posts');
      if (raw) {
        localPosts = JSON.parse(raw);
        if (!Array.isArray(localPosts)) localPosts = [];
      }
    } catch (e) {
      localPosts = [];
    }
    
    // BULLETPROOF: Always ensure demo post exists
    const ensureDemoPost = () => {
      if (localPosts.length === 0 || !localPosts.find(p => p.id === 'demo-post-1')) {
        const demoPost = {
          id: 'demo-post-1',
          title: 'Welcome to TestingVala Community! 🚀',
          content: `Hey QA professionals! 👋\n\nWelcome to our vibrant testing community where we share knowledge, discuss best practices, and grow together.\n\n🔥 **What you can do here:**\n• Share your testing experiences and insights\n• Ask questions and get help from experts\n• Discuss automation frameworks and tools\n• Network with fellow QA professionals\n• Participate in monthly contests with prizes\n\n💡 **Pro tip:** Use the search and filter options to find discussions relevant to your interests!\n\nFeel free to introduce yourself and let us know what testing challenges you're currently facing. Our community is here to help! 🤝\n\n#QACommunity #Testing #QualityAssurance`,
          author_name: 'TestingVala Team',
          category_id: 'general-discussion',
          category_name: 'General Discussion',
          experience_years: 'Expert',
          created_at: new Date().toISOString(),
          likes_count: 12,
          replies_count: 5,
          isLocal: true,
          isPermanent: true,
          status: 'active'
        };
        localPosts = localPosts.filter(p => p.id !== 'demo-post-1');
        localPosts.unshift(demoPost);
        try {
          localStorage.setItem('testingvala_posts', JSON.stringify(localPosts));
        } catch (e) {
          console.warn('Failed to save demo post to localStorage:', e);
        }
      }
    };
    
    // In development: prioritize localStorage, use DB as backup
    // In production: prioritize DB, use localStorage as cache
    if (!isProduction) {
      // DEVELOPMENT: localStorage first with bulletproof fallback
      console.log('📱 Development mode: Using localStorage as primary source');
      ensureDemoPost();
      
      // Try to fetch from DB as backup (non-blocking)
      if (supabase) {
        try {
          console.log('🔄 Attempting DB connection test...');
          const { data, error } = await Promise.race([
            supabase.from('forum_posts').select('id').limit(1),
            new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 3000))
          ]);
          
          if (!error) {
            console.log('✅ DB connection successful in development');
          }
        } catch (dbError) {
          console.warn('⚠️ DB connection failed in development (using localStorage only):', dbError.message);
        }
      }
      
      return localPosts;
    } else {
      // PRODUCTION: Database with localStorage fallback
      console.log('🌐 Production mode: Attempting database connection...');
      
      let dbPosts = [];
      if (supabase) {
        try {
          const { data, error } = await Promise.race([
            supabase
              .from('forum_posts')
              .select(`*, forum_categories(name)`)
              .eq('status', 'active')
              .order('created_at', { ascending: false })
              .limit(100),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Database timeout')), 10000))
          ]);
          
          if (!error && data) {
            dbPosts = data.map(post => ({
              ...post,
              category_name: post.forum_categories?.name || 'General'
            }));
            console.log(`✅ Production posts loaded from database: ${dbPosts.length}`);
            return dbPosts;
          } else {
            throw new Error(error?.message || 'Database query failed');
          }
        } catch (e) {
          console.error('❌ DB fetch failed in production:', e.message);
          console.log('🔄 Falling back to localStorage + demo post...');
          ensureDemoPost();
          return localPosts;
        }
      } else {
        console.warn('⚠️ Supabase not configured in production, using localStorage fallback');
        ensureDemoPost();
        return localPosts;
      }
    }
  }

  async getForumCategories() {
    return this.request('forum_categories', async () => {
      // BULLETPROOF: Always return hardcoded categories as fallback
      const fallbackCategories = [
        { id: 'general-discussion', name: 'General Discussion', is_active: true },
        { id: 'manual-testing', name: 'Manual Testing', is_active: true },
        { id: 'automation-testing', name: 'Automation Testing', is_active: true },
        { id: 'api-testing', name: 'API Testing', is_active: true },
        { id: 'performance-load-testing', name: 'Performance & Load Testing', is_active: true },
        { id: 'security-testing', name: 'Security Testing', is_active: true },
        { id: 'mobile-testing', name: 'Mobile Testing', is_active: true },
        { id: 'interview-preparation', name: 'Interview Preparation', is_active: true },
        { id: 'certifications-courses', name: 'Certifications & Courses', is_active: true },
        { id: 'career-guidance', name: 'Career Guidance', is_active: true },
        { id: 'freshers-beginners', name: 'Freshers & Beginners', is_active: true },
        { id: 'test-management-tools', name: 'Test Management Tools', is_active: true },
        { id: 'cicd-devops', name: 'CI/CD & DevOps', is_active: true },
        { id: 'bug-tracking', name: 'Bug Tracking', is_active: true },
        { id: 'ai-in-testing', name: 'AI in Testing', is_active: true },
        { id: 'job-openings-referrals', name: 'Job Openings & Referrals', is_active: true },
        { id: 'testing-contests-challenges', name: 'Testing Contests & Challenges', is_active: true },
        { id: 'best-practices-processes', name: 'Best Practices & Processes', is_active: true },
        { id: 'community-helpdesk', name: 'Community Helpdesk', is_active: true },
        { id: 'events-meetups', name: 'Events & Meetups', is_active: true }
      ];
      
      if (!supabase) {
        console.warn('Supabase not available, returning fallback categories');
        return fallbackCategories;
      }
      
      try {
        console.log('🔍 Fetching forum categories from database...');
        const { data, error } = await Promise.race([
          supabase
            .from('forum_categories')
            .select('*')
            .eq('is_active', true)
            .order('name'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Categories timeout')), 5000))
        ]);
        
        if (error) {
          console.warn('⚠️ Categories fetch error, using fallback:', error.message);
          return fallbackCategories;
        }
        
        if (data && data.length > 0) {
          console.log('✅ Categories fetched from database:', data.length);
          return data;
        } else {
          console.log('📋 No categories in database, using fallback');
          return fallbackCategories;
        }
      } catch (error) {
        console.warn('⚠️ Categories fetch failed, using fallback:', error.message);
        return fallbackCategories;
      }
    });
  }

  async getUpcomingEvents() {
    return this.request('upcoming_events', async () => {
      if (!supabase) {
        console.warn('Supabase not available, returning empty events');
        return [];
      }
      
      try {
        const { data, error } = await Promise.race([
          supabase
            .from('upcoming_events')
            .select('*')
            .eq('is_active', true)
            .gte('event_date', new Date().toISOString().split('T')[0])
            .order('event_date', { ascending: true })
            .limit(10),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Events timeout')), 5000))
        ]);
        
        if (error) {
          console.warn('⚠️ Events fetch error:', error.message);
          return [];
        }
        
        console.log('✅ Events fetched:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.warn('⚠️ Events fetch failed:', error.message);
        return [];
      }
    });
  }

  async getContestSubmissions() {
    return this.request('contest_submissions', async () => {
      if (!supabase) {
        console.warn('Supabase not available, returning empty contest submissions');
        return [];
      }
      
      try {
        const { data, error } = await Promise.race([
          supabase
            .from('contest_submissions')
            .select('*')
            .in('winner_rank', [1, 2, 3])
            .order('winner_rank'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Contest submissions timeout')), 5000))
        ]);
        
        if (error) {
          console.warn('⚠️ Contest submissions fetch error:', error.message);
          return [];
        }
        
        console.log('✅ Contest submissions fetched:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.warn('⚠️ Contest submissions fetch failed:', error.message);
        return [];
      }
    });
  }

  async getUserProfiles() {
    return this.request('user_profiles', async () => {
      if (!supabase) {
        console.warn('Supabase not available, returning empty user profiles');
        return [];
      }
      
      try {
        const { data, error } = await Promise.race([
          supabase
            .from('user_profiles')
            .select('id, username, full_name, avatar_url, email'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('User profiles timeout')), 5000))
        ]);
        
        if (error) {
          console.warn('⚠️ User profiles fetch error:', error.message);
          return [];
        }
        
        console.log('✅ User profiles fetched:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.warn('⚠️ User profiles fetch failed:', error.message);
        return [];
      }
    });
  }

  clearCache(pattern = null) {
    // Clear memory cache
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
    
    // Clear smart cache
    if (pattern) {
      // Clear specific pattern from smart cache
      this.smartCache.clear('data');
    } else {
      this.smartCache.clearAll();
    }
    
    console.log('🧹 Cache cleared:', pattern || 'all');
  }
  
  // Get cache statistics
  getCacheStats() {
    const memoryStats = {
      memoryItems: this.cache.size,
      pendingRequests: this.pendingRequests.size
    };
    
    const smartStats = this.smartCache.getStats();
    
    return {
      ...memoryStats,
      ...smartStats
    };
  }
  
  // Emergency cache cleanup
  emergencyCleanup() {
    console.warn('🚨 Emergency cache cleanup triggered');
    this.cache.clear();
    this.smartCache.clearAll();
    
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
  }
}

export const dataService = new DataService();
export default dataService;