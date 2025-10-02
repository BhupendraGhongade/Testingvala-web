#!/usr/bin/env node
/**
 * Deploy without backup (for initial setup)
 */
const { execSync } = require('child_process');

console.log('🚀 Deploying to production (no backup)...');

try {
  console.log('📋 Applying migrations to production...');
  execSync('supabase db push', { stdio: 'inherit' });
  
  console.log('✅ Production deployment successful!');
  
} catch (error) {
  console.error('❌ Production deployment failed:', error.message);
  process.exit(1);
}