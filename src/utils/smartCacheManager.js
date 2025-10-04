// 🧠 Smart Cache Manager - Prevents localStorage quota exceeded errors
class SmartCacheManager {
  constructor() {
    this.prefix = 'tv_'; // Shorter prefix to save space
    this.maxSize = 4 * 1024 * 1024; // 4MB limit (safe for most browsers)
    this.maxAge = 30 * 60 * 1000; // 30 minutes
    this.compressionEnabled = true;
  }

  // Get current localStorage usage
  getStorageSize() {
    let total = 0;
    try {
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
    } catch (error) {
      console.warn('Could not calculate storage size:', error);
    }
    return total;
  }

  // Check if we have enough space
  hasSpace(dataSize) {
    const currentSize = this.getStorageSize();
    const availableSpace = this.maxSize - currentSize;
    return availableSpace > dataSize + 1024; // 1KB buffer
  }

  // Clean up old and large cache entries
  cleanup() {
    try {
      const keys = Object.keys(localStorage);
      const ourKeys = keys.filter(key => key.startsWith(this.prefix));
      const now = Date.now();
      
      // Remove expired entries
      ourKeys.forEach(key => {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          if (!item.timestamp || (now - item.timestamp) > this.maxAge) {
            localStorage.removeItem(key);
            console.log('🧹 Removed expired cache:', key);
          }
        } catch (error) {
          localStorage.removeItem(key);
          console.log('🧹 Removed corrupted cache:', key);
        }
      });

      // If still over limit, remove oldest entries
      if (this.getStorageSize() > this.maxSize * 0.8) {
        const remainingKeys = Object.keys(localStorage)
          .filter(key => key.startsWith(this.prefix))
          .map(key => {
            try {
              const item = JSON.parse(localStorage.getItem(key));
              return { key, timestamp: item.timestamp || 0 };
            } catch {
              return { key, timestamp: 0 };
            }
          })
          .sort((a, b) => a.timestamp - b.timestamp);

        // Remove oldest 50%
        const toRemove = remainingKeys.slice(0, Math.floor(remainingKeys.length / 2));
        toRemove.forEach(({ key }) => {
          localStorage.removeItem(key);
          console.log('🧹 Removed old cache:', key);
        });
      }
    } catch (error) {
      console.warn('Cache cleanup failed:', error);
      this.clearAll(); // Nuclear option
    }
  }

  // Compress data (simple JSON minification)
  compress(data) {
    if (!this.compressionEnabled) return data;
    
    try {
      // Remove unnecessary whitespace and compress common patterns
      let compressed = JSON.stringify(data);
      
      // Replace common patterns to save space
      compressed = compressed
        .replace(/"created_at"/g, '"ca"')
        .replace(/"updated_at"/g, '"ua"')
        .replace(/"forum_categories"/g, '"fc"')
        .replace(/"category_name"/g, '"cn"')
        .replace(/"author_name"/g, '"an"')
        .replace(/"likes_count"/g, '"lc"')
        .replace(/"replies_count"/g, '"rc"');
        
      return compressed;
    } catch (error) {
      console.warn('Compression failed:', error);
      return JSON.stringify(data);
    }
  }

  // Decompress data
  decompress(compressed) {
    if (!this.compressionEnabled) return compressed;
    
    try {
      // Restore original field names
      let restored = compressed
        .replace(/"ca"/g, '"created_at"')
        .replace(/"ua"/g, '"updated_at"')
        .replace(/"fc"/g, '"forum_categories"')
        .replace(/"cn"/g, '"category_name"')
        .replace(/"an"/g, '"author_name"')
        .replace(/"lc"/g, '"likes_count"')
        .replace(/"rc"/g, '"replies_count"');
        
      return JSON.parse(restored);
    } catch (error) {
      console.warn('Decompression failed:', error);
      return JSON.parse(compressed);
    }
  }

  // Set cache with smart management
  set(store, key, data, options = {}) {
    try {
      const cacheKey = `${this.prefix}${store}_${key}`;
      const { maxAge = this.maxAge, priority = 'normal' } = options;
      
      const cacheData = {
        data,
        timestamp: Date.now(),
        maxAge,
        priority,
        size: JSON.stringify(data).length
      };

      const compressed = this.compress(cacheData);
      const dataSize = compressed.length;

      // Check if data is too large (over 1MB for a single item)
      if (dataSize > 1024 * 1024) {
        console.warn('⚠️ Data too large for cache:', store, key, `${Math.round(dataSize/1024)}KB`);
        
        // For large datasets like forum posts, only cache essential data
        if (store === 'forum_posts' && Array.isArray(data)) {
          const essentialData = data.slice(0, 20).map(post => ({
            id: post.id,
            title: post.title,
            content: post.content?.substring(0, 200) + '...', // Truncate content
            author_name: post.author_name,
            category_name: post.category_name,
            created_at: post.created_at,
            likes_count: post.likes_count,
            replies_count: post.replies_count
          }));
          
          const essentialCacheData = {
            ...cacheData,
            data: essentialData,
            truncated: true
          };
          
          const essentialCompressed = this.compress(essentialCacheData);
          if (essentialCompressed.length < 512 * 1024) { // 512KB limit for truncated data
            localStorage.setItem(cacheKey, essentialCompressed);
            console.log('💾 Cached truncated data:', store, key, `${Math.round(essentialCompressed.length/1024)}KB`);
            return true;
          }
        }
        return false;
      }

      // Clean up if needed
      if (!this.hasSpace(dataSize)) {
        console.log('🧹 Storage full, cleaning up...');
        this.cleanup();
        
        // Check again after cleanup
        if (!this.hasSpace(dataSize)) {
          console.warn('⚠️ Still not enough space after cleanup');
          return false;
        }
      }

      localStorage.setItem(cacheKey, compressed);
      console.log('💾 Cached:', store, key, `${Math.round(dataSize/1024)}KB`);
      return true;
      
    } catch (error) {
      if (error.name === 'QuotaExceededError' || error.code === 22) {
        console.warn('🚨 localStorage quota exceeded, clearing cache...');
        this.clearAll();
        
        // Try once more with minimal data
        try {
          if (store === 'forum_posts' && Array.isArray(data)) {
            const minimalData = data.slice(0, 10).map(post => ({
              id: post.id,
              title: post.title,
              author_name: post.author_name,
              created_at: post.created_at
            }));
            
            const minimalCacheData = {
              data: minimalData,
              timestamp: Date.now(),
              minimal: true
            };
            
            localStorage.setItem(`${this.prefix}${store}_${key}`, JSON.stringify(minimalCacheData));
            console.log('💾 Cached minimal data after quota error');
            return true;
          }
        } catch (retryError) {
          console.error('Failed to cache even minimal data:', retryError);
        }
      } else {
        console.error('Cache set error:', error);
      }
      return false;
    }
  }

  // Get cache with decompression
  get(store, key) {
    try {
      const cacheKey = `${this.prefix}${store}_${key}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) return null;

      const parsed = this.decompress(cached);
      const now = Date.now();
      const maxAge = parsed.maxAge || this.maxAge;

      // Check if expired
      if (now - parsed.timestamp > maxAge) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      console.log('📦 Cache hit:', store, key, parsed.truncated ? '(truncated)' : '');
      return parsed;
      
    } catch (error) {
      console.warn('Cache get error:', error);
      // Remove corrupted cache
      try {
        localStorage.removeItem(`${this.prefix}${store}_${key}`);
      } catch (e) {}
      return null;
    }
  }

  // Clear specific store
  clear(store) {
    try {
      const keys = Object.keys(localStorage);
      const storeKeys = keys.filter(key => key.startsWith(`${this.prefix}${store}_`));
      
      storeKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log('🧹 Cleared cache store:', store, `(${storeKeys.length} items)`);
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  }

  // Clear all our cache
  clearAll() {
    try {
      const keys = Object.keys(localStorage);
      const ourKeys = keys.filter(key => key.startsWith(this.prefix));
      
      ourKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log('🧹 Cleared all cache:', `(${ourKeys.length} items)`);
    } catch (error) {
      console.warn('Cache clear all error:', error);
    }
  }

  // Get cache statistics
  getStats() {
    try {
      const keys = Object.keys(localStorage);
      const ourKeys = keys.filter(key => key.startsWith(this.prefix));
      const totalSize = this.getStorageSize();
      const ourSize = ourKeys.reduce((sum, key) => {
        return sum + (localStorage.getItem(key)?.length || 0) + key.length;
      }, 0);

      return {
        totalItems: ourKeys.length,
        totalSize: Math.round(totalSize / 1024), // KB
        ourSize: Math.round(ourSize / 1024), // KB
        maxSize: Math.round(this.maxSize / 1024), // KB
        usage: Math.round((totalSize / this.maxSize) * 100) // %
      };
    } catch (error) {
      console.warn('Could not get cache stats:', error);
      return { error: error.message };
    }
  }
}

export const smartCache = new SmartCacheManager();

// Auto cleanup on page load
if (typeof window !== 'undefined') {
  // Clean up old cache on startup
  setTimeout(() => {
    smartCache.cleanup();
  }, 1000);

  // Monitor storage usage
  setInterval(() => {
    const stats = smartCache.getStats();
    if (stats.usage > 80) {
      console.warn('⚠️ Cache usage high:', stats);
      smartCache.cleanup();
    }
  }, 5 * 60 * 1000); // Check every 5 minutes
}

export default smartCache;