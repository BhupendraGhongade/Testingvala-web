#!/usr/bin/env node

// PRODUCTION EMAIL DIAGNOSTIC SCRIPT
// Run this to identify the exact issue with magic link emails

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Configuration check
const config = {
  supabaseUrl: process.env.VITE_SUPABASE_URL,
  supabaseKey: process.env.VITE_SUPABASE_ANON_KEY,
  zeptoApiKey: process.env.ZEPTO_API_KEY,
  zeptoFromEmail: process.env.ZEPTO_FROM_EMAIL || 'info@testingvala.com',
  zeptoFromName: process.env.ZEPTO_FROM_NAME || 'TestingVala'
};

console.log('🔍 PRODUCTION EMAIL DIAGNOSTIC REPORT');
console.log('=====================================\n');

// 1. Environment Variables Check
console.log('1. ENVIRONMENT VARIABLES CHECK:');
console.log('--------------------------------');
console.log(`✅ VITE_SUPABASE_URL: ${config.supabaseUrl ? 'Present' : '❌ MISSING'}`);
console.log(`✅ VITE_SUPABASE_ANON_KEY: ${config.supabaseKey ? 'Present' : '❌ MISSING'}`);
console.log(`✅ ZEPTO_API_KEY: ${config.zeptoApiKey ? 'Present' : '❌ MISSING'}`);
console.log(`✅ ZEPTO_FROM_EMAIL: ${config.zeptoFromEmail}`);
console.log(`✅ ZEPTO_FROM_NAME: ${config.zeptoFromName}\n`);

// 2. Supabase Connection Test
async function testSupabaseConnection() {
  console.log('2. SUPABASE CONNECTION TEST:');
  console.log('-----------------------------');
  
  if (!config.supabaseUrl || !config.supabaseKey) {
    console.log('❌ Cannot test - missing Supabase credentials\n');
    return false;
  }
  
  try {
    const supabase = createClient(config.supabaseUrl, config.supabaseKey);
    
    // Test basic connection
    const { data, error } = await supabase.from('website_content').select('id').limit(1);
    
    if (error) {
      console.log(`❌ Connection failed: ${error.message}\n`);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    
    // Test magic link function
    try {
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_magic_link_token', {
          user_email: 'test@example.com'
        });
      
      if (tokenError) {
        console.log(`❌ Magic link function failed: ${tokenError.message}`);
        console.log('   This indicates the Supabase function is not properly configured');
        return false;
      }
      
      console.log('✅ Magic link token generation working');
      console.log(`   Token generated: ${tokenData?.token ? 'Yes' : 'No'}\n`);
      return true;
      
    } catch (funcError) {
      console.log(`❌ Magic link function error: ${funcError.message}`);
      console.log('   The generate_magic_link_token function may not exist\n');
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Supabase test failed: ${error.message}\n`);
    return false;
  }
}

// 3. ZeptoMail API Test
async function testZeptoMailAPI() {
  console.log('3. ZEPTOMAIL API TEST:');
  console.log('----------------------');
  
  if (!config.zeptoApiKey) {
    console.log('❌ Cannot test - missing ZeptoMail API key\n');
    return false;
  }
  
  try {
    const testPayload = {
      from: { 
        address: config.zeptoFromEmail, 
        name: config.zeptoFromName 
      },
      to: [{ 
        email_address: { 
          address: 'test@example.com' 
        } 
      }],
      subject: 'Test Email - Diagnostic',
      htmlbody: '<h1>Test Email</h1><p>This is a test email from diagnostic script.</p>'
    };
    
    console.log('📤 Testing ZeptoMail API connection...');
    
    const response = await fetch('https://api.zeptomail.in/v1.1/email', {
      method: 'POST',
      headers: {
        'Authorization': config.zeptoApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log(`📊 Response Status: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ ZeptoMail API connection successful');
      console.log(`   Message ID: ${result.data?.[0]?.message_id || 'N/A'}\n`);
      return true;
    } else {
      const errorText = await response.text();
      console.log(`❌ ZeptoMail API failed: ${response.status}`);
      console.log(`   Error: ${errorText}`);
      
      // Check for specific errors
      if (errorText.includes('sandbox')) {
        console.log('   🚨 ISSUE: ZeptoMail is in SANDBOX MODE');
        console.log('   SOLUTION: Disable sandbox mode in ZeptoMail dashboard');
      } else if (response.status === 401) {
        console.log('   🚨 ISSUE: Invalid API key or authentication failed');
        console.log('   SOLUTION: Check ZEPTO_API_KEY in environment variables');
      } else if (errorText.includes('domain')) {
        console.log('   🚨 ISSUE: Domain not verified in ZeptoMail');
        console.log('   SOLUTION: Verify testingvala.com domain in ZeptoMail dashboard');
      }
      console.log('');
      return false;
    }
    
  } catch (error) {
    console.log(`❌ ZeptoMail test failed: ${error.message}\n`);
    return false;
  }
}

// 4. Vercel Environment Check
function checkVercelEnvironment() {
  console.log('4. VERCEL ENVIRONMENT CHECK:');
  console.log('-----------------------------');
  
  const isVercel = process.env.VERCEL === '1';
  const vercelEnv = process.env.VERCEL_ENV;
  
  console.log(`✅ Running on Vercel: ${isVercel ? 'Yes' : 'No'}`);
  console.log(`✅ Vercel Environment: ${vercelEnv || 'Not detected'}`);
  
  if (isVercel) {
    console.log('✅ Production environment detected');
    
    // Check if all required env vars are present in production
    const requiredVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY', 
      'ZEPTO_API_KEY',
      'ZEPTO_FROM_EMAIL'
    ];
    
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.log(`❌ Missing environment variables in Vercel:`);
      missingVars.forEach(varName => console.log(`   - ${varName}`));
      console.log('   SOLUTION: Add these variables in Vercel dashboard\n');
      return false;
    } else {
      console.log('✅ All required environment variables present\n');
      return true;
    }
  } else {
    console.log('ℹ️  Not running on Vercel - local environment\n');
    return true;
  }
}

// 5. DNS and Domain Check
async function checkDomainConfiguration() {
  console.log('5. DOMAIN CONFIGURATION CHECK:');
  console.log('-------------------------------');
  
  try {
    // Check if domain is accessible
    const response = await fetch('https://testingvala.com', { 
      method: 'HEAD',
      timeout: 5000 
    });
    
    console.log(`✅ Domain accessible: ${response.ok ? 'Yes' : 'No'}`);
    
    // Note: DNS record checking would require additional tools
    console.log('ℹ️  DNS Records (manual check required):');
    console.log('   - SPF: v=spf1 include:zeptomail.zoho.com ~all');
    console.log('   - DKIM: zeptomail._domainkey CNAME zeptomail.zoho.com');
    console.log('   - DMARC: v=DMARC1; p=quarantine; rua=mailto:dmarc@testingvala.com\n');
    
    return true;
  } catch (error) {
    console.log(`❌ Domain check failed: ${error.message}\n`);
    return false;
  }
}

// Main diagnostic function
async function runDiagnostics() {
  console.log(`🕐 Started at: ${new Date().toISOString()}\n`);
  
  const results = {
    environment: checkVercelEnvironment(),
    supabase: await testSupabaseConnection(),
    zeptomail: await testZeptoMailAPI(),
    domain: await checkDomainConfiguration()
  };
  
  console.log('📋 DIAGNOSTIC SUMMARY:');
  console.log('=======================');
  console.log(`Environment Setup: ${results.environment ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Supabase Connection: ${results.supabase ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`ZeptoMail API: ${results.zeptomail ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Domain Configuration: ${results.domain ? '✅ PASS' : '❌ FAIL'}\n`);
  
  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('   Your email system should be working correctly.');
    console.log('   If you\'re still experiencing issues, check Supabase logs for the specific requestId.');
  } else {
    console.log('🚨 ISSUES DETECTED!');
    console.log('   Please fix the failed tests above and redeploy.');
    
    // Provide specific solutions
    if (!results.supabase) {
      console.log('\n🔧 SUPABASE FIXES:');
      console.log('   1. Run the SQL setup script in Supabase SQL Editor');
      console.log('   2. Ensure generate_magic_link_token function exists');
      console.log('   3. Check RLS policies on auth tables');
    }
    
    if (!results.zeptomail) {
      console.log('\n🔧 ZEPTOMAIL FIXES:');
      console.log('   1. Verify domain in ZeptoMail dashboard');
      console.log('   2. Disable sandbox mode');
      console.log('   3. Check API key is correct and active');
      console.log('   4. Ensure from email matches verified domain');
    }
    
    if (!results.environment) {
      console.log('\n🔧 VERCEL FIXES:');
      console.log('   1. Add missing environment variables in Vercel dashboard');
      console.log('   2. Redeploy after adding variables');
      console.log('   3. Check variable names match exactly');
    }
  }
  
  console.log(`\n🕐 Completed at: ${new Date().toISOString()}`);
  console.log('=====================================');
}

// Run diagnostics
runDiagnostics().catch(error => {
  console.error('❌ Diagnostic script failed:', error);
  process.exit(1);
});