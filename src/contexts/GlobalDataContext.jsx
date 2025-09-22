import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { dataService } from '../services/dataService';

const GlobalDataContext = createContext();

export const GlobalDataProvider = ({ children }) => {
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

    const loadAllData = async () => {
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

        setData({
          website: website.status === 'fulfilled' ? website.value : {},
          posts: posts.status === 'fulfilled' ? posts.value : [],
          categories: categories.status === 'fulfilled' ? categories.value : [],
          events: events.status === 'fulfilled' ? events.value : [],
          winners: winners.status === 'fulfilled' ? winners.value : [],
          userProfiles: userProfiles.status === 'fulfilled' ? userProfiles.value : [],
          loading: false,
          error: null
        });

        console.log('✅ All data loaded successfully');
      } catch (error) {
        console.error('❌ Error loading data:', error);
        setData(prev => ({ ...prev, loading: false, error: error.message }));
      }
    };

    loadAllData();
  }, []);

  const refreshData = () => {
    dataService.clearCache();
    initRef.current = false;
    setData(prev => ({ ...prev, loading: true }));
  };

  return (
    <GlobalDataContext.Provider value={{ ...data, refreshData }}>
      {children}
    </GlobalDataContext.Provider>
  );
};

export const useGlobalData = () => {
  const context = useContext(GlobalDataContext);
  if (!context) {
    throw new Error('useGlobalData must be used within GlobalDataProvider');
  }
  return context;
};

// Specialized hooks
export const useWebsiteData = () => {
  const { website, loading } = useGlobalData();
  return { data: website, loading };
};

export const useCommunityData = () => {
  const { posts, categories, userProfiles, loading } = useGlobalData();
  
  // Merge user profiles with posts
  const postsWithProfiles = posts.map(post => ({
    ...post,
    user_profiles: userProfiles.find(profile => profile.id === post.user_id) || null
  }));

  return { posts: postsWithProfiles, categories, loading };
};

export const useEventsData = () => {
  const { events, loading } = useGlobalData();
  return { events, loading };
};

export const useWinnersData = () => {
  const { winners, loading } = useGlobalData();
  return { winners, loading };
};