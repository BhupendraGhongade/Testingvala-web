// 🧹 Storage Cleanup Utility - Fixes localStorage quota exceeded errors

export class StorageCleanup {
  static cleanup() {
    try {
      console.log('🧹 Starting localStorage cleanup...');
      
      // Get all keys
      const keys = Object.keys(localStorage);
      let removedCount = 0;
      let freedSpace = 0;
      
      // Remove old TestingVala cache entries
      keys.forEach(key => {
        if (key.startsWith('testingvala_') || 
            key.startsWith('local_') || 
            key.startsWith('cache_') ||
            key.includes('forum_posts') ||
            key.includes('categories')) {
          
          const size = localStorage.getItem(key)?.length || 0;
          localStorage.removeItem(key);
          removedCount++;
          freedSpace += size;
        }
      });
      
      // Remove expired entries (older than 24 hours)
      const cutoff = Date.now() - (24 * 60 * 60 * 1000);
      keys.forEach(key => {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const parsed = JSON.parse(item);
            if (parsed.timestamp && parsed.timestamp < cutoff) {
              localStorage.removeItem(key);
              removedCount++;
              freedSpace += item.length;
            }
          }
        } catch (e) {
          // Remove corrupted entries
          localStorage.removeItem(key);
          removedCount++;
        }
      });
      
      console.log(`✅ Cleanup complete: ${removedCount} items removed, ${Math.round(freedSpace/1024)}KB freed`);
      return { removedCount, freedSpace };
      
    } catch (error) {
      console.error('Cleanup failed:', error);
      return { error: error.message };
    }
  }
  
  static emergencyCleanup() {
    try {
      console.warn('🚨 Emergency cleanup - clearing all localStorage');
      
      // Keep only essential items
      const essential = {};
      const keepKeys = ['auth_token', 'user_preferences', 'theme'];
      
      keepKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          essential[key] = value;
        }
      });
      
      // Clear everything
      localStorage.clear();
      
      // Restore essential items
      Object.entries(essential).forEach(([key, value]) => {
        try {
          localStorage.setItem(key, value);
        } catch (e) {
          console.warn('Could not restore:', key);
        }
      });
      
      console.log('✅ Emergency cleanup complete');
      return true;
      
    } catch (error) {
      console.error('Emergency cleanup failed:', error);
      return false;
    }
  }
  
  static getStorageInfo() {
    try {
      let total = 0;
      let itemCount = 0;
      const breakdown = {};
      
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          const size = localStorage[key].length + key.length;
          total += size;
          itemCount++;
          
          // Categorize by prefix
          const prefix = key.split('_')[0];
          breakdown[prefix] = (breakdown[prefix] || 0) + size;
        }
      }
      
      return {
        totalSize: Math.round(total / 1024), // KB
        itemCount,
        breakdown: Object.entries(breakdown)
          .map(([prefix, size]) => ({ prefix, size: Math.round(size / 1024) }))
          .sort((a, b) => b.size - a.size)
      };
      
    } catch (error) {
      return { error: error.message };
    }
  }
  
  static monitorStorage() {
    const info = this.getStorageInfo();
    const maxSize = 5 * 1024; // 5MB typical limit
    
    if (info.totalSize > maxSize * 0.8) {
      console.warn('⚠️ localStorage usage high:', info);
      this.cleanup();
    }
    
    return info;
  }
}

// Auto-cleanup on page load
if (typeof window !== 'undefined') {
  // Clean up on startup
  setTimeout(() => {
    StorageCleanup.cleanup();
  }, 2000);
  
  // Monitor every 10 minutes
  setInterval(() => {
    StorageCleanup.monitorStorage();
  }, 10 * 60 * 1000);
  
  // Handle quota exceeded errors globally
  window.addEventListener('error', (event) => {
    if (event.error && 
        (event.error.name === 'QuotaExceededError' || 
         event.error.code === 22 ||
         event.error.message?.includes('quota'))) {
      
      console.warn('🚨 Quota exceeded error detected, running emergency cleanup');
      StorageCleanup.emergencyCleanup();
      
      // Reload page after cleanup
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  });
}

export default StorageCleanup;