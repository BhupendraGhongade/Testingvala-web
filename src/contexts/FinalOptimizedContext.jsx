import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { dataService } from '../services/optimizedDataService';

const DataContext = createContext();

export const FinalOptimizedProvider = ({ children }) => {
  const [data, setData] = useState({
    website: null,
    posts: [],
    categories: [],
    events: [],
    winners: [],
    loading: true,
    initialized: false
  });
  
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const loadData = async () => {
      try {
        console.log('🚀 FinalOptimizedContext: Loading all data...');
        const allData = await dataService.getAllData();
        
        setData({
          ...allData,
          loading: false,
          initialized: true
        });
        
        console.log('✅ FinalOptimizedContext: Data loaded successfully');
      } catch (error) {
        console.error('❌ FinalOptimizedContext: Error loading data:', error);
        setData(prev => ({ ...prev, loading: false }));
      }
    };

    loadData();
  }, []);

  const refreshData = () => {
    dataService.clearCache();
    initRef.current = false;
    setData(prev => ({ ...prev, loading: true }));
  };

  return (
    <DataContext.Provider value={{ ...data, refreshData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useFinalOptimizedData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useFinalOptimizedData must be used within FinalOptimizedProvider');
  }
  return context;
};

// Specialized hooks
export const useWebsiteData = () => {
  const { website, loading } = useFinalOptimizedData();
  return { data: website, loading };
};

export const useCommunityData = () => {
  const { posts, categories, loading } = useFinalOptimizedData();
  return { posts, categories, loading };
};

export const useEventsData = () => {
  const { events, loading } = useFinalOptimizedData();
  return { events, loading };
};

export const useWinnersData = () => {
  const { winners, loading } = useFinalOptimizedData();
  return { winners, loading };
};