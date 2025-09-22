// Simple API monitor to verify optimization
let apiCallCount = 0;
const apiCalls = [];

if (typeof window !== 'undefined') {
  // Monitor fetch requests
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    apiCallCount++;
    const url = args[0];
    const timestamp = new Date().toISOString();
    
    apiCalls.push({ url, timestamp, type: 'fetch' });
    console.log(`🔍 API Call #${apiCallCount}: ${url}`);
    
    return originalFetch.apply(this, args);
  };

  // Global functions for debugging
  window.getApiStats = () => ({
    totalCalls: apiCallCount,
    calls: apiCalls,
    uniqueUrls: [...new Set(apiCalls.map(c => c.url))].length
  });

  window.clearApiStats = () => {
    apiCallCount = 0;
    apiCalls.length = 0;
    console.log('📊 API stats cleared');
  };

  // Auto-report after 5 seconds
  setTimeout(() => {
    const stats = window.getApiStats();
    console.group('📊 API OPTIMIZATION REPORT');
    console.log(`Total API calls: ${stats.totalCalls}`);
    console.log(`Unique URLs: ${stats.uniqueUrls}`);
    console.log('All calls:', stats.calls);
    
    if (stats.totalCalls <= 6) {
      console.log('✅ OPTIMIZATION SUCCESS: Low API call count');
    } else {
      console.warn('⚠️ OPTIMIZATION NEEDED: High API call count');
    }
    console.groupEnd();
  }, 5000);
}

export { apiCallCount, apiCalls };