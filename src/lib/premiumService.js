import { supabase } from './supabase';

export const checkPremiumAccess = async (userEmail) => {
  if (!supabase || !userEmail) return false;
  
  try {
    const { data } = await supabase
      .from('premium_users')
      .select('expires_at')
      .eq('user_email', userEmail)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    return !!data;
  } catch {
    return false;
  }
};

export const submitPaymentRequest = async (paymentData) => {
  if (!supabase) throw new Error('Service unavailable');
  
  const { error } = await supabase
    .from('premium_requests')
    .insert(paymentData);
  
  if (error) throw error;
  return true;
};