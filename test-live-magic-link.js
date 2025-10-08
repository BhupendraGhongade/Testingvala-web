#!/usr/bin/env node

/**
 * LIVE MAGIC LINK API TEST
 * Tests actual API endpoint functionality
 */

import fetch from 'node-fetch';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.bold}${colors.blue}\n=== ${msg} ===${colors.reset}`)
};

async function testMagicLinkAPI() {
  log.header('LIVE MAGIC LINK API TEST');
  
  // Test with local development server first
  const testEmail = 'test@testingvala.com';
  const localUrl = 'http://localhost:3000/api/secure-send-magic-link';
  
  try {
    log.info('Testing Magic Link API endpoint...');
    
    const response = await fetch(localUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        email: testEmail,
        redirectTo: 'http://localhost:3000/auth/callback'
      })
    });
    
    const responseText = await response.text();
    
    log.info(`Response Status: ${response.status}`);
    log.info(`Response Headers: ${JSON.stringify(Object.fromEntries(response.headers))}`);
    log.info(`Response Body: ${responseText}`);
    
    if (response.ok) {
      log.success('Magic Link API endpoint is working!');
      
      try {
        const jsonResponse = JSON.parse(responseText);
        if (jsonResponse.success) {
          log.success('Magic Link sent successfully');
        } else {
          log.warning(`API returned: ${jsonResponse.message || 'Unknown response'}`);
        }
      } catch (parseError) {
        log.info('Response is not JSON, checking for HTML/text response');
      }
      
    } else {
      log.error(`API endpoint failed with status: ${response.status}`);
      log.error(`Error response: ${responseText}`);
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log.warning('Local development server not running');
      log.info('Start with: npm run dev');
    } else {
      log.error(`API test failed: ${error.message}`);
    }
  }
}

// Test the API
testMagicLinkAPI();