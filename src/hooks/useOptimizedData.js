// 🚀 Optimized Data Hook - Eliminates ALL Duplicate API Calls
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

// Global cache and request deduplication
const globalCache = new Map();
const pendingRequests = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

class OptimizedDataManager {
  constructor() {
    this.subscribers = new Map();
    this.batchQueue = new Map();
    this.batchTimeout = 100; // 100ms batch window
  }

  // Single source of truth for all data
  async getData(key, fetcher, options = {}) {
    const { cache = true, dedupe = true } = options;
    
    // Check cache first
    if (cache && this.isValidCache(key)) {
      return globalCache.get(key).data;
    }

    // Deduplicate identical requests
    if (dedupe && pendingRequests.has(key)) {
      return await pendingRequests.get(key);
    }

    // Execute request
    const promise = this.executeRequest(key, fetcher, cache);
    if (dedupe) {
      pendingRequests.set(key, promise);
    }

    try {
      const result = await promise;
      return result;
    } finally {
      if (dedupe) {
        pendingRequests.delete(key);
      }
    }
  }

  async executeRequest(key, fetcher, cache) {
    try {
      const data = await fetcher();
      
      if (cache) {
        globalCache.set(key, {
          data,
          timestamp: Date.now()
        });
      }
      
      // Notify subscribers
      this.notifySubscribers(key, data);
      
      return data;
    } catch (error) {
      console.error(`Data fetch error for ${key}:`, error);
      throw error;
    }
  }

  isValidCache(key) {
    const cached = globalCache.get(key);
    return cached && (Date.now() - cached.timestamp) < CACHE_DURATION;
  }

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
      subs.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Subscriber notification error:', error);
        }
      });
    }
  }

  invalidateCache(pattern = null) {
    if (pattern) {
      for (const key of globalCache.keys()) {
        if (key.includes(pattern)) {
          globalCache.delete(key);
        }
      }
    } else {
      globalCache.clear();
    }
  }

  // Batch multiple requests
  async batchRequest(batchKey, requests) {
    return new Promise((resolve, reject) => {
      if (!this.batchQueue.has(batchKey)) {
        this.batchQueue.set(batchKey, {
          requests: [],
          timeout: setTimeout(async () => {
            const batch = this.batchQueue.get(batchKey);
            this.batchQueue.delete(batchKey);
            
            try {
              const results = await Promise.all(
                batch.requests.map(req => req.fetcher())
              );
              batch.requests.forEach((req, index) => {
                req.resolve(results[index]);
              });
            } catch (error) {
              batch.requests.forEach(req => req.reject(error));
            }
          }, this.batchTimeout)
        });
      }

      this.batchQueue.get(batchKey).requests.push({
        fetcher: requests,
        resolve,
        reject
      });
    });
  }
}

const dataManager = new OptimizedDataManager();

// Optimized hook for all data needs
export const useOptimizedData = (dataKeys = []) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);
  const subscribersRef = useRef([]);

  // Data fetchers - centralized and optimized
  const fetchers = {
    websiteContent: () => dataManager.getData('website_content', async () => {
      if (!supabase) {
        const local = localStorage.getItem('local_website_content');
        return local ? JSON.parse(local) : {};
      }
      const { data } = await supabase.from('website_content').select('content').single();
      return data?.content || {};
    }),

    forumPosts: () => dataManager.getData('forum_posts', async () => {
      if (!supabase) {
        return JSON.parse(localStorage.getItem('local_forum_posts') || '[]');
      }
      const { data } = await supabase
        .from('forum_posts')
        .select(`*, forum_categories(name), user_profiles(username, full_name, avatar_url, email)`)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50);
      return (data || []).map(post => ({
        ...post,
        category_name: post.forum_categories?.name || 'Uncategorized'
      }));
    }),

    forumCategories: () => dataManager.getData('forum_categories', async () => {
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
    }),

    upcomingEvents: () => dataManager.getData('upcoming_events', async () => {
      if (!supabase) return [];
      const { data } = await supabase
        .from('upcoming_events')
        .select('*')
        .eq('is_active', true)
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true })
        .limit(10);
      return data || [];
    }),

    // Batch load comments and likes
    postEngagement: (postIds) => dataManager.getData(`engagement_${postIds.join(',')}`, async () => {
      if (!supabase || !postIds.length) return { comments: {}, likes: {} };
      
      const [commentsResult, likesResult] = await Promise.all([
        supabase.from('post_comments').select('*').in('post_id', postIds),
        supabase.from('post_likes').select('post_id').in('post_id', postIds)
      ]);
      
      const commentsByPost = {};
      const likesByPost = {};
      
      (commentsResult.data || []).forEach(comment => {
        if (!commentsByPost[comment.post_id]) commentsByPost[comment.post_id] = [];
        commentsByPost[comment.post_id].push(comment);
      });
      
      (likesResult.data || []).forEach(like => {
        likesByPost[like.post_id] = (likesByPost[like.post_id] || 0) + 1;
      });
      
      return { comments: commentsByPost, likes: likesByPost };
    }, { cache: true, dedupe: true })
  };

  // Load data based on requested keys
  const loadData = useCallback(async () => {
    if (!dataKeys.length) return;

    try {
      setLoading(true);
      setError(null);

      const results = {};
      
      // Load all requested data in parallel
      await Promise.all(
        dataKeys.map(async (key) => {
          if (fetchers[key]) {
            results[key] = await fetchers[key]();
          }
        })
      );

      if (mountedRef.current) {
        setData(results);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message);
        console.error('Optimized data load error:', err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [dataKeys]);

  // Subscribe to data changes
  useEffect(() => {
    loadData();

    // Subscribe to cache updates
    const unsubscribers = dataKeys.map(key => 
      dataManager.subscribe(key, (newData) => {
        if (mountedRef.current) {
          setData(prev => ({ ...prev, [key]: newData }));
        }
      })
    );

    subscribersRef.current = unsubscribers;

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [loadData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      subscribersRef.current.forEach(unsub => unsub());
    };
  }, []);

  // Optimized write operations
  const updateData = useCallback(async (key, updater) => {
    try {
      const currentData = data[key];
      const newData = typeof updater === 'function' ? updater(currentData) : updater;
      
      // Optimistic update
      setData(prev => ({ ...prev, [key]: newData }));
      
      // Invalidate cache to force refresh
      dataManager.invalidateCache(key);
      
      return newData;
    } catch (error) {
      console.error('Update data error:', error);
      throw error;
    }
  }, [data]);

  const refreshData = useCallback((keys = dataKeys) => {
    keys.forEach(key => dataManager.invalidateCache(key));
    loadData();
  }, [dataKeys, loadData]);

  return {
    data,
    loading,
    error,
    updateData,
    refreshData,
    // Expose cache stats for debugging
    cacheStats: () => ({
      size: globalCache.size,
      keys: Array.from(globalCache.keys())
    })
  };
};

// Specialized hooks for common use cases
export const useWebsiteData = () => useOptimizedData(['websiteContent']);
export const useCommunityData = () => useOptimizedData(['forumPosts', 'forumCategories']);
export const useEventsData = () => useOptimizedData(['upcomingEvents']);
export const useCompletePageData = () => useOptimizedData(['websiteContent', 'forumPosts', 'forumCategories', 'upcomingEvents']);

// Export data manager for advanced usage
export { dataManager };