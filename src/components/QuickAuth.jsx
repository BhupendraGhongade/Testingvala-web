import React from 'react';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const QuickAuth = () => {
  const { user, signOut } = useAuth();

  // Only show in development - multiple security checks
  if (import.meta.env.VITE_DEV_AUTH_BYPASS !== 'true') return null;
  if (import.meta.env.PROD) return null;
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') return null;

  const handleDevLogin = () => {
    // Security check - only allow in development
    if (import.meta.env.PROD || 
        (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')) {
      console.warn('Development auth blocked in production');
      return;
    }
    
    // Create a mock user and store in localStorage for development
    const mockUser = {
      id: 'dev-user-123',
      email: 'user@testingvala.com',
      email_confirmed_at: new Date().toISOString(),
      user_metadata: {
        name: 'Test User',
        full_name: 'Test User'
      }
    };
    
    // Store in localStorage to simulate authentication
    localStorage.setItem('dev_auth_user', JSON.stringify(mockUser));
    
    // Reload page to trigger auth state change
    window.location.reload();
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {user ? (
        <div className="bg-green-500 text-white px-4 py-3 rounded-full shadow-2xl border-2 border-green-400">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">
              ✅ {user.email?.split('@')[0] || user.user_metadata?.name || 'User'}
            </div>
            <button
              onClick={signOut}
              className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleDevLogin}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-4 rounded-full shadow-2xl border-2 border-blue-400 flex items-center gap-2 font-medium transition-all duration-200 hover:scale-105"
          title="Quick Login for Development"
        >
          <User className="w-5 h-5" />
          Login
        </button>
      )}
    </div>
  );
};

export default QuickAuth;