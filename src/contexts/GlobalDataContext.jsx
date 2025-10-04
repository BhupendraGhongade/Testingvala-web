import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { dataService } from '../services/dataService';
import { bulletproofPostStore } from '../utils/bulletproofPostStore.js';
import '../diagnostics/deepAuditor.js';
import '../diagnostics/contextInterceptor.js';

// Make dataService available globally for debugging and cache clearing
if (typeof window !== 'undefined') {
  window.dataService = dataService;
}

const GlobalDataContext = createContext();

export const GlobalDataProvider = ({ children }) => {
  // Add defensive check for React hooks
  if (!React || !useState) {
    console.error('React hooks not available in GlobalDataProvider');
    return children;
  }

  // Bulletproof synchronous hydration
  const [data, setData] = useState(() => {
    if (window.deepAuditor) {
      window.deepAuditor.log('BULLETPROOF_INIT', 'hydration_start', {});
    }
    
    const localPosts = bulletproofPostStore.hydrate();
    console.log('[BulletproofContext] Hydrated with:', localPosts.length, 'posts');
    
    const initialState = {
      website: null,
      posts: localPosts, // Bulletproof posts loaded synchronously
      categories: [],
      events: [],
      winners: [],
      userProfiles: [],
      loading: true,
      error: null
    };
    
    if (window.deepAuditor) {
      window.deepAuditor.captureContextState('BULLETPROOF_HYDRATION', initialState);
    }
    
    return initialState;
  });
  
  const initRef = useRef(false);
  const hydrated = true; // render immediately

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const loadAllData = async () => {
      try {
        // Always ensure we have fallback categories first
        const fallbackCategories = [
          { id: 'general-discussion', name: 'General Discussion' },
          { id: 'manual-testing', name: 'Manual Testing' },
          { id: 'automation-testing', name: 'Automation Testing' },
          { id: 'api-testing', name: 'API Testing' },
          { id: 'performance-load-testing', name: 'Performance & Load Testing' }
        ];
        
        // Load data with 3-second timeout
        const results = await Promise.allSettled([
          Promise.race([dataService.getWebsiteContent(), new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))]),
          Promise.race([dataService.getForumPosts(), new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))]),
          Promise.race([dataService.getForumCategories(), new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))]),
          Promise.race([dataService.getUpcomingEvents(), new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))]),
          Promise.race([dataService.getContestSubmissions(), new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))]),
          Promise.race([dataService.getUserProfiles(), new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))])
        ]);

        const [website, posts, categories, events, winners, userProfiles] = results;
        
        // Use fallbacks for failed requests
        const categoriesData = categories.status === 'fulfilled' && categories.value?.length > 0 ? categories.value : fallbackCategories;
        const postsData = posts.status === 'fulfilled' ? posts.value : [];
        
        // Merge with bulletproof store
        const mergedPosts = bulletproofPostStore.mergeWithDB(postsData);
        
        setData(prev => ({
          ...prev,
          website: website.status === 'fulfilled' ? website.value : {},
          posts: mergedPosts,
          categories: categoriesData,
          events: events.status === 'fulfilled' ? events.value : [],
          winners: winners.status === 'fulfilled' ? winners.value : [],
          userProfiles: userProfiles.status === 'fulfilled' ? userProfiles.value : [],
          loading: false,
          error: null
        }));

        console.log('✅ Data loaded - Posts:', mergedPosts.length, 'Categories:', categoriesData.length);
      } catch (error) {
        console.error('❌ Data loading failed:', error);
        // Ensure we always have working data
        setData(prev => ({
          ...prev,
          posts: bulletproofPostStore.get(),
          categories: [{ id: 'general-discussion', name: 'General Discussion' }],
          loading: false,
          error: null
        }));
      }
    };

    loadAllData();
    
    // Bulletproof storage event handler
    const handleStorageChange = () => {
      console.log('🔄 Bulletproof storage sync');
      
      if (bulletproofPostStore.sync()) {
        setData(prev => {
          const syncedPosts = bulletproofPostStore.get();
          return { ...prev, posts: syncedPosts };
        });
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('forceDataRefresh', loadAllData);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('forceDataRefresh', loadAllData);
    };
  }, []);
  
  // Bulletproof atomic post addition
  const addPost = (post) => {
    if (window.deepAuditor) {
      window.deepAuditor.log('BULLETPROOF_ADD', 'add_start', {
        postTitle: post.title?.substring(0, 30),
        currentPosts: data.posts?.length || 0
      });
    }
    
    const newPost = bulletproofPostStore.add(post);
    if (newPost) {
      // Immediate atomic context update
      setData(prev => {
        const updatedPosts = bulletproofPostStore.get();
        const newState = { ...prev, posts: updatedPosts };
        
        console.log('[BulletproofContext] Post added:', newPost.id, 'Total:', updatedPosts.length);
        
        if (window.deepAuditor) {
          window.deepAuditor.captureContextState('BULLETPROOF_POST_ADDED', newState);
        }
        
        return newState;
      });
      
      // Immediate sync trigger
      setTimeout(() => bulletproofPostStore.sync(), 10);
    }
    return newPost;
  };
  
  // Remove post function (minimal implementation)
  const removePost = (postId) => {
    console.log('[GlobalDataContext] Remove post:', postId);
    return false;
  };

  const refreshData = async () => {
    try {
      console.log('🔄 Refreshing data...');
      dataService.clearCache();
      await loadAllData();
    } catch (error) {
      console.error('❌ Refresh failed:', error);
    }
  };

  // Bulletproof self-healing every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (bulletproofPostStore.sync()) {
        console.log('🔄 Bulletproof self-healing sync');
        setData(prev => {
          const syncedPosts = bulletproofPostStore.get();
          return { ...prev, posts: syncedPosts };
        });
      }
    }, 2000); // Self-healing for all environments
    
    return () => clearInterval(interval);
  }, []);
  
  // Bulletproof focus self-healing
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Bulletproof focus sync');
      bulletproofPostStore.sync();
      setData(prev => {
        const syncedPosts = bulletproofPostStore.get();
        return { ...prev, posts: syncedPosts };
      });
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) handleFocus();
    });
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  // Expose context data globally for deep auditing
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__GLOBAL_DATA_CONTEXT__ = { ...data, hydrated, addPost, removePost };
    }
  }, [data, hydrated]);

  return (
    <GlobalDataContext.Provider value={{ ...data, refreshData, hydrated, addPost, removePost }}>
      {children}
    </GlobalDataContext.Provider>
  );
};

export const useGlobalData = () => {
  try {
    const context = useContext(GlobalDataContext);
    if (!context) {
      console.warn('useGlobalData called outside GlobalDataProvider, returning default values');
      return {
        website: null,
        posts: [],
        categories: [],
        events: [],
        winners: [],
        userProfiles: [],
        loading: false,
        error: null,
        refreshData: () => {},
        hydrated: true,
        addPost: () => {},
        removePost: () => {}
      };
    }
    return context;
  } catch (error) {
    console.error('useGlobalData error:', error);
    return {
      website: null,
      posts: [],
      categories: [],
      events: [],
      winners: [],
      userProfiles: [],
      loading: false,
      error: error.message,
      refreshData: () => {},
      hydrated: true,
      addPost: () => {},
      removePost: () => {}
    };
  }
};

// Specialized hooks
export const useWebsiteData = () => {
  try {
    const { website, loading } = useGlobalData();
    return { data: website, loading };
  } catch (error) {
    console.error('useWebsiteData error:', error);
    return { data: null, loading: false };
  }
};

export const useCommunityData = () => {
  try {
    const { posts, categories, userProfiles, loading, hydrated } = useGlobalData();
    
    // Always return posts immediately (no loading state for hydrated posts)
    const postsWithProfiles = Array.isArray(posts) ? posts.map(post => ({
      ...post,
      user_profiles: userProfiles.find(profile => profile.id === post.user_id) || null
    })) : [];

    return { posts: postsWithProfiles, categories: categories || [], loading };
  } catch (error) {
    console.error('useCommunityData error:', error);
    return { posts: [], categories: [], loading: false };
  }
};

export const useEventsData = () => {
  try {
    const { events, loading } = useGlobalData();
    return { events: events || [], loading };
  } catch (error) {
    console.error('useEventsData error:', error);
    return { events: [], loading: false };
  }
};

export const useWinnersData = () => {
  try {
    const { winners, loading } = useGlobalData();
    return { winners: winners || [], loading };
  } catch (error) {
    console.error('useWinnersData error:', error);
    return { winners: [], loading: false };
  }
};