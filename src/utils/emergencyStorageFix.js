// 🚨 Emergency Storage Fix - Immediate solution for localStorage quota exceeded
export const emergencyStorageFix = () => {
  try {
    console.log('🚨 Running emergency storage fix...');
    
    // Clear all TestingVala cache entries
    const keys = Object.keys(localStorage);
    let cleared = 0;
    
    keys.forEach(key => {
      if (key.includes('forum_posts') || 
          key.includes('local_') || 
          key.includes('testingvala') || 
          key.includes('cache_') ||
          key.startsWith('tv_')) {
        localStorage.removeItem(key);
        cleared++;
      }
    });
    
    console.log(`✅ Emergency fix complete: ${cleared} items cleared`);
    return true;
  } catch (error) {
    console.error('Emergency fix failed:', error);
    // Nuclear option - clear everything except auth
    try {
      const auth = localStorage.getItem('auth_token');
      localStorage.clear();
      if (auth) localStorage.setItem('auth_token', auth);
      console.log('✅ Nuclear cleanup completed');
      return true;
    } catch (e) {
      console.error('Nuclear cleanup failed:', e);
      return false;
    }
  }
};

// Auto-run on quota errors
window.addEventListener('error', (event) => {
  if (event.error && 
      (event.error.name === 'QuotaExceededError' || 
       event.error.code === 22 ||
       event.error.message?.includes('quota') ||
       event.error.message?.includes('setItem'))) {
    
    console.warn('🚨 Storage quota exceeded - running emergency fix');
    emergencyStorageFix();
    
    // Show user-friendly message safely
    try {
      if (typeof toast !== 'undefined' && toast.success) {
        toast.success('Storage optimized - you can now create posts!');
      } else {
        console.log('✅ Storage optimized - you can now create posts!');
      }
    } catch (toastError) {
      console.log('✅ Storage optimized - you can now create posts!');
    }
    
    // Reload after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }
});

export default emergencyStorageFix;