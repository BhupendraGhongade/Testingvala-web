// 🔄 Post Synchronization Fix
import { supabase } from '../lib/supabase';

export const syncPosts = async () => {
  try {
    console.log('🔄 Syncing posts...');
    
    // Get database posts
    let dbPosts = [];
    if (supabase) {
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          forum_categories(name, color, icon)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        dbPosts = data.map(post => ({
          ...post,
          category_name: post.forum_categories?.name || 'General'
        }));
      }
    }
    
    // Get local posts
    const localPosts = JSON.parse(localStorage.getItem('local_forum_posts') || '[]');
    
    // Combine and deduplicate
    const allPosts = [...localPosts, ...dbPosts];
    const uniquePosts = allPosts.filter((post, index, self) => 
      index === self.findIndex(p => p.id === post.id)
    );
    
    // Sort by creation date
    uniquePosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    console.log(`✅ Synced ${uniquePosts.length} posts (${localPosts.length} local + ${dbPosts.length} db)`);
    return uniquePosts;
    
  } catch (error) {
    console.error('❌ Post sync error:', error);
    return JSON.parse(localStorage.getItem('local_forum_posts') || '[]');
  }
};

export const forceRefreshPosts = () => {
  // Clear all caches
  localStorage.removeItem('local_forum_posts_cache');
  if (window.dataService) {
    window.dataService.clearCache('forum_posts');
  }
  
  // Trigger refresh event
  window.dispatchEvent(new CustomEvent('postsRefresh'));
  
  console.log('🔄 Force refresh triggered');
};