#!/usr/bin/env node

// Production build script with security checks
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting production build with security checks...');

// Check environment variables
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars);
  process.exit(1);
}

// Security checks
console.log('🔒 Running security checks...');

// Check for hardcoded secrets
const srcFiles = execSync('find src -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx"', { encoding: 'utf8' }).split('\n').filter(Boolean);
const dangerousPatterns = [
  /password\s*[:=]\s*['"][^'"]+['"]/i,
  /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
  /secret\s*[:=]\s*['"][^'"]+['"]/i,
  /token\s*[:=]\s*['"][^'"]+['"]/i
];

let securityIssues = 0;
srcFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    dangerousPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        console.warn(`⚠️  Potential hardcoded secret in ${file}`);
        securityIssues++;
      }
    });
  } catch (err) {
    // File might not exist or be readable
  }
});

if (securityIssues > 0) {
  console.error(`❌ Found ${securityIssues} potential security issues. Please review before deploying.`);
  process.exit(1);
}

// Build the application
console.log('📦 Building application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

console.log('🎉 Production build ready for deployment!');