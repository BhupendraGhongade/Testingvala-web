// Simple cache manager using localStorage as fallback
class SimpleCacheManager {
  constructor() {
    this.prefix = 'testingvala_';
  }

  set(store, key, data) {
    try {
      const cacheKey = `${this.prefix}${store}_${key}`;
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Cache set failed:', error);
    }
  }

  get(store, key) {
    try {
      const cacheKey = `${this.prefix}${store}_${key}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Return data if less than 1 hour old
        if (Date.now() - parsed.timestamp < 3600000) {
          return parsed;
        }
      }
      return null;
    } catch (error) {
      console.warn('Cache get failed:', error);
      return null;
    }
  }

  clear(store) {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(`${this.prefix}${store}_`)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Cache clear failed:', error);
    }
  }

  cleanup() {
    try {
      const keys = Object.keys(localStorage);
      const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
      
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          try {
            const cached = JSON.parse(localStorage.getItem(key));
            if (cached.timestamp < cutoff) {
              localStorage.removeItem(key);
            }
          } catch (e) {
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn('Cache cleanup failed:', error);
    }
  }
}

export const cacheManager = new SimpleCacheManager();
export const STORES = {
  POSTS: 'posts',
  USERS: 'users',
  CONTESTS: 'contests'
};