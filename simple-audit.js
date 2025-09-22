#!/usr/bin/env node

/**
 * SIMPLE PRODUCTION AUDIT
 */

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const PRODUCTION_URL = 'https://testingvala.com';

async function runSimpleAudit() {
  console.log('🔍 PRODUCTION AUDIT');
  console.log('='.repeat(40));
  
  // Check environment
  console.log('\n🔧 ENVIRONMENT:');
  console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
  console.log('ZEPTO_API_KEY:', process.env.ZEPTO_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('ZEPTO_FROM_EMAIL:', process.env.ZEPTO_FROM_EMAIL || '❌ Missing');
  
  // Test Supabase
  console.log('\n🗄️ SUPABASE:');
  if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY) {
    try {
      const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
      const { data, error } = await supabase.from('website_content').select('id').limit(1);
      
      if (error) {
        console.log('❌ Connection failed:', error.message);
      } else {
        console.log('✅ Connection working');
        
        // Test auth functions
        try {
          const { data: authTest, error: authError } = await supabase.rpc('generate_magic_link_token', {
            user_email: 'test@example.com'
          });
          
          if (authError) {
            console.log('❌ Auth functions missing:', authError.message);
          } else {
            console.log('✅ Auth functions working');
          }
        } catch (e) {
          console.log('❌ Auth functions error:', e.message);
        }
      }
    } catch (error) {
      console.log('❌ Supabase error:', error.message);
    }
  } else {
    console.log('❌ Supabase credentials missing');
  }
  
  // Test ZeptoMail
  console.log('\n📧 ZEPTOMAIL:');
  if (process.env.ZEPTO_API_KEY) {
    try {
      const response = await fetch('https://api.zeptomail.in/v1.1/email', {
        method: 'POST',
        headers: {
          'Authorization': process.env.ZEPTO_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: { address: 'info@testingvala.com', name: 'Test' },
          to: [{ email_address: { address: 'test@testingvala.com' } }],
          subject: 'Test',
          htmlbody: '<p>Test</p>'
        })
      });
      
      const result = await response.text();
      
      if (response.status === 400 && result.includes('sandbox')) {
        console.log('❌ ZeptoMail in SANDBOX mode');
      } else if (response.status === 401) {
        console.log('❌ Invalid API key');
      } else if (response.status === 200 || response.status === 202) {
        console.log('✅ ZeptoMail working');
      } else {
        console.log(`⚠️ Status: ${response.status}`);
      }
    } catch (error) {
      console.log('❌ ZeptoMail error:', error.message);
    }
  } else {
    console.log('❌ ZeptoMail API key missing');
  }
  
  // Test production site
  console.log('\n🚀 PRODUCTION SITE:');
  try {
    const response = await fetch(PRODUCTION_URL, { method: 'HEAD' });
    if (response.ok) {
      console.log('✅ Site accessible');
    } else {
      console.log(`❌ Site returned: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Site error:', error.message);
  }
  
  // Test magic link API
  console.log('\n🔐 MAGIC LINK API:');
  try {
    const response = await fetch(`${PRODUCTION_URL}/api/send-magic-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@testingvala.com' })
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Magic link API working');
      if (result.provider === 'development') {
        console.log('⚠️ Running in dev mode (ZeptoMail failed)');
      }
    } else {
      console.log('❌ Magic link failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Magic link error:', error.message);
  }
  
  console.log('\n📋 MANUAL CHECKS:');
  console.log('1. Supabase Dashboard > Auth > Settings:');
  console.log('   - Site URL: https://testingvala.com');
  console.log('   - Email confirmations: DISABLED');
  console.log('2. ZeptoMail Dashboard:');
  console.log('   - Sandbox mode: DISABLED');
  console.log('   - Domain verified');
  console.log('3. Vercel Dashboard:');
  console.log('   - All env vars set in production');
  
  console.log('\n✅ Audit complete!');
}

runSimpleAudit().catch(console.error);