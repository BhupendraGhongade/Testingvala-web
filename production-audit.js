#!/usr/bin/env node

/**
 * PRODUCTION AUDIT SCRIPT
 * Comprehensive check for Supabase, ZeptoMail, and Vercel configurations
 * Run this to diagnose production issues
 */

import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const PRODUCTION_DOMAIN = 'https://testingvala.com';
const VERCEL_DOMAIN = 'https://testingvala-admin-user.vercel.app';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bold');
  console.log('='.repeat(60));
}

async function checkEnvironmentVariables() {
  section('🔧 ENVIRONMENT VARIABLES CHECK');
  
  const requiredVars = {
    'VITE_SUPABASE_URL': process.env.VITE_SUPABASE_URL,
    'VITE_SUPABASE_ANON_KEY': process.env.VITE_SUPABASE_ANON_KEY,
    'ZEPTO_API_KEY': process.env.ZEPTO_API_KEY,
    'ZEPTO_FROM_EMAIL': process.env.ZEPTO_FROM_EMAIL,
    'ZEPTO_FROM_NAME': process.env.ZEPTO_FROM_NAME
  };
  
  let allPresent = true;
  
  for (const [key, value] of Object.entries(requiredVars)) {
    if (value) {
      log(`✅ ${key}: Present`, 'green');
      if (key.includes('KEY') || key.includes('ANON')) {
        log(`   Value: ${value.substring(0, 20)}...`, 'blue');
      } else {
        log(`   Value: ${value}`, 'blue');
      }
    } else {
      log(`❌ ${key}: Missing`, 'red');
      allPresent = false;
    }
  }
  
  return allPresent;
}

async function checkSupabaseConfiguration() {
  section('🗄️ SUPABASE CONFIGURATION CHECK');
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    log('❌ Supabase credentials missing', 'red');
    return false;
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test connection
    log('🔍 Testing Supabase connection...', 'blue');
    const { data, error } = await supabase.from('website_content').select('id').limit(1);
    
    if (error) {
      log(`❌ Supabase connection failed: ${error.message}`, 'red');
      return false;
    }
    
    log('✅ Supabase connection successful', 'green');
    
    // Check auth configuration
    log('🔍 Checking auth configuration...', 'blue');
    
    // Check if magic_link_tokens table exists
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'magic_link_tokens');
    
    if (tableError || !tables || tables.length === 0) {
      log('❌ magic_link_tokens table not found', 'red');
      log('   Run: supabase-auth-config.sql in your Supabase dashboard', 'yellow');
    } else {
      log('✅ magic_link_tokens table exists', 'green');
    }
    
    // Check auth functions
    const { data: functions, error: funcError } = await supabase.rpc('generate_magic_link_token', { user_email: 'test@example.com' });
    
    if (funcError) {
      log(`❌ Auth functions not configured: ${funcError.message}`, 'red');
      log('   Run: supabase-auth-config.sql in your Supabase dashboard', 'yellow');
    } else {
      log('✅ Auth functions configured', 'green');
    }
    
    return true;
    
  } catch (error) {
    log(`❌ Supabase check failed: ${error.message}`, 'red');
    return false;
  }
}

async function checkSupabaseAuthRedirects() {
  section('🔗 SUPABASE AUTH REDIRECT URLS CHECK');
  
  const expectedUrls = [
    `${PRODUCTION_DOMAIN}/auth/verify`,
    `${VERCEL_DOMAIN}/auth/verify`,
    'http://localhost:5173/auth/verify'
  ];
  
  log('Expected redirect URLs in Supabase dashboard:', 'blue');
  expectedUrls.forEach(url => {
    log(`   • ${url}`, 'blue');
  });
  
  log('\n📋 Manual Check Required:', 'yellow');
  log('1. Go to Supabase Dashboard > Authentication > URL Configuration', 'yellow');
  log('2. Ensure Site URL is set to: ' + PRODUCTION_DOMAIN, 'yellow');
  log('3. Add all redirect URLs listed above', 'yellow');
  log('4. Disable email confirmations in Authentication > Settings', 'yellow');
  
  return true;
}

async function checkZeptoMailConfiguration() {
  section('📧 ZEPTOMAIL CONFIGURATION CHECK');
  
  const apiKey = process.env.ZEPTO_API_KEY;
  const fromEmail = process.env.ZEPTO_FROM_EMAIL;
  
  if (!apiKey || !fromEmail) {
    log('❌ ZeptoMail credentials missing', 'red');
    return false;
  }
  
  try {
    // Test ZeptoMail API
    log('🔍 Testing ZeptoMail API connection...', 'blue');
    
    const response = await fetch('https://api.zeptomail.in/v1.1/email', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: { address: fromEmail, name: 'TestingVala Test' },
        to: [{ email_address: { address: 'test@testingvala.com' } }],
        subject: 'Production Audit Test - DO NOT SEND',
        htmlbody: '<p>This is a test email for production audit</p>',
        track_clicks: false,
        track_opens: false
      })
    });
    
    const result = await response.text();\n    \n    if (response.status === 400 && result.includes('sandbox')) {\n      log('❌ ZeptoMail is in SANDBOX mode', 'red');\n      log('   Action: Disable sandbox mode in ZeptoMail dashboard', 'yellow');\n      return false;\n    } else if (response.status === 401) {\n      log('❌ ZeptoMail API key invalid', 'red');\n      return false;\n    } else if (response.status === 200 || response.status === 202) {\n      log('✅ ZeptoMail API connection successful', 'green');\n    } else {\n      log(`⚠️ ZeptoMail API returned status: ${response.status}`, 'yellow');\n      log(`   Response: ${result}`, 'blue');\n    }\n    \n    return true;\n    \n  } catch (error) {\n    log(`❌ ZeptoMail check failed: ${error.message}`, 'red');\n    return false;\n  }\n}\n\nasync function checkDNSRecords() {\n  section('🌐 DNS RECORDS CHECK');\n  \n  const domain = 'testingvala.com';\n  \n  log('📋 Manual DNS Check Required:', 'yellow');\n  log(`For domain: ${domain}`, 'blue');\n  log('\\nRequired DNS records:', 'yellow');\n  log('1. SPF Record:', 'yellow');\n  log('   TXT: \"v=spf1 include:zeptomail.in ~all\"', 'blue');\n  log('2. DKIM Record:', 'yellow');\n  log('   Check ZeptoMail dashboard for DKIM values', 'blue');\n  log('3. DMARC Record:', 'yellow');\n  log('   TXT: \"v=DMARC1; p=none; rua=mailto:dmarc@testingvala.com\"', 'blue');\n  \n  log('\\n🔍 To verify DNS records:', 'yellow');\n  log(`   dig TXT ${domain}`, 'blue');\n  log(`   nslookup -type=TXT ${domain}`, 'blue');\n  \n  return true;\n}\n\nasync function checkVercelDeployment() {\n  section('🚀 VERCEL DEPLOYMENT CHECK');\n  \n  try {\n    // Check if site is accessible\n    log('🔍 Testing production site accessibility...', 'blue');\n    \n    const response = await fetch(PRODUCTION_DOMAIN, {\n      method: 'HEAD',\n      timeout: 10000\n    });\n    \n    if (response.ok) {\n      log(`✅ Production site accessible: ${PRODUCTION_DOMAIN}`, 'green');\n    } else {\n      log(`❌ Production site returned: ${response.status}`, 'red');\n    }\n    \n    // Check API endpoints\n    log('🔍 Testing API endpoints...', 'blue');\n    \n    const apiResponse = await fetch(`${PRODUCTION_DOMAIN}/api/health`, {\n      timeout: 10000\n    });\n    \n    if (apiResponse.ok) {\n      log('✅ API endpoints accessible', 'green');\n    } else {\n      log(`❌ API endpoints failed: ${apiResponse.status}`, 'red');\n    }\n    \n    return true;\n    \n  } catch (error) {\n    log(`❌ Vercel deployment check failed: ${error.message}`, 'red');\n    return false;\n  }\n}\n\nasync function testMagicLinkFlow() {\n  section('🔐 MAGIC LINK FLOW TEST');\n  \n  const testEmail = 'test@testingvala.com';\n  \n  try {\n    log(`🔍 Testing magic link generation for: ${testEmail}`, 'blue');\n    \n    const response = await fetch(`${PRODUCTION_DOMAIN}/api/send-magic-link`, {\n      method: 'POST',\n      headers: {\n        'Content-Type': 'application/json'\n      },\n      body: JSON.stringify({\n        email: testEmail,\n        deviceId: 'audit-test-device'\n      })\n    });\n    \n    const result = await response.json();\n    \n    if (response.ok && result.success) {\n      log('✅ Magic link API working', 'green');\n      log(`   Message ID: ${result.messageId}`, 'blue');\n      \n      if (result.magicLink) {\n        log(`   🔗 Magic Link: ${result.magicLink}`, 'blue');\n      }\n    } else {\n      log(`❌ Magic link API failed: ${result.error || 'Unknown error'}`, 'red');\n    }\n    \n    return response.ok;\n    \n  } catch (error) {\n    log(`❌ Magic link test failed: ${error.message}`, 'red');\n    return false;\n  }\n}\n\nasync function generateAuditReport() {\n  section('📊 PRODUCTION AUDIT REPORT');\n  \n  log('Starting comprehensive production audit...', 'blue');\n  \n  const results = {\n    environment: await checkEnvironmentVariables(),\n    supabase: await checkSupabaseConfiguration(),\n    redirects: await checkSupabaseAuthRedirects(),\n    zeptomail: await checkZeptoMailConfiguration(),\n    dns: await checkDNSRecords(),\n    vercel: await checkVercelDeployment(),\n    magicLink: await testMagicLinkFlow()\n  };\n  \n  section('📋 AUDIT SUMMARY');\n  \n  const passed = Object.values(results).filter(Boolean).length;\n  const total = Object.keys(results).length;\n  \n  log(`\\nOverall Status: ${passed}/${total} checks passed`, passed === total ? 'green' : 'red');\n  \n  Object.entries(results).forEach(([check, passed]) => {\n    const status = passed ? '✅ PASS' : '❌ FAIL';\n    const color = passed ? 'green' : 'red';\n    log(`${status} ${check.toUpperCase()}`, color);\n  });\n  \n  if (passed < total) {\n    section('🔧 RECOMMENDED FIXES');\n    \n    if (!results.environment) {\n      log('1. Set missing environment variables in Vercel dashboard', 'yellow');\n    }\n    \n    if (!results.supabase) {\n      log('2. Run supabase-auth-config.sql in Supabase dashboard', 'yellow');\n      log('3. Check Supabase RLS policies and permissions', 'yellow');\n    }\n    \n    if (!results.zeptomail) {\n      log('4. Disable ZeptoMail sandbox mode', 'yellow');\n      log('5. Verify ZeptoMail API key and domain verification', 'yellow');\n    }\n    \n    if (!results.vercel) {\n      log('6. Check Vercel deployment logs', 'yellow');\n      log('7. Verify domain configuration in Vercel', 'yellow');\n    }\n    \n    if (!results.magicLink) {\n      log('8. Test magic link flow manually', 'yellow');\n      log('9. Check API endpoint logs in Vercel', 'yellow');\n    }\n  } else {\n    log('\\n🎉 All checks passed! Your production setup looks good.', 'green');\n  }\n  \n  section('📞 SUPPORT INFORMATION');\n  log('If issues persist:', 'blue');\n  log('1. Check Vercel function logs', 'yellow');\n  log('2. Check Supabase logs in dashboard', 'yellow');\n  log('3. Check ZeptoMail delivery logs', 'yellow');\n  log('4. Test with a real email address', 'yellow');\n  \n  return results;\n}\n\n// Run the audit\nif (import.meta.url === `file://${process.argv[1]}`) {\n  generateAuditReport().catch(console.error);\n}\n\nexport { generateAuditReport };\n