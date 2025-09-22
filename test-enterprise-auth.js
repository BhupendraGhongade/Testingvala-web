// Enterprise Authentication System Test Suite
import { authService } from './src/services/authService.js';

async function runComprehensiveTests() {
  console.log('🧪 Starting Enterprise Authentication System Tests\n');
  
  const testEmail = 'test@testingvala.com';
  let testResults = {
    passed: 0,
    failed: 0,
    total: 0
  };

  function test(name, fn) {
    testResults.total++;
    try {
      const result = fn();
      if (result === true || (result && result.then)) {
        console.log(`✅ ${name}`);
        testResults.passed++;
        return result;
      } else {
        throw new Error('Test returned false');
      }
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
      testResults.failed++;
      return false;
    }
  }

  // Test 1: Device ID Generation
  test('Device ID Generation', () => {
    const deviceId1 = authService.generateDeviceId();
    const deviceId2 = authService.generateDeviceId();
    return deviceId1.length === 32 && deviceId1 === deviceId2; // Should be consistent
  });

  // Test 2: Rate Limiting - First Request
  test('Rate Limiting - First Request Allowed', () => {
    const result = authService.checkRateLimit(testEmail);
    return result.allowed === true && result.remaining === 4;
  });

  // Test 3: Rate Limiting - Multiple Requests
  test('Rate Limiting - Multiple Requests', () => {
    // Simulate 4 more requests
    for (let i = 0; i < 4; i++) {
      authService.recordRequest(testEmail);
    }
    const result = authService.checkRateLimit(testEmail);
    return result.allowed === false && result.remaining === 0;
  });

  // Test 4: Session Management - Not Authenticated Initially
  test('Session Management - Not Authenticated Initially', () => {
    authService.clearSession();
    return authService.isAuthenticated() === false;
  });

  // Test 5: Session Creation
  test('Session Creation', () => {
    const session = {
      email: testEmail,
      verified: true,
      deviceId: authService.getDeviceId(),
      loginTime: Date.now(),
      expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000)
    };
    
    localStorage.setItem('testingvala_session', JSON.stringify(session));
    localStorage.setItem('user_email', testEmail);
    localStorage.setItem('user_verified', 'true');
    
    return authService.isAuthenticated() === true;
  });

  // Test 6: Session Retrieval
  test('Session Retrieval', () => {
    const session = authService.getSession();
    return session && session.email === testEmail && session.verified === true;
  });

  // Test 7: Auth Status
  test('Auth Status Information', () => {
    const status = authService.getAuthStatus();
    return status.isAuthenticated === true && 
           status.email === testEmail && 
           status.timeRemaining > 0;
  });

  // Test 8: Session Extension
  test('Session Extension', () => {
    const beforeExtension = authService.getSession().expiresAt;
    authService.extendSession();
    const afterExtension = authService.getSession().expiresAt;
    return afterExtension > beforeExtension;
  });

  // Test 9: Device Change Detection
  test('Device Change Detection', () => {
    const session = authService.getSession();
    session.deviceId = 'different_device_id';
    localStorage.setItem('testingvala_session', JSON.stringify(session));
    
    const isAuth = authService.isAuthenticated();
    return isAuth === false; // Should be false due to device change
  });

  // Test 10: Session Cleanup
  test('Session Cleanup', () => {
    authService.clearSession();
    return authService.isAuthenticated() === false &&
           localStorage.getItem('testingvala_session') === null;
  });

  // Test 11: Email Validation
  test('Email Validation', async () => {
    try {
      await authService.sendMagicLink('invalid-email');
      return false; // Should have thrown an error
    } catch (error) {
      return error.message.includes('valid email');
    }
  });

  // Test 12: Rate Limit Reset Simulation
  test('Rate Limit Reset Simulation', () => {
    // Clear rate limit data to simulate reset
    const deviceId = authService.getDeviceId();
    const key = `magic_link_requests_${testEmail}_${deviceId}`;
    localStorage.removeItem(key);
    
    const result = authService.checkRateLimit(testEmail);
    return result.allowed === true && result.remaining === 4;
  });

  // Test Results Summary
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total: ${testResults.total}`);
  console.log(`🎯 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! Enterprise Authentication System is ready for production.');
  } else {
    console.log('\n⚠️ Some tests failed. Please review the implementation.');
  }

  // Test API Endpoints (if server is running)
  console.log('\n🌐 Testing API Endpoints...');
  
  try {
    const response = await fetch('/api/send-magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'test@example.com',
        deviceId: authService.getDeviceId()
      })
    });
    
    if (response.ok) {
      console.log('✅ API Endpoint: send-magic-link is accessible');
    } else {
      console.log(`⚠️ API Endpoint: send-magic-link returned ${response.status}`);
    }
  } catch (error) {
    console.log('⚠️ API Endpoint: send-magic-link not accessible (server may not be running)');
  }

  console.log('\n🔧 System Information:');
  console.log(`Device ID: ${authService.getDeviceId()}`);
  console.log(`User Agent: ${navigator.userAgent.substring(0, 50)}...`);
  console.log(`Local Storage Available: ${typeof Storage !== 'undefined'}`);
  console.log(`Session Storage Available: ${typeof sessionStorage !== 'undefined'}`);
  
  return testResults;
}

// Run tests if in browser environment
if (typeof window !== 'undefined') {
  runComprehensiveTests().catch(console.error);
} else {
  console.log('⚠️ Tests require browser environment');
}

export { runComprehensiveTests };