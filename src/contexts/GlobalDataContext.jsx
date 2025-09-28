import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { dataService } from '../services/dataService';

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

  const [data, setData] = useState({
    website: null,
    posts: [],
    categories: [],
    events: [],
    winners: [],
    userProfiles: [],
    loading: true,
    error: null
  });
  
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    // Add small delay to prevent race conditions
    const loadAllData = async () => {
      // Wait for React to fully initialize
      await new Promise(resolve => setTimeout(resolve, 10));
      try {
        console.log('🚀 Loading all data in single batch...');
        
        const [website, posts, categories, events, winners, userProfiles] = await Promise.allSettled([
          dataService.getWebsiteContent(),
          dataService.getForumPosts(),
          dataService.getForumCategories(),
          dataService.getUpcomingEvents(),
          dataService.getContestSubmissions(),
          dataService.getUserProfiles()
        ]);

        const categoriesData = categories.status === 'fulfilled' ? categories.value : [];
        console.log('📂 Categories loaded:', categoriesData.length, categoriesData);
        
        setData({
          website: website.status === 'fulfilled' ? website.value : {},
          posts: posts.status === 'fulfilled' ? posts.value : [],
          categories: categoriesData,
          events: events.status === 'fulfilled' ? events.value : [],
          winners: winners.status === 'fulfilled' ? winners.value : [],
          userProfiles: userProfiles.status === 'fulfilled' ? userProfiles.value : [],
          loading: false,
          error: null
        });

        console.log('✅ All data loaded successfully');
        
        // Log any failed requests
        if (categories.status === 'rejected') {
          console.error('❌ Categories failed to load:', categories.reason);
        }
        if (posts.status === 'rejected') {
          console.error('❌ Posts failed to load:', posts.reason);
        }
      } catch (error) {
        console.error('❌ Error loading data:', error);
        setData(prev => ({ ...prev, loading: false, error: error.message }));
      }
    };

    loadAllData();
  }, []);

  const refreshData = async () => {
    try {
      console.log('🔄 Refreshing all data...');
      dataService.clearCache();
      
      // Re-fetch all data
      const [website, posts, categories, events, winners, userProfiles] = await Promise.allSettled([
        dataService.getWebsiteContent(),
        dataService.getForumPosts(),
        dataService.getForumCategories(),
        dataService.getUpcomingEvents(),
        dataService.getContestSubmissions(),
        dataService.getUserProfiles()
      ]);

      const categoriesData = categories.status === 'fulfilled' ? categories.value : [];
      
      setData({
        website: website.status === 'fulfilled' ? website.value : {},
        posts: posts.status === 'fulfilled' ? posts.value : [],
        categories: categoriesData,
        events: events.status === 'fulfilled' ? events.value : [],
        winners: winners.status === 'fulfilled' ? winners.value : [],
        userProfiles: userProfiles.status === 'fulfilled' ? userProfiles.value : [],
        loading: false,
        error: null
      });
      
      console.log('✅ Data refreshed successfully');
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
      setData(prev => ({ ...prev, loading: false, error: error.message }));
    }
  };

  return (
    <GlobalDataContext.Provider value={{ ...data, refreshData }}>
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
        refreshData: () => {}
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
      refreshData: () => {}
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
    const { posts, categories, userProfiles, loading } = useGlobalData();
    
    // Merge user profiles with posts
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