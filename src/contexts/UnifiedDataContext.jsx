import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { logApiCall } from '../utils/globalApiLogger';

const DataContext = createContext();

const initialState = {
  website: null,
  posts: [],
  categories: [],
  events: [],
  winners: [],
  loading: false,
  initialized: false
};

const dataReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_DATA':
      return { ...state, ...action.data, loading: false, initialized: true };
    case 'UPDATE_POSTS':
      return { ...state, posts: action.posts };
    default:
      return state;
  }
};

// Global cache with 5-minute TTL
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

const getCached = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

export const UnifiedDataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  const initRef = useRef(false);

  // Single initialization effect
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const loadAllData = async () => {
      dispatch({ type: 'SET_LOADING', loading: true });
      
      try {
        // Check cache first
        const cachedWebsite = getCached('website');
        const cachedPosts = getCached('posts');
        const cachedCategories = getCached('categories');
        const cachedEvents = getCached('events');
        const cachedWinners = getCached('winners');

        if (cachedWebsite && cachedPosts && cachedCategories && cachedEvents && cachedWinners) {
          logApiCall('unified_data', 'UnifiedDataContext', 'cache', { hit: true });
          dispatch({
            type: 'SET_DATA',
            data: {
              website: cachedWebsite,
              posts: cachedPosts,
              categories: cachedCategories,
              events: cachedEvents,
              winners: cachedWinners
            }
          });
          return;
        }

        logApiCall('unified_data_batch', 'UnifiedDataContext', 'api', { batch: true });
        console.log('🚀 UnifiedDataContext: Starting batch API call');

        // Fetch all data in parallel
        const [websiteResult, postsResult, categoriesResult, eventsResult, winnersResult] = await Promise.allSettled([
          // Website content
          supabase ? supabase.from('website_content').select('content').single() : Promise.resolve({ data: null }),
          
          // Forum posts
          supabase ? supabase.from('forum_posts').select(`
            *,
            forum_categories(name),
            user_profiles(username, full_name, avatar_url, email)
          `).eq('status', 'active').order('created_at', { ascending: false }).limit(50) : Promise.resolve({ data: [] }),
          
          // Categories
          supabase ? supabase.from('forum_categories').select('*').eq('is_active', true).order('name') : Promise.resolve({ data: [] }),
          
          // Events
          supabase ? supabase.from('upcoming_events').select('*').eq('is_active', true).gte('event_date', new Date().toISOString().split('T')[0]).order('event_date', { ascending: true }).limit(10) : Promise.resolve({ data: [] }),
          
          // Winners
          supabase ? supabase.from('contest_submissions').select('*').in('winner_rank', [1, 2, 3]).order('winner_rank') : Promise.resolve({ data: [] })
        ]);

        const website = websiteResult.status === 'fulfilled' ? websiteResult.value.data?.content || {} : {};
        const posts = postsResult.status === 'fulfilled' ? (postsResult.value.data || []).map(post => ({
          ...post,
          category_name: post.forum_categories?.name || 'Uncategorized'
        })) : [];
        const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value.data || [] : [];
        const events = eventsResult.status === 'fulfilled' ? eventsResult.value.data || [] : [];
        const winners = winnersResult.status === 'fulfilled' ? winnersResult.value.data || [] : [];

        // Cache results
        setCache('website', website);
        setCache('posts', posts);
        setCache('categories', categories);
        setCache('events', events);
        setCache('winners', winners);

        console.log('✅ UnifiedDataContext: Batch API call completed', { website, posts: posts.length, categories: categories.length, events: events.length, winners: winners.length });
        
        dispatch({
          type: 'SET_DATA',
          data: { website, posts, categories, events, winners }
        });

      } catch (error) {
        console.error('Data loading error:', error);
        dispatch({ type: 'SET_LOADING', loading: false });
      }
    };

    loadAllData();
  }, []);

  const value = {
    ...state,
    refreshData: () => {
      cache.clear();
      initRef.current = false;
      dispatch({ type: 'SET_LOADING', loading: true });
    }
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useUnifiedData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useUnifiedData must be used within UnifiedDataProvider');
  }
  return context;
};

// Specialized hooks that don't make additional API calls
export const useWebsiteData = () => {
  const { website, loading, initialized } = useUnifiedData();
  return { data: website, loading: loading && !initialized };
};

export const useCommunityData = () => {
  const { posts, categories, loading, initialized } = useUnifiedData();
  return { posts, categories, loading: loading && !initialized };
};

export const useEventsData = () => {
  const { events, loading, initialized } = useUnifiedData();
  return { events, loading: loading && !initialized };
};

export const useWinnersData = () => {
  const { winners, loading, initialized } = useUnifiedData();
  return { winners, loading: loading && !initialized };
};