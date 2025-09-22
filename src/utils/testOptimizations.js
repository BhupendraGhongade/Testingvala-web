// Test script to verify API optimizations
import { getApiCallStats, clearApiCallLog } from './apiLogger';
import { getCacheStats } from './apiCache';

export const runOptimizationTest = () => {
  if (!import.meta.env.DEV) return;
  
  console.group('🧪 API Optimization Test Results');
  
  const apiStats = getApiCallStats();
  const cacheStats = getCacheStats();
  
  console.log('📊 API Call Statistics:');
  console.table({
    'Total Calls': apiStats.totalCalls,
    'Duplicates': apiStats.duplicates,
    'Unique Endpoints': apiStats.uniqueEndpoints,
    'Cache Size': cacheStats.size,
    'Pending Requests': cacheStats.pending
  });
  
  console.log('📈 Calls by Component:');
  console.table(apiStats.byComponent);
  
  console.log('🎯 Calls by Endpoint:');
  console.table(apiStats.byEndpoint);
  
  // Performance assessment
  const duplicateRate = (apiStats.duplicates / Math.max(apiStats.totalCalls, 1)) * 100;
  const cacheHitRate = ((cacheStats.size / Math.max(apiStats.uniqueEndpoints, 1)) * 100);
  
  console.log('🎯 Performance Metrics:');
  console.table({
    'Duplicate Rate': `${duplicateRate.toFixed(1)}%`,
    'Cache Hit Rate': `${cacheHitRate.toFixed(1)}%`,
    'Status': duplicateRate < 10 ? '✅ Optimized' : '⚠️ Needs Work'
  });
  
  if (duplicateRate > 10) {
    console.warn('⚠️ High duplicate rate detected. Check components:', 
      Object.entries(apiStats.byComponent)
        .filter(([_, count]) => count > 2)
        .map(([comp]) => comp)
    );
  }
  
  console.groupEnd();
  
  return {
    totalCalls: apiStats.totalCalls,
    duplicates: apiStats.duplicates,
    duplicateRate,
    cacheHitRate,
    isOptimized: duplicateRate < 10
  };
};

// Auto-run test after 5 seconds in development
if (import.meta.env.DEV) {
  setTimeout(() => {
    runOptimizationTest();
  }, 5000);
}