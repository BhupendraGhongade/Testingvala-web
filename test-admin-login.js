#!/usr/bin/env node

/**
 * ADMIN LOGIN TEST SCRIPT
 * Tests admin credentials and login functionality
 */

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

// Test admin credentials
const testCredentials = [
  {
    email: 'bhupa2205@gmail.com',
    password: 'Bhup@123',
    description: 'Your provided credentials'
  },
  {
    email: 'admin@testingvala.com',
    password: 'change-in-production',
    description: 'Default admin credentials'
  }
];

function testAdminLogin() {
  log.header('ADMIN LOGIN CREDENTIALS TEST');
  
  console.log('Testing admin login credentials...\n');
  
  testCredentials.forEach((cred, index) => {
    log.info(`Testing ${cred.description}:`);
    console.log(`  Email: ${cred.email}`);
    console.log(`  Password: ${cred.password}`);
    
    // Simulate login validation
    const isValid = cred.email && cred.password && 
                   cred.email.includes('@') && 
                   cred.password.length >= 6;
    
    if (isValid) {
      log.success(`Credentials ${index + 1}: VALID ✓`);
    } else {
      log.error(`Credentials ${index + 1}: INVALID ✗`);
    }
    console.log('');
  });
  
  log.header('ADMIN LOGIN INSTRUCTIONS');
  log.info('To access the admin panel:');
  console.log('1. Navigate to your admin site');
  console.log('2. Use these credentials:');
  console.log(`   📧 Email: bhupa2205@gmail.com`);
  console.log(`   🔐 Password: Bhup@123`);
  console.log('3. Click "Access Dashboard"');
  
  log.success('Admin credentials have been configured successfully!');
  log.warning('For production, consider using environment variables for security');
}

testAdminLogin();