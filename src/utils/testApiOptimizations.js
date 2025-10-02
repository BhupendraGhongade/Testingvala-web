// Test API Optimizations - Run this to verify fixes
import { generateApiReport, getApiStats, clearApiLogs } from './globalApiLogger';

// Test function to verify API optimizations
export const testApiOptimizations = () => {
  console.log('🧪 Testing API Optimizations...');
  
  // Wait for page to load completely
  setTimeout(() => {
    const stats = getApiStats();
    const report = generateApiReport();
    
    console.group('🎯 OPTIMIZATION TEST RESULTS');
    
    // Test 1: Total API calls should be ≤ 5 (unified approach)
    const totalCalls = stats.summary.totalCalls;
    const test1Pass = totalCalls <= 5;
    console.log(`Test 1 - Total API Calls: ${totalCalls} ${test1Pass ? '✅ PASS' : '❌ FAIL'} (Target: ≤ 5)`);
    
    // Test 2: Duplicate rate should be 0% (unified approach)
    const duplicateRate = stats.summary.duplicatePercentage;
    const test2Pass = duplicateRate === 0;
    console.log(`Test 2 - Duplicate Rate: ${duplicateRate}% ${test2Pass ? '✅ PASS' : '❌ FAIL'} (Target: 0%)`);
    
    // Test 3: Should have cache hits
    const cacheHits = Object.values(stats.byEndpoint).filter(endpoint => 
      endpoint.components.includes('cache')
    ).length;
    const test3Pass = cacheHits > 0;
    console.log(`Test 3 - Cache Hits: ${cacheHits} ${test3Pass ? '✅ PASS' : '❌ FAIL'} (Target: > 0)`);
    
    // Test 4: No more than 2 calls per endpoint
    const problematicEndpoints = Object.entries(stats.byEndpoint).filter(([, data]) => data.count > 2);
    const test4Pass = problematicEndpoints.length === 0;
    console.log(`Test 4 - Endpoint Efficiency: ${problematicEndpoints.length} problematic ${test4Pass ? '✅ PASS' : '❌ FAIL'} (Target: 0)`);
    
    // Overall result
    const allTestsPass = test1Pass && test2Pass && test3Pass && test4Pass;
    console.log(`\n🏆 OVERALL RESULT: ${allTestsPass ? '✅ ALL TESTS PASS' : '❌ SOME TESTS FAILED'}`);
    
    if (!allTestsPass) {
      console.warn('⚠️ Some optimizations may need additional work');
      console.log('Problematic endpoints:', problematicEndpoints);
    }
    
    console.groupEnd();
    
    return {
      passed: allTestsPass,
      stats,
      tests: {
        totalCalls: { value: totalCalls, pass: test1Pass, target: '≤ 5' },
        duplicateRate: { value: duplicateRate, pass: test2Pass, target: '0%' },
        cacheHits: { value: cacheHits, pass: test3Pass, target: '> 0' },
        endpointEfficiency: { value: problematicEndpoints.length, pass: test4Pass, target: '0' }
      }
    };
  }, 5000); // Wait 5 seconds for all components to load
};

// Auto-run test in development
if (import.meta.env.DEV) {
  // Run test after page load
  window.addEventListener('load', () => {
    setTimeout(testApiOptimizations, 3000);
  });
  
  // Make available globally
  window.testApiOptimizations = testApiOptimizations;
  window.generateApiReport = generateApiReport;
  window.getApiStats = getApiStats;
  window.clearApiLogs = clearApiLogs;
}

export default testApiOptimizations;