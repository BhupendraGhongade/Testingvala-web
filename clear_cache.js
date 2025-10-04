// Clear cache and force refresh
console.log('🧹 Clearing all caches...');

// Clear localStorage
localStorage.removeItem('local_forum_posts');
localStorage.removeItem('posts_cleared_by_admin');
localStorage.removeItem('force_clear_posts');

// Clear any cached data
if (window.dataService) {
  window.dataService.clearCache();
  console.log('✅ DataService cache cleared');
}

// Force page refresh
console.log('🔄 Refreshing page...');
window.location.reload(true);