// Development bypass utilities
export const devBypass = {
  shouldBypass: () => {
    return import.meta.env.VITE_DEV_AUTH_BYPASS === 'true' && 
           (import.meta.env.VITE_APP_ENV === 'development' || import.meta.env.VITE_APP_ENV === 'local');
  },
  
  getCurrentUser: () => ({
    id: 'dev-user-123',
    email: import.meta.env.VITE_DEV_USER_EMAIL || 'dev@testingvala.com',
    name: 'Dev User',
    isVerified: true,
    user_metadata: {
      name: 'Dev User',
      email: import.meta.env.VITE_DEV_USER_EMAIL || 'dev@testingvala.com'
    }
  }),
  
  getAdminUser: () => ({
    id: 'admin-user-123',
    email: import.meta.env.VITE_DEV_ADMIN_EMAIL || 'admin@testingvala.com',
    name: 'Admin User',
    isVerified: true,
    user_metadata: {
      name: 'Admin User',
      email: import.meta.env.VITE_DEV_ADMIN_EMAIL || 'admin@testingvala.com'
    }
  }),
  
  // Legacy methods for backward compatibility
  isEnabled: () => devBypass.shouldBypass(),
  getDevUser: () => devBypass.getCurrentUser()
};

export default devBypass;