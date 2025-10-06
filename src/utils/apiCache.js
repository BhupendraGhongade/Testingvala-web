// Simple API cache for monitoring
const cache = new Map();

export const getCacheStats = () => {
  return {
    size: cache.size,
    keys: Array.from(cache.keys())
  };
};

export const clearCache = () => {
  cache.clear();
};

export const setCache = (key, value) => {
  cache.set(key, value);
};

export const getCache = (key) => {
  return cache.get(key);
};