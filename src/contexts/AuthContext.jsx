import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { authService } from '../services/authService';
import { trackUserEvent } from '../services/enterpriseAnalytics';

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
        signOut: () => {}
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
      signOut: () => {}
    };
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    const initialize = async () => {
      if (mounted) {
        await initializeAuth();
      }
    };
    
    initialize();
    
    // OPTIMIZED: Throttled activity listener
    let activityTimeout;
    const handleActivity = () => {
      if (activityTimeout) return; // Throttle activity checks
      
      activityTimeout = setTimeout(() => {
        if (mounted && authService.isAuthenticated()) {
          authService.extendSession();
        }
        activityTimeout = null;
      }, 30000); // Throttle to 30 seconds
    };
    
    const activityEvents = ['mousedown', 'keypress', 'scroll'];
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });
    
    // OPTIMIZED: Less frequent session checks
    const sessionCheck = setInterval(() => {
      if (!mounted) return;
      
      const currentStatus = authService.getAuthStatus();
      if (currentStatus.isAuthenticated !== authStatus?.isAuthenticated) {
        setAuthStatus(currentStatus);
        updateUserState(currentStatus);
      }
    }, 600000); // Check every 10 minutes
    
    return () => {
      mounted = false;
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      clearInterval(sessionCheck);
      if (activityTimeout) {
        clearTimeout(activityTimeout);
      }
    };
  }, []); // Remove dependency to prevent re-initialization
  
  const initializeAuth = async () => {
    try {
      // Check our custom auth service first
      const customAuthStatus = authService.getAuthStatus();
      
      if (customAuthStatus.isAuthenticated) {
        console.log('✅ Custom auth session found:', customAuthStatus.email);
        setAuthStatus(customAuthStatus);
        updateUserState(customAuthStatus);
        // Track login event
        try {
          trackUserEvent.loginAttempt(customAuthStatus.email, true);
        } catch (error) {
          console.warn('Analytics tracking failed:', error);
        }
        setLoading(false);
        return;
      }
      
      // Fallback to Supabase auth if available
      if (supabase) {
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        if (supabaseUser) {
          console.log('✅ Supabase auth session found:', supabaseUser.email);
          setUser(supabaseUser);
          await createUserProfile(supabaseUser);
          // Track login event
          try {
            trackUserEvent.loginAttempt(supabaseUser.email, true);
            if (supabaseUser.email_confirmed_at) {
              trackUserEvent.emailVerified(supabaseUser.email);
            }
          } catch (error) {
            console.warn('Analytics tracking failed:', error);
          }
        }
      }
      
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Set safe defaults on error
      setUser(null);
      setAuthStatus(null);
    } finally {
      setLoading(false);
    }
  };
  
  const updateUserState = (status) => {
    try {
      if (status.isAuthenticated && status.email) {
        // Create a user object compatible with existing code
        const mockUser = {
          id: status.deviceId || 'custom_auth_user',
          email: status.email,
          email_confirmed_at: status.isAuthenticated ? new Date().toISOString() : null,
          user_metadata: {
            name: status.email.split('@')[0]
          }
        };
        setUser(mockUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error updating user state:', error);
      setUser(null);
    }
  };

  const createUserProfile = async (authUser) => {
    try {
      if (!supabase) return;
      
      const { error } = await supabase
        .from('users')
        .upsert({
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.name || authUser.email.split('@')[0],
          is_verified: !!authUser.email_confirmed_at,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });
      
      if (error) {
        console.warn('Error creating user profile:', error);
      } else {
        console.log('✅ User profile created/updated:', authUser.email);
      }
    } catch (error) {
      console.warn('Error in createUserProfile:', error);
    }
  };

  const signOut = async () => {
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
      
      setUser(null);
      setAuthStatus(null);
      console.log('🔓 User signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const isVerified = user?.email_confirmed_at != null || authStatus?.isAuthenticated;

  const value = {
    user,
    isVerified,
    loading,
    authStatus,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};