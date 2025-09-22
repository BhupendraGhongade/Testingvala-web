// 🚀 Optimized Data Context - Centralized State Management
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { cachedRequest } from '../utils/apiCache';
import { logApiCall } from '../utils/globalApiLogger';

// Global state for all application data
const initialState = {
  website: null,
  posts: [],
  categories: [],
  events: [],
  users: {},
  loading: {
    website: false,
    posts: false,
    categories: false,
    events: false
  },
  errors: {},
  lastUpdated: {}
};

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_DATA: 'SET_DATA',
  SET_ERROR: 'SET_ERROR',
  UPDATE_ITEM: 'UPDATE_ITEM',
  CLEAR_CACHE: 'CLEAR_CACHE',
  BATCH_UPDATE: 'BATCH_UPDATE'
};

// Reducer for state management
const dataReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: { ...state.loading, [action.key]: action.loading }
      };

    case ACTIONS.SET_DATA:
      return {
        ...state,
        [action.key]: action.data,
        loading: { ...state.loading, [action.key]: false },
        errors: { ...state.errors, [action.key]: null },
        lastUpdated: { ...state.lastUpdated, [action.key]: Date.now() }
      };

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        errors: { ...state.errors, [action.key]: action.error },
        loading: { ...state.loading, [action.key]: false }
      };

    case ACTIONS.UPDATE_ITEM:
      return {
        ...state,
        [action.key]: Array.isArray(state[action.key])
          ? state[action.key].map(item => 
              item.id === action.id ? { ...item, ...action.updates } : item
            )
          : { ...state[action.key], ...action.updates }
      };

    case ACTIONS.BATCH_UPDATE:
      return {
        ...state,
        ...action.updates,
        lastUpdated: { ...state.lastUpdated, ...action.timestamps }
      };

    case ACTIONS.CLEAR_CACHE:
      return { ...state };

    default:
      return state;
  }
};

// Create context
const OptimizedDataContext = createContext();

// Using global cache from apiCache utility

// Provider component
export const OptimizedDataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // Simplified loading state management
  const setLoading = useCallback((key, loading) => {
    dispatch({ type: ACTIONS.SET_LOADING, key, loading });
  }, []);

  // Optimized data fetchers using global cache
  const fetchWebsiteContent = useCallback(() => {
    return cachedRequest('website_content', async () => {
      if (!supabase) {
        const local = localStorage.getItem('local_website_content');
        return local ? JSON.parse(local) : {};
      }
      
      const { data, error } = await supabase
        .from('website_content')
        .select('content')
        .single();
      
      if (error) throw error;
      return data?.content || {};
    }, { component: 'OptimizedDataContext' }).then(data => {
      dispatch({ type: ACTIONS.SET_DATA, key: 'website', data });
      return data;
    });
  }, []);

  const fetchForumPosts = useCallback(() => {
    return cachedRequest('forum_posts', async () => {
      if (!supabase) {
        return JSON.parse(localStorage.getItem('local_forum_posts') || '[]');
      }
      
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          forum_categories(name),
          user_profiles(username, full_name, avatar_url, email)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      return (data || []).map(post => ({
        ...post,
        category_name: post.forum_categories?.name || 'Uncategorized'
      }));
    }, { component: 'OptimizedDataContext' }).then(data => {
      dispatch({ type: ACTIONS.SET_DATA, key: 'posts', data });
      return data;
    });
  }, []);

  const fetchCategories = useCallback(() => {
    return cachedRequest('forum_categories', async () => {
      if (!supabase) {
        return [
          { id: 'local-general', name: 'General QA', slug: 'general' },
          { id: 'local-automation', name: 'Test Automation', slug: 'automation' }
        ];
      }
      
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }, { component: 'OptimizedDataContext' }).then(data => {
      dispatch({ type: ACTIONS.SET_DATA, key: 'categories', data });
      return data;
    });
  }, []);

  const fetchEvents = useCallback(() => {
    return cachedRequest('upcoming_events', async () => {
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
    }, { component: 'OptimizedDataContext' }).then(data => {
      dispatch({ type: ACTIONS.SET_DATA, key: 'events', data });
      return data;
    });
  }, []);

  // Batch fetch multiple data types
  const fetchBatchData = useCallback(async (keys = []) => {
    const fetchers = {
      website: fetchWebsiteContent,
      posts: fetchForumPosts,
      categories: fetchCategories,
      events: fetchEvents
    };

    const promises = keys
      .filter(key => fetchers[key])
      .map(key => fetchers[key]());

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error('Batch fetch error:', error);
    }
  }, [fetchWebsiteContent, fetchForumPosts, fetchCategories, fetchEvents]);

  // Optimized write operations
  const updatePost = useCallback(async (postId, updates) => {
    // Optimistic update
    dispatch({ 
      type: ACTIONS.UPDATE_ITEM, 
      key: 'posts', 
      id: postId, 
      updates 
    });

    try {
      if (supabase) {
        const { error } = await supabase
          .from('forum_posts')
          .update(updates)
          .eq('id', postId);
        
        if (error) throw error;
      }
      
      // Clear cache to force refresh
      state.cache.delete('posts');
    } catch (error) {
      // Revert optimistic update on error
      fetchForumPosts();
      throw error;
    }
  }, [fetchForumPosts, state.cache]);

  const addPost = useCallback(async (postData) => {
    try {
      if (!supabase) {
        // Local fallback
        const local = JSON.parse(localStorage.getItem('local_forum_posts') || '[]');
        const newPost = {
          id: `local-${Date.now()}`,
          ...postData,
          created_at: new Date().toISOString()
        };
        local.unshift(newPost);
        localStorage.setItem('local_forum_posts', JSON.stringify(local));
        
        // Update state
        dispatch({ 
          type: ACTIONS.SET_DATA, 
          key: 'posts', 
          data: local 
        });
        
        return newPost;
      }

      const { data, error } = await supabase
        .from('forum_posts')
        .insert([postData])
        .select()
        .single();
      
      if (error) throw error;
      
      // Refresh posts
      fetchForumPosts();
      
      return data;
    } catch (error) {
      console.error('Add post error:', error);
      throw error;
    }
  }, [fetchForumPosts]);

  // Bulk operations for better performance
  const fetchPostEngagement = useCallback(async (postIds) => {
    if (!postIds.length || !supabase) return { comments: {}, likes: {} };
    
    const cacheKey = `engagement_${postIds.join(',')}`;
    
    return cachedRequest(cacheKey, async () => {
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
    });
  }, []);

  // Cache management using global cache
  const clearCache = useCallback((pattern = null) => {
    const { clearCache: globalClearCache } = require('../utils/apiCache');
    globalClearCache(pattern);
  }, []);

  const refreshData = useCallback((keys = []) => {
    const { clearCache: globalClearCache } = require('../utils/apiCache');
    keys.forEach(key => globalClearCache(key));
    fetchBatchData(keys);
  }, [fetchBatchData]);

  // Initialize data on mount - ONCE only
  useEffect(() => {
    let mounted = true;
    
    const initData = async () => {
      if (mounted) {
        await fetchBatchData(['website', 'posts', 'categories', 'events']);
      }
    };
    
    initData();
    
    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array - run once only

  // Context value
  const value = {
    // State
    ...state,
    
    // Fetchers
    fetchWebsiteContent,
    fetchForumPosts,
    fetchCategories,
    fetchEvents,
    fetchBatchData,
    fetchPostEngagement,
    
    // Writers
    updatePost,
    addPost,
    
    // Cache management
    clearCache,
    refreshData,
    
    // Utilities
    isLoading: (key) => state.loading[key],
    hasError: (key) => !!state.errors[key],
    getError: (key) => state.errors[key],
    getCacheStats: () => {
      const { getCacheStats: globalGetCacheStats } = require('../utils/apiCache');
      return globalGetCacheStats();
    }
  };

  return (
    <OptimizedDataContext.Provider value={value}>
      {children}
    </OptimizedDataContext.Provider>
  );
};

// Hook to use the context
export const useOptimizedDataContext = () => {
  const context = useContext(OptimizedDataContext);
  if (!context) {
    throw new Error('useOptimizedDataContext must be used within OptimizedDataProvider');
  }
  return context;
};

// Specialized hooks for common patterns
export const useWebsiteData = () => {
  const { website, fetchWebsiteContent, isLoading } = useOptimizedDataContext();
  
  useEffect(() => {
    if (!website) {
      fetchWebsiteContent();
    }
  }, [website]); // Removed fetchWebsiteContent dependency to prevent re-renders
  
  return { data: website, loading: isLoading('website') };
};

export const useCommunityData = () => {
  const { 
    posts, 
    categories, 
    fetchForumPosts, 
    fetchCategories, 
    isLoading 
  } = useOptimizedDataContext();
  
  useEffect(() => {
    if (!posts.length) fetchForumPosts();
    if (!categories.length) fetchCategories();
  }, [posts.length, categories.length]); // Removed function dependencies
  
  return { 
    posts, 
    categories, 
    loading: isLoading('posts') || isLoading('categories') 
  };
};