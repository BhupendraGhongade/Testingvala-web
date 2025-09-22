// Comprehensive Magic Link Flow Test
async function testMagicLinkFlow() {
  console.log('🧪 Starting Comprehensive Magic Link Flow Test\n');
  
  const baseUrl = window.location.origin;
  const testEmail = 'test@testingvala.com';
  
  console.log(`🌐 Base URL: ${baseUrl}`);
  console.log(`📧 Test Email: ${testEmail}\n`);

  // Test 1: Check if API test endpoint is accessible
  console.log('1️⃣ Testing API routing...');
  try {
    const testResponse = await fetch(`${baseUrl}/api/test`, {
      method: 'GET'
    });
    
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('✅ API routing works:', testData.message);
    } else {
      console.log('❌ API test endpoint failed:', testResponse.status);
      return false;
    }
  } catch (error) {
    console.log('❌ API test endpoint error:', error.message);
    return false;
  }

  // Test 2: Test primary magic link endpoint
  console.log('\n2️⃣ Testing primary magic link endpoint...');
  try {
    const magicLinkResponse = await fetch(`${baseUrl}/api/send-magic-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': 'test-' + Date.now()
      },
      body: JSON.stringify({
        email: testEmail,
        deviceId: 'test-device-' + Date.now()
      })
    });
    
    console.log('📊 Response status:', magicLinkResponse.status);
    console.log('📊 Response headers:', Object.fromEntries(magicLinkResponse.headers.entries()));
    
    if (magicLinkResponse.ok) {
      const magicLinkData = await magicLinkResponse.json();
      console.log('✅ Primary magic link service works:', magicLinkData);
    } else {
      const errorData = await magicLinkResponse.json().catch(() => ({}));
      console.log('⚠️ Primary service failed:', magicLinkResponse.status, errorData);
      
      // Test fallback service
      console.log('\n🔄 Testing fallback magic link endpoint...');
      const fallbackResponse = await fetch(`${baseUrl}/api/send-magic-link-fallback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: testEmail
        })
      });
      
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        console.log('✅ Fallback service works:', fallbackData);
        
        // If in development, show the magic link
        if (fallbackData.magicLink) {
          console.log('🔗 Development Magic Link:', fallbackData.magicLink);
        }
      } else {
        console.log('❌ Fallback service also failed:', fallbackResponse.status);
      }
    }
  } catch (error) {
    console.log('❌ Magic link endpoint error:', error.message);
  }

  // Test 3: Check environment variables (client-side visible ones)
  console.log('\n3️⃣ Checking environment configuration...');
  console.log('🔧 Environment variables:');
  console.log('- VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('- VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');

  // Test 4: Check localStorage and session capabilities
  console.log('\n4️⃣ Testing browser storage...');
  try {
    localStorage.setItem('test-key', 'test-value');
    const testValue = localStorage.getItem('test-key');
    localStorage.removeItem('test-key');
    console.log('✅ localStorage works:', testValue === 'test-value');
  } catch (error) {
    console.log('❌ localStorage error:', error.message);
  }

  // Test 5: Check auth service functionality
  console.log('\n5️⃣ Testing auth service...');
  try {
    if (window.authService) {
      const deviceId = window.authService.getDeviceId();
      console.log('✅ Auth service device ID:', deviceId);
      
      const authStatus = window.authService.getAuthStatus();
      console.log('✅ Auth status:', authStatus);
    } else {
      console.log('⚠️ Auth service not available on window object');
    }
  } catch (error) {
    console.log('❌ Auth service error:', error.message);
  }

  // Test 6: Network connectivity
  console.log('\n6️⃣ Testing network connectivity...');
  try {
    const networkTest = await fetch('https://httpbin.org/json', {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    
    if (networkTest.ok) {
      console.log('✅ External network connectivity works');
    } else {
      console.log('⚠️ External network test failed');
    }
  } catch (error) {
    console.log('⚠️ Network test error:', error.message);
  }

  console.log('\n🎯 Test Summary:');
  console.log('- If API routing works but magic link fails, check ZeptoMail credentials');
  console.log('- If fallback service works, consider switching to it temporarily');
  console.log('- Check Vercel deployment logs for server-side errors');
  console.log('- Ensure environment variables are set in Vercel dashboard');
  
  return true;
}

// Auto-run test if in browser
if (typeof window !== 'undefined') {
  // Make auth service available for testing
  import('./src/services/authService.js').then(module => {
    window.authService = module.authService;
    console.log('🔧 Auth service loaded for testing');
  }).catch(console.error);
  
  // Add test function to window for manual execution
  window.testMagicLinkFlow = testMagicLinkFlow;
  
  console.log('🧪 Magic Link Flow Test loaded. Run testMagicLinkFlow() to start testing.');
}

export { testMagicLinkFlow };