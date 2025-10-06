import { useState, useEffect } from 'react';

export const useDevAuth = () => {
  const [devUser, setDevUser] = useState(null);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Auto-login as admin in development
      const mockUser = {
        id: 'dev-admin-123',
        email: 'admin@testingvala.com',
        user_metadata: { full_name: 'Dev Admin' }
      };
      setDevUser(mockUser);
    }
  }, []);

  const switchUser = (userType) => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const users = {
      admin: {
        id: 'dev-admin-123',
        email: 'admin@testingvala.com',
        user_metadata: { full_name: 'Dev Admin' }
      },
      user: {
        id: 'dev-user-456',
        email: 'user@testingvala.com',
        user_metadata: { full_name: 'Dev User' }
      }
    };
    
    setDevUser(users[userType]);
  };

  return { devUser, switchUser };
};