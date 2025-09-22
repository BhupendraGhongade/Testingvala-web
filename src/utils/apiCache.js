import { logApiCall } from './globalApiLogger';

// Global API request cache and deduplication
const globalCache = new Map();
const pendingRequests = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const cachedRequest = async (key, requestFn, options = {}) => {
  const { cache = true, force = false, component = 'Unknown' } = options;
  
  // Log API call
  logApiCall(key, component, 'api', { cache, force });
  
  // Check cache first
  if (cache && !force) {
    const cached = globalCache.get(key);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      logApiCall(key, component, 'cache', { hit: true, age: Date.now() - cached.timestamp });
      return cached.data;
    }
  }

  // Check for pending request
  if (pendingRequests.has(key)) {
    logApiCall(key, component, 'dedupe', { pending: true });
    return await pendingRequests.get(key);
  }

  // Create and cache the request promise
  logApiCall(key, component, 'execute', { executing: true });
  const requestPromise = requestFn();
  pendingRequests.set(key, requestPromise);

  try {
    const data = await requestPromise;
    
    // Cache the result
    if (cache) {
      globalCache.set(key, { data, timestamp: Date.now() });
    }
    
    return data;
  } finally {
    pendingRequests.delete(key);
  }
};

export const clearCache = (pattern = null) => {
  if (pattern) {
    for (const key of globalCache.keys()) {
      if (key.includes(pattern)) {
        globalCache.delete(key);
      }
    }
  } else {
    globalCache.clear();
  }
};

export const getCacheStats = () => ({
  size: globalCache.size,
  keys: Array.from(globalCache.keys()),
  pending: pendingRequests.size
});