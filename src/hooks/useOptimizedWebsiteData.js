import { useState, useEffect, useCallback, useMemo } from 'react';
import { unifiedDataService } from '../services/unifiedDataService';
import { supabase, TABLES } from '../lib/supabase';
import { useAuth } from '../contexts/OptimizedAuthContext';
import toast from 'react-hot-toast';

export const useOptimizedWebsiteData = (sections = null) => {
  const { userRole, user } = useAuth();
  
  const defaultData = useMemo(() => ({
    hero: { 
      headline: 'Win Big with Your Testing Expertise', 
      subtitle: 'Show off your QA skills in our monthly contest!', 
      stats: { participants: '500+', prizes: '$2,000+', support: '24/7' } 
    },
    contest: { 
      title: 'January 2025 QA Contest', 
      theme: 'Testing Hacks & Smart Techniques', 
      prizes: '1st Place: $500 | 2nd Place: $300 | 3rd Place: $200', 
      submission: 'Share your QA trick with detailed explanation and impact', 
      deadline: '2025-01-31', 
      status: 'Active Now',
      stats: {
        participants: '2,500+',
        countries: '45+',
        submissions: '1,200+',
        winners: '36'
      }
    },
    winners: [
      {
        avatar: '🏆',
        name: 'Sarah Johnson',
        title: 'QA Automation Expert',
        trick: 'Implemented a robust test automation framework that reduced testing time by 60% while maintaining 99% accuracy.'
      },
      {
        avatar: '🥈',
        name: 'Michael Chen',
        title: 'Performance Testing Specialist',
        trick: 'Developed innovative load testing strategies that identified critical bottlenecks before production deployment.'
      },
      {
        avatar: '🥉',
        name: 'Emily Rodriguez',
        title: 'Mobile Testing Guru',
        trick: 'Created comprehensive mobile testing protocols that improved app stability across all device types.'
      }
    ],
    about: { 
      description: 'TestingVala.com is revolutionizing the QA industry by creating a platform where testing professionals can showcase their skills, learn from each other, and compete for recognition and rewards.', 
      features: [
        'Daily QA tips and best practices',
        'Interview preparation resources',
        'Process improvement techniques',
        'Monthly QA contests with prizes'
      ], 
      stats: {
        members: '10,000+',
        tips: '500+',
        contests: '12+',
        countries: '50+'
      }
    },
    contact: { 
      email: 'info@testingvala.com', 
      website: 'www.testingvala.com', 
      location: 'Global QA Community', 
      socialMedia: {
        instagram: 'https://www.instagram.com/testingvala',
        youtube: 'https://www.youtube.com/@TestingvalaOfficial',
        twitter: 'https://twitter.com/testingvala',
        linkedin: 'https://www.linkedin.com/company/testingvala'
      }
    },
    footer: {
      brand: { name: 'TestingVala', logoLetter: 'T', tagline: 'QA Excellence Platform' },
      description: 'Empowering QA professionals worldwide through knowledge sharing, skill development, and competitive excellence.',
      contact: { email: 'info@testingvala.com', phone: '+1 (555) 123-4567', website: 'https://www.testingvala.com' },
      quickLinks: [
        { label: 'Home', href: '#home' },
        { label: 'Events', href: '#events' },
        { label: 'Winners', href: '#winners' },
        { label: 'Community', href: '#community' },
        { label: 'About', href: '#about' },
        { label: 'Contact', href: '#contact' }
      ],
      resources: [
        { label: 'QA Tips & Tricks', href: '/resources/tips' },
        { label: 'Interview Preparation', href: '/resources/interview' },
        { label: 'Privacy Policy', href: '/privacy' }
      ],
      socialMedia: { 
        twitter: 'https://twitter.com/testingvala', 
        linkedin: 'https://www.linkedin.com/company/testingvala', 
        youtube: 'https://www.youtube.com/@TestingvalaOfficial', 
        instagram: 'https://www.instagram.com/testingvala' 
      },
      copyright: '© 2025 TestingVala. All rights reserved.'
    },
    messages: []
  }), []);

  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Cache key for this specific data request
  const cacheKey = useMemo(() => {
    const sectionKey = sections ? sections.join(',') : 'all';
    return `website_data_${sectionKey}_${userRole}`;
  }, [sections, userRole]);

  // Merge data with defaults, preserving structure
  const mergeDataWithDefaults = useCallback((base, backend = {}) => {
    const merged = { ...base };
    Object.keys(base).forEach((key) => {
      if (backend[key] !== undefined) {
        if (Array.isArray(base[key])) {
          merged[key] = Array.isArray(backend[key]) ? backend[key] : base[key];
        } else if (typeof base[key] === 'object' && base[key] !== null) {
          merged[key] = { ...base[key], ...backend[key] };
        } else {
          merged[key] = backend[key];
        }
      }
    });
    return merged;
  }, []);

  // Optimized data loading with caching
  const loadData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Check if we have Supabase configuration
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        // Fallback to localStorage for offline mode
        const localData = localStorage.getItem('local_website_content');
        if (localData) {
          const parsed = JSON.parse(localData);
          setData(mergeDataWithDefaults(defaultData, parsed));
        } else {
          setData(defaultData);
        }
        setIsOnline(false);
        setLastUpdated(new Date().toISOString());
        return;
      }

      // Use unified data service for optimized loading
      let websiteData;
      
      if (sections && sections.length > 0) {
        // Load only specific sections
        websiteData = await unifiedDataService.getWebsiteContent(sections);
      } else {
        // Load all website content
        websiteData = await unifiedDataService.getWebsiteContent();
      }

      if (websiteData && Object.keys(websiteData).length > 0) {
        const mergedData = mergeDataWithDefaults(defaultData, websiteData);
        setData(mergedData);
        setIsOnline(true);
        setLastUpdated(new Date().toISOString());
        
        // Cache in localStorage for offline access
        localStorage.setItem('local_website_content', JSON.stringify(mergedData));
      } else {
        // No data found, initialize with defaults
        if (supabase && userRole === 'admin') {
          // Only admins can initialize the database
          await supabase.from(TABLES.WEBSITE_CONTENT).insert({ 
            id: 1, 
            content: defaultData 
          });
        }
        setData(defaultData);
        setIsOnline(true);
        setLastUpdated(new Date().toISOString());
      }

    } catch (err) {
      console.error('Error loading website data:', err);
      setError(err?.message || String(err));
      setIsOnline(false);
      
      // Fallback to cached data
      try {
        const cachedData = localStorage.getItem('local_website_content');
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          setData(mergeDataWithDefaults(defaultData, parsed));
          toast.success('Using cached data - some content may be outdated');
        } else {
          setData(defaultData);
        }
      } catch (cacheError) {
        console.error('Error loading cached data:', cacheError);
        setData(defaultData);
      }
    } finally {
      setLoading(false);
    }
  }, [defaultData, mergeDataWithDefaults, sections, userRole]);

  // Validation for section data
  const validateSectionData = useCallback((section, value) => {
    try {
      switch (section) {
        case 'hero': 
          return value && typeof value === 'object' && value.headline !== undefined;
        case 'contest': 
          return value && typeof value === 'object' && value.title !== undefined;
        case 'winners': 
          return Array.isArray(value);
        case 'about': 
          return value && typeof value === 'object' && value.description !== undefined;
        case 'contact': 
          return value && typeof value === 'object' && value.email !== undefined;
        case 'footer': 
          return value && typeof value === 'object';
        case 'messages': 
          return Array.isArray(value);
        default: 
          return true;
      }
    } catch (e) { 
      console.error('Validation error:', e); 
      return false; 
    }
  }, []);

  // Optimized save function with role-based access
  const saveData = useCallback(async (section, newData) => {
    try {
      // Validate data
      if (!validateSectionData(section, newData)) { 
        toast.error('Invalid data format'); 
        return false; 
      }

      // Check permissions
      if (userRole !== 'admin') {
        toast.error('Admin access required to modify website content');
        return false;
      }

      const updatedData = { ...data, [section]: newData };
      
      // Save to database if online
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        // Offline mode - save to localStorage
        localStorage.setItem('local_website_content', JSON.stringify(updatedData));
        setData(updatedData);
        toast.success(`${section} updated locally`);
        return true;
      }

      // Use Supabase for online save
      const { error } = await supabase
        .from(TABLES.WEBSITE_CONTENT)
        .upsert({ 
          id: 1, 
          content: updatedData, 
          updated_at: new Date().toISOString() 
        });

      if (error) throw error;

      // Update local state and cache
      setData(updatedData);
      setLastUpdated(new Date().toISOString());
      localStorage.setItem('local_website_content', JSON.stringify(updatedData));
      
      // Clear unified data service cache for this section
      unifiedDataService.clearCache('website_content');
      
      toast.success(`${section} updated successfully`);
      return true;

    } catch (err) {
      console.error('Error saving data:', err);
      toast.error(`Failed to save ${section}: ${err.message}`);
      return false;
    }
  }, [data, userRole, validateSectionData]);

  // Save multiple sections at once (batch operation)
  const saveMultipleSections = useCallback(async (sectionsData) => {
    try {
      // Check permissions
      if (userRole !== 'admin') {
        toast.error('Admin access required to modify website content');
        return false;
      }

      // Validate all sections
      for (const [section, sectionData] of Object.entries(sectionsData)) {
        if (!validateSectionData(section, sectionData)) {
          toast.error(`Invalid data format for ${section}`);
          return false;
        }
      }

      const updatedData = { ...data, ...sectionsData };
      
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        // Offline mode
        localStorage.setItem('local_website_content', JSON.stringify(updatedData));
        setData(updatedData);
        toast.success('All sections updated locally');
        return true;
      }

      // Online save
      const { error } = await supabase
        .from(TABLES.WEBSITE_CONTENT)
        .upsert({ 
          id: 1, 
          content: updatedData, 
          updated_at: new Date().toISOString() 
        });

      if (error) throw error;

      // Update state and cache
      setData(updatedData);
      setLastUpdated(new Date().toISOString());
      localStorage.setItem('local_website_content', JSON.stringify(updatedData));
      
      // Clear cache
      unifiedDataService.clearCache('website_content');
      
      toast.success('All sections updated successfully');
      return true;

    } catch (err) {
      console.error('Error saving multiple sections:', err);
      toast.error(`Failed to save: ${err.message}`);
      return false;
    }
  }, [data, userRole, validateSectionData]);

  // Add message (for contact form)
  const addMessage = useCallback(async (messageObj) => {
    try {
      const newMessage = { 
        id: Date.now(), 
        name: messageObj.name || 'Anonymous', 
        email: messageObj.email || '', 
        subject: messageObj.subject || '', 
        message: messageObj.message || '', 
        read: false, 
        created_at: new Date().toISOString() 
      };
      
      const existingMessages = Array.isArray(data.messages) ? data.messages : [];
      const updatedMessages = [newMessage, ...existingMessages];
      
      return await saveData('messages', updatedMessages);
    } catch (err) { 
      console.error('Error adding message:', err); 
      return false; 
    }
  }, [data.messages, saveData]);

  // Initialize data loading
  useEffect(() => { 
    loadData(); 
  }, [loadData]);

  // Auto-refresh data periodically for admins
  useEffect(() => {
    if (userRole === 'admin' && isOnline) {
      const refreshInterval = setInterval(() => {
        loadData(false); // Don't force refresh, use cache if valid
      }, 10 * 60 * 1000); // Refresh every 10 minutes

      return () => clearInterval(refreshInterval);
    }
  }, [userRole, isOnline, loadData]);

  // Helper functions
  const getSectionData = useCallback((section) => data[section] || null, [data]);
  
  const updateSectionLocally = useCallback((section, newData) => {
    setData(prev => ({ ...prev, [section]: newData }));
  }, []);

  const refreshData = useCallback(() => loadData(true), [loadData]);

  // Return optimized hook interface
  return {
    data,
    loading,
    error,
    isOnline,
    lastUpdated,
    saveData,
    saveMultipleSections,
    refreshData,
    getSectionData,
    updateSectionLocally,
    mergeDataWithDefaults,
    addMessage,
    // Additional helper properties
    canEdit: userRole === 'admin',
    isStale: lastUpdated && (Date.now() - new Date(lastUpdated).getTime()) > 30 * 60 * 1000, // 30 minutes
    cacheKey
  };
};