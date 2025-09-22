import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { authService } from '../services/authService';
import { trackUserEvent } from '../services/enterpriseAnalytics';
import { unifiedDataService } from '../services/unifiedDataService';

const AuthContext = createContext({});

export const useAuth = () => {
  try {
    const context = useContext(AuthContext);
    if (!context) {
      console.warn('useAuth called outside AuthProvider, returning default values');
      return {
        user: null,
        isVerified: false,
        loading: false,
        authStatus: null,
        userRole: 'guest',
        signOut: () => {},
        refreshAuth: () => {}
      };
    }
    return context;
  } catch (error) {
    console.error('useAuth error:', error);
    return {
      user: null,
      isVerified: false,
      loading: false,
      authStatus: null,
      userRole: 'guest',
      signOut: () => {},
      refreshAuth: () => {}
    };
  }
};

export const OptimizedAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState(null);
  const [userRole, setUserRole] = useState('guest');
  const [userProfile, setUserProfile] = useState(null);

  // Cache for auth checks to prevent redundant calls
  const [authCheckCache, setAuthCheckCache] = useState({
    timestamp: 0,
    data: null,
    ttl: 5 * 60 * 1000 // 5 minutes
  });

  // Determine user role based on email and profile
  const determineUserRole = useCallback((user, profile = null) => {
    if (!user) return 'guest';
    
    // Check admin emails
    const adminEmails = ['admin@testingvala.com', 'owner@testingvala.com'];
    if (adminEmails.includes(user.email)) return 'admin';
    
    // Check profile-based admin flag
    if (profile?.is_admin) return 'admin';
    
    // Check user metadata
    if (user.user_metadata?.is_admin || user.app_metadata?.is_admin) return 'admin';
    
    return user ? 'user' : 'guest';
  }, []);

  // Optimized auth check with caching
  const checkAuthStatus = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    
    // Use cache if valid and not forcing refresh
    if (!forceRefresh && authCheckCache.data && (now - authCheckCache.timestamp) < authCheckCache.ttl) {
      return authCheckCache.data;
    }

    try {
      // Check custom auth service first (faster)
      const customAuthStatus = authService.getAuthStatus();
      
      if (customAuthStatus.isAuthenticated) {
        const authData = {
          user: {
            id: customAuthStatus.deviceId || 'custom_auth_user',
            email: customAuthStatus.email,
            email_confirmed_at: new Date().toISOString(),
            user_metadata: {
              name: customAuthStatus.email.split('@')[0]
            }
          },
          isVerified: true,
          source: 'custom'
        };
        
        // Cache the result
        setAuthCheckCache({
          timestamp: now,
          data: authData,
          ttl: 5 * 60 * 1000
        });
        
        return authData;
      }
      
      // Fallback to Supabase auth if available
      if (supabase) {
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        
        if (supabaseUser) {
          const authData = {
            user: supabaseUser,
            isVerified: !!supabaseUser.email_confirmed_at,
            source: 'supabase'
          };
          
          // Cache the result
          setAuthCheckCache({
            timestamp: now,
            data: authData,
            ttl: 5 * 60 * 1000
          });
          
          return authData;
        }
      }
      
      // No authentication found
      const authData = {
        user: null,
        isVerified: false,
        source: 'none'
      };
      
      setAuthCheckCache({
        timestamp: now,
        data: authData,
        ttl: 1 * 60 * 1000 // Shorter cache for unauthenticated state
      });
      
      return authData;
      
    } catch (error) {
      console.error('Auth check error:', error);
      return {
        user: null,
        isVerified: false,
        source: 'error',
        error: error.message
      };
    }
  }, [authCheckCache]);

  // Load user profile with caching
  const loadUserProfile = useCallback(async (userId, email) => {
    if (!supabase || !userId) return null;

    try {
      // Try to get from unified data service cache first
      const cacheKey = `user_profile_${userId}`;
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('Error loading user profile:', error);
        return null;
      }

      // If no profile exists, create one
      if (!data) {
        const newProfile = {
          id: userId,
          email: email,
          username: email.split('@')[0],
          full_name: email.split('@')[0],
          is_admin: ['admin@testingvala.com', 'owner@testingvala.com'].includes(email),
          created_at: new Date().toISOString()
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert([newProfile])
          .select()
          .single();

        if (createError) {
          console.warn('Error creating user profile:', createError);
          return newProfile; // Return the profile data even if DB insert failed
        }

        return createdProfile;
      }

      return data;
    } catch (error) {
      console.warn('Error in loadUserProfile:', error);
      return null;
    }
  }, []);

  // Initialize authentication
  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true);
      
      const authData = await checkAuthStatus();
      
      if (authData.user) {
        console.log('✅ Authentication found:', authData.user.email, `(${authData.source})`);
        
        // Load user profile
        const profile = await loadUserProfile(authData.user.id, authData.user.email);
        
        // Determine role
        const role = determineUserRole(authData.user, profile);
        
        // Update state
        setUser(authData.user);
        setUserProfile(profile);
        setUserRole(role);
        setAuthStatus({
          isAuthenticated: true,
          email: authData.user.email,
          source: authData.source
        });
        
        // Track login event (only once per session)
        const sessionKey = `login_tracked_${authData.user.email}`;
        if (!sessionStorage.getItem(sessionKey)) {
          try {
            trackUserEvent.loginAttempt(authData.user.email, true);
            if (authData.isVerified) {
              trackUserEvent.emailVerified(authData.user.email);
            }
            sessionStorage.setItem(sessionKey, 'true');
          } catch (error) {
            console.warn('Analytics tracking failed:', error);
          }
        }
        
      } else {
        // No authentication
        setUser(null);
        setUserProfile(null);
        setUserRole('guest');
        setAuthStatus(null);
      }
      
    } catch (error) {
      console.error('Auth initialization error:', error);
      setUser(null);
      setUserProfile(null);
      setUserRole('guest');
      setAuthStatus(null);
    } finally {
      setLoading(false);
    }
  }, [checkAuthStatus, loadUserProfile, determineUserRole]);

  // Set up auth state monitoring
  useEffect(() => {
    initializeAuth();
    
    // Set up activity listener to extend sessions
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const handleActivity = () => {
      if (authService.isAuthenticated()) {
        authService.extendSession();
      }
    };
    
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });
    
    // Periodic auth check (less frequent than before)
    const authCheckInterval = setInterval(async () => {
      const currentAuthData = await checkAuthStatus();
      const isCurrentlyAuth = !!currentAuthData.user;
      const wasAuth = !!user;
      
      // Only update if auth state actually changed
      if (isCurrentlyAuth !== wasAuth) {
        console.log('🔄 Auth state changed, refreshing...');
        await initializeAuth();
        
        // Clear unified data service cache on auth change
        unifiedDataService.clearAllCaches();
      }
    }, 2 * 60 * 1000); // Check every 2 minutes instead of 1 minute
    
    // Set up Supabase auth listener if available
    let supabaseSubscription = null;
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔄 Supabase auth event:', event);
        
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          // Clear cache and reinitialize
          setAuthCheckCache({ timestamp: 0, data: null, ttl: 0 });
          await initializeAuth();
          
          // Clear unified data service cache
          unifiedDataService.clearAllCaches();
        }
      });
      supabaseSubscription = subscription;
    }
    
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      clearInterval(authCheckInterval);
      if (supabaseSubscription) {
        supabaseSubscription.unsubscribe();
      }
    };
  }, [initializeAuth, checkAuthStatus, user]);

  // Optimized sign out
  const signOut = useCallback(async () => {
    try {
      // Track logout event before clearing session
      if (user?.email || authStatus?.email) {
        try {
          trackUserEvent.logout();
        } catch (error) {
          console.warn('Analytics tracking failed:', error);
        }
      }
      
      // Clear custom auth session
      authService.clearSession();
      
      // Clear Supabase session if available
      if (supabase) {
        await supabase.auth.signOut();
      }
      
      // Clear all caches
      setAuthCheckCache({ timestamp: 0, data: null, ttl: 0 });
      unifiedDataService.clearAllCaches();
      
      // Clear session storage
      sessionStorage.clear();
      
      // Update state
      setUser(null);
      setUserProfile(null);
      setUserRole('guest');
      setAuthStatus(null);
      
      console.log('🔓 User signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, [user, authStatus]);

  // Refresh auth (force refresh)
  const refreshAuth = useCallback(async () => {
    setAuthCheckCache({ timestamp: 0, data: null, ttl: 0 });
    unifiedDataService.clearAllCaches();
    await initializeAuth();
  }, [initializeAuth]);

  // Check if user is verified
  const isVerified = user?.email_confirmed_at != null || authStatus?.isAuthenticated;

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    user,
    isVerified,
    loading,
    authStatus,
    userRole,
    userProfile,
    signOut,
    refreshAuth,
    // Additional helper methods
    isAdmin: userRole === 'admin',
    isUser: userRole === 'user',
    isGuest: userRole === 'guest'
  }), [user, isVerified, loading, authStatus, userRole, userProfile, signOut, refreshAuth]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Export both the optimized and original for backward compatibility
export const AuthProvider = OptimizedAuthProvider;