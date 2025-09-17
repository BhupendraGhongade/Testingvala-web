import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const usePremiumAccess = (userEmail) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    if (!userEmail) {
      setHasAccess(false);
      setLoading(false);
      return;
    }

    checkPremiumAccess();
    
    // Set up real-time subscription
    if (supabase) {
      const subscription = supabase
        .channel('premium-access')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'premium_users',
            filter: `user_email=eq.${userEmail}`
          },
          () => {
            checkPremiumAccess();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [userEmail]);

  const checkPremiumAccess = async () => {
    if (!supabase || !userEmail) {
      setHasAccess(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('premium_users')
        .select('*')
        .eq('user_email', userEmail)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking premium access:', error);
        setHasAccess(false);
      } else {
        setHasAccess(!!data);
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error checking premium access:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  const refreshAccess = () => {
    checkPremiumAccess();
  };

  return {
    hasAccess,
    loading,
    subscription,
    refreshAccess
  };
};