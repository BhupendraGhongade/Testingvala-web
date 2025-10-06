#!/usr/bin/env node
/**
 * Production Deployment Script - Safely deploys to prod
 */
const { execSync } = require('child_process');

console.log('🚀 Deploying to production...');

try {
  // 1. Backup production first
  console.log('💾 Creating production backup...');
  execSync('node scripts/backup-prod.js', { stdio: 'inherit' });
  
  // 2. Deploy migrations
  console.log('📋 Applying migrations to production...');
  execSync('supabase db push', { stdio: 'inherit' });
  
  // 3. Verify deployment
  console.log('🔍 Verifying deployment...');
  execSync('supabase db query "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema IN (\'public\', \'admin\')"', { stdio: 'inherit' });
  
  console.log('✅ Production deployment successful!');
  
} catch (error) {
  console.error('❌ Production deployment failed:', error.message);
  console.log('🔄 Consider rolling back if needed');
  process.exit(1);
}