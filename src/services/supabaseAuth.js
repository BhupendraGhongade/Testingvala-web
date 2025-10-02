import { supabase } from '../lib/supabase';

export const authService = {
  async sendMagicLink(email) {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Magic link sent to your email',
        provider: 'supabase'
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async verifyOtp(email, token) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'magiclink'
      });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  }
};