#!/usr/bin/env node

// Comprehensive Magic Link System Test
// Run with: node test-magic-link-system.js

const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const CONFIG = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  supabaseUrl: process.env.VITE_SUPABASE_URL,
  supabaseKey: process.env.VITE_SUPABASE_ANON_KEY,
  zeptoApiKey: process.env.ZEPTO_API_KEY,
  testEmail: process.env.TEST_EMAIL || 'test@testingvala.com'
};

console.log('🧪 Magic Link System Test Suite');
console.log('================================');
console.log('Configuration:', {
  baseUrl: CONFIG.baseUrl,
  hasSupabase: !!(CONFIG.supabaseUrl && CONFIG.supabaseKey),
  hasZepto: !!CONFIG.zeptoApiKey,
  testEmail: CONFIG.testEmail
});
console.log('');

// Test 1: Environment Variables
async function testEnvironment() {
  console.log('📋 Test 1: Environment Variables');
  console.log('-'.repeat(40));
  
  const checks = {
    'Supabase URL': !!CONFIG.supabaseUrl,
    'Supabase Key': !!CONFIG.supabaseKey,
    'ZeptoMail API Key': !!CONFIG.zeptoApiKey,
    'Test Email': !!CONFIG.testEmail
  };
  
  let passed = 0;
  for (const [check, result] of Object.entries(checks)) {
    console.log(`${result ? '✅' : '❌'} ${check}: ${result ? 'Present' : 'Missing'}`);
    if (result) passed++;
  }
  
  console.log(`\nResult: ${passed}/${Object.keys(checks).length} checks passed\n`);
  return passed === Object.keys(checks).length;
}

// Test 2: Supabase Connection
async function testSupabaseConnection() {
  console.log('🔗 Test 2: Supabase Connection');
  console.log('-'.repeat(40));
  
  if (!CONFIG.supabaseUrl || !CONFIG.supabaseKey) {
    console.log('❌ Skipping - Supabase credentials missing\n');
    return false;
  }
  
  try {
    const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);
    
    // Test basic connection
    const { data, error } = await supabase.from('magic_link_tokens').select('count').limit(1);
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      console.log('💡 Hint: Run the SQL setup script first\n');
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    
    // Test custom functions
    try {
      const { data: funcData, error: funcError } = await supabase.rpc('generate_magic_link_token', {
        user_email: CONFIG.testEmail
      });
      
      if (funcError) {
        console.log('❌ Custom function test failed:', funcError.message);
        console.log('💡 Hint: Run the SQL setup script to create functions\n');
        return false;
      }
      
      console.log('✅ Custom functions working');
      console.log('✅ Token generated:', funcData.token.substring(0, 8) + '...\n');
      return true;
    } catch (funcErr) {
      console.log('❌ Function test error:', funcErr.message, '\n');
      return false;
    }
  } catch (err) {
    console.log('❌ Supabase test failed:', err.message, '\n');
    return false;
  }
}

// Test 3: ZeptoMail API
async function testZeptoMailAPI() {
  console.log('📧 Test 3: ZeptoMail API');
  console.log('-'.repeat(40));
  
  if (!CONFIG.zeptoApiKey) {
    console.log('❌ Skipping - ZeptoMail API key missing\n');
    return false;
  }
  
  try {
    const testPayload = {
      from: { address: 'info@testingvala.com', name: 'TestingVala Test' },
      to: [{ email_address: { address: CONFIG.testEmail } }],
      subject: 'ZeptoMail API Test',
      htmlbody: '<h1>Test Email</h1><p>This is a test email from the Magic Link system.</p>'
    };
    
    const response = await fetch('https://api.zeptomail.in/v1.1/email', {\n      method: 'POST',\n      headers: {\n        'Authorization': CONFIG.zeptoApiKey,\n        'Content-Type': 'application/json'\n      },\n      body: JSON.stringify(testPayload)\n    });\n    \n    if (response.ok) {\n      const result = await response.json();\n      console.log('✅ ZeptoMail API test successful');\n      console.log('✅ Message ID:', result.data?.[0]?.message_id);\n      console.log('✅ Test email sent to:', CONFIG.testEmail, '\\n');\n      return true;\n    } else {\n      const errorText = await response.text();\n      console.log('❌ ZeptoMail API test failed:', response.status);\n      console.log('❌ Error:', errorText, '\\n');\n      return false;\n    }\n  } catch (err) {\n    console.log('❌ ZeptoMail test error:', err.message, '\\n');\n    return false;\n  }\n}\n\n// Test 4: Magic Link API Endpoint\nasync function testMagicLinkAPI() {\n  console.log('🔗 Test 4: Magic Link API Endpoint');\n  console.log('-'.repeat(40));\n  \n  try {\n    const response = await fetch(`${CONFIG.baseUrl}/api/send-magic-link-enhanced`, {\n      method: 'POST',\n      headers: {\n        'Content-Type': 'application/json'\n      },\n      body: JSON.stringify({\n        email: CONFIG.testEmail,\n        deviceId: 'test-device-123'\n      })\n    });\n    \n    if (response.ok) {\n      const result = await response.json();\n      console.log('✅ Magic Link API test successful');\n      console.log('✅ Provider:', result.provider);\n      console.log('✅ Message ID:', result.messageId);\n      \n      if (result.magicLink) {\n        console.log('🔗 Magic Link (dev mode):', result.magicLink);\n      }\n      \n      console.log('');\n      return { success: true, result };\n    } else {\n      const errorText = await response.text();\n      console.log('❌ Magic Link API test failed:', response.status);\n      console.log('❌ Error:', errorText, '\\n');\n      return { success: false };\n    }\n  } catch (err) {\n    console.log('❌ Magic Link API test error:', err.message, '\\n');\n    return { success: false };\n  }\n}\n\n// Test 5: Token Verification\nasync function testTokenVerification(magicLinkResult) {\n  console.log('🔐 Test 5: Token Verification');\n  console.log('-'.repeat(40));\n  \n  if (!magicLinkResult.success || !magicLinkResult.result.token) {\n    console.log('❌ Skipping - No token from previous test\\n');\n    return false;\n  }\n  \n  try {\n    const token = magicLinkResult.result.token;\n    const verifyUrl = `${CONFIG.baseUrl}/api/verify-token?token=${token}&email=${encodeURIComponent(CONFIG.testEmail)}`;\n    \n    const response = await fetch(verifyUrl, {\n      method: 'GET',\n      redirect: 'manual' // Don't follow redirects\n    });\n    \n    if (response.status === 302) {\n      const location = response.headers.get('location');\n      console.log('✅ Token verification successful');\n      console.log('✅ Redirect URL:', location);\n      \n      if (location.includes('success=true')) {\n        console.log('✅ Verification completed successfully\\n');\n        return true;\n      } else {\n        console.log('❌ Verification failed - check redirect URL\\n');\n        return false;\n      }\n    } else {\n      console.log('❌ Token verification failed:', response.status);\n      const errorText = await response.text();\n      console.log('❌ Error:', errorText, '\\n');\n      return false;\n    }\n  } catch (err) {\n    console.log('❌ Token verification error:', err.message, '\\n');\n    return false;\n  }\n}\n\n// Main test runner\nasync function runTests() {\n  console.log('Starting comprehensive Magic Link system tests...\\n');\n  \n  const results = {\n    environment: await testEnvironment(),\n    supabase: await testSupabaseConnection(),\n    zeptomail: await testZeptoMailAPI(),\n    magiclink: await testMagicLinkAPI(),\n    verification: false\n  };\n  \n  // Only test verification if magic link test passed\n  if (results.magiclink.success) {\n    results.verification = await testTokenVerification(results.magiclink);\n  }\n  \n  // Summary\n  console.log('📊 Test Summary');\n  console.log('='.repeat(40));\n  \n  const testNames = {\n    environment: 'Environment Variables',\n    supabase: 'Supabase Connection',\n    zeptomail: 'ZeptoMail API',\n    magiclink: 'Magic Link API',\n    verification: 'Token Verification'\n  };\n  \n  let passed = 0;\n  let total = 0;\n  \n  for (const [key, name] of Object.entries(testNames)) {\n    const result = results[key];\n    const success = typeof result === 'object' ? result.success : result;\n    console.log(`${success ? '✅' : '❌'} ${name}: ${success ? 'PASSED' : 'FAILED'}`);\n    if (success) passed++;\n    total++;\n  }\n  \n  console.log('');\n  console.log(`Overall Result: ${passed}/${total} tests passed`);\n  \n  if (passed === total) {\n    console.log('🎉 All tests passed! Your Magic Link system is ready for production.');\n  } else {\n    console.log('⚠️  Some tests failed. Please check the configuration and setup.');\n    \n    // Provide specific guidance\n    if (!results.environment) {\n      console.log('\\n💡 Next steps:');\n      console.log('1. Set up environment variables in .env file');\n      console.log('2. Configure ZeptoMail API key');\n      console.log('3. Set up Supabase project and credentials');\n    }\n    \n    if (!results.supabase) {\n      console.log('\\n💡 Supabase setup:');\n      console.log('1. Run the SQL setup script in your Supabase dashboard');\n      console.log('2. Check your Supabase URL and API key');\n    }\n    \n    if (!results.zeptomail) {\n      console.log('\\n💡 ZeptoMail setup:');\n      console.log('1. Verify your domain in ZeptoMail dashboard');\n      console.log('2. Check your API key format');\n      console.log('3. Ensure DNS records are properly configured');\n    }\n  }\n  \n  process.exit(passed === total ? 0 : 1);\n}\n\n// Run tests\nrunTests().catch(err => {\n  console.error('❌ Test runner failed:', err);\n  process.exit(1);\n});