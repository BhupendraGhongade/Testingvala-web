// 🔄 Admin Sync Utility
import { supabase } from '../lib/supabase';

export const syncToAdmin = async (postData) => {
  try {
    if (!supabase) return false;
    
    // Ensure post exists in database
    const { data: existing } = await supabase
      .from('forum_posts')
      .select('id')
      .eq('id', postData.id)
      .single();
    
    if (!existing) {
      // Insert post if it doesn't exist
      const { error } = await supabase
        .from('forum_posts')
        .insert([postData]);
      
      if (error) {
        console.error('Admin sync failed:', error);
        return false;
      }
    }
    
    // Trigger admin refresh
    localStorage.setItem('admin_refresh_needed', Date.now().toString());
    
    return true;
  } catch (error) {
    console.error('Admin sync error:', error);
    return false;
  }
};

export const notifyAdminRefresh = () => {
  // Set flag for admin to refresh
  localStorage.setItem('posts_updated', Date.now().toString());
  
  // Dispatch event for real-time updates
  window.dispatchEvent(new CustomEvent('adminPostsUpdated', {
    detail: { timestamp: Date.now() }
  }));
};