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
        userRole: null,
        isAdmin: false,
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
      userRole: null,
      isAdmin: false,
      signOut: () => {}
    };
  }
};

export const AuthProvider = ({ children }) => {
  // Add defensive check for React hooks
  if (!React || !useState) {
    console.error('React hooks not available in AuthProvider');
    return children;
  }

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    const initialize = async () => {
      if (mounted) {
        await initializeAuth();
      }
    };
    
    initialize();
    
    // Listen for auth state changes (from development auth)
    const handleAuthStateChange = (event) => {
      if (event.detail?.user) {
        console.log('✅ Auth state change detected:', event.detail.user.email);
        const userData = event.detail.user;
        setUser(userData);
        setUserRole(determineUserRole(userData.email));
        setLoading(false);
        
        // Force re-render by updating a timestamp
        setAuthStatus(prev => ({ ...prev, lastUpdate: Date.now() }));
      }
    };
    
    window.addEventListener('auth-state-change', handleAuthStateChange);
    
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
    
    // OPTIMIZED: Less frequent session checks + dev auth checks
    const sessionCheck = setInterval(() => {
      if (!mounted) return;
      
      // Check for dev auth changes
      const devUser = localStorage.getItem('dev_auth_user');
      if (devUser && !user) {
        try {
          const parsedUser = JSON.parse(devUser);
          console.log('✅ Dev auth detected in interval check:', parsedUser.email);
          setUser(parsedUser);
          setUserRole(determineUserRole(parsedUser.email));
          setLoading(false);
          return;
        } catch (error) {
          localStorage.removeItem('dev_auth_user');
        }
      }
      
      const currentStatus = authService.getAuthStatus();
      if (currentStatus.isAuthenticated !== authStatus?.isAuthenticated) {
        setAuthStatus(currentStatus);
        updateUserState(currentStatus);
      }
    }, 1000); // Check every second in development
    
    return () => {
      mounted = false;
      window.removeEventListener('auth-state-change', handleAuthStateChange);
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      clearInterval(sessionCheck);
      if (activityTimeout) {
        clearTimeout(activityTimeout);
      }
    };
  }, []); // Remove dependency to prevent re-initialization
  
  const determineUserRole = (email) => {
    if (!email) return 'user';
    
    // Admin role determination
    const adminEmails = [
      'admin@testingvala.com',
      import.meta.env.VITE_DEV_ADMIN_EMAIL
    ].filter(Boolean);
    
    const isAdmin = adminEmails.includes(email.toLowerCase()) || 
                   email.toLowerCase().includes('admin@testingvala') ||
                   email.toLowerCase().startsWith('admin@');
    
    return isAdmin ? 'admin' : 'user';
  };
  
  const initializeAuth = async () => {
    try {
      // Check for development auth first
      const devUser = localStorage.getItem('dev_auth_user');
      if (devUser) {
        try {
          const parsedUser = JSON.parse(devUser);
          console.log('✅ Development auth session found:', parsedUser.email);
          setUser(parsedUser);
          setUserRole(determineUserRole(parsedUser.email));
          setLoading(false);
          return;
        } catch (error) {
          console.error('Error parsing dev user:', error);
          localStorage.removeItem('dev_auth_user');
        }
      }

      // Check our custom auth service
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
      
      // Fallback to Supabase auth if available (for data storage only)
      if (supabase) {
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        if (supabaseUser) {
          console.log('✅ Supabase auth session found:', supabaseUser.email);
          setUser(supabaseUser);
          setUserRole(determineUserRole(supabaseUser.email));
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
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };
  
  const updateUserState = (status) => {
    try {
      if (status.isAuthenticated && status.email) {
        const role = determineUserRole(status.email);
        
        // Create a user object compatible with existing code
        const mockUser = {
          id: status.deviceId || 'custom_auth_user',
          email: status.email,
          email_confirmed_at: status.isAuthenticated ? new Date().toISOString() : null,
          user_metadata: {
            name: status.email.split('@')[0],
            role: role
          },
          role: role
        };
        
        setUser(mockUser);
        setUserRole(role);
        
        // Store role in session for persistence
        const session = authService.getSession();
        if (session) {
          session.role = role;
          localStorage.setItem('auth_session', JSON.stringify(session));
        }
        
      } else {
        setUser(null);
        setUserRole(null);
      }
    } catch (error) {
      console.error('Error updating user state:', error);
      setUser(null);
      setUserRole(null);
    }
  };

  const createUserProfile = async (authUser) => {
    try {
      if (!supabase) return;
      
      const role = determineUserRole(authUser.email);
      
      const { error } = await supabase
        .from('users')
        .upsert({
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.name || authUser.email.split('@')[0],
          role: role,
          is_verified: !!authUser.email_confirmed_at,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });
      
      if (error) {
        console.warn('Error creating user profile:', error);
      } else {
        console.log(`✅ User profile created/updated: ${authUser.email} (${role})`);
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
      
      // Clear development auth
      localStorage.removeItem('dev_auth_user');
      
      // Clear custom auth session
      authService.clearSession();
      
      // Clear Supabase session if available
      if (supabase) {
        await supabase.auth.signOut();
      }
      
      setUser(null);
      setAuthStatus(null);
      setUserRole(null);
      console.log('🔓 User signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const isVerified = user?.email_confirmed_at != null || authStatus?.isAuthenticated;
  const isAdmin = userRole === 'admin';

  const value = {
    user,
    isVerified,
    loading,
    authStatus,
    userRole,
    isAdmin,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};