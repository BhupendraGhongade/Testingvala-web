#!/usr/bin/env node
/**
 * Direct Production Deploy (No Local Testing)
 * Use only when Docker is not available
 */
const { execSync } = require('child_process');

console.log('⚠️  DIRECT PRODUCTION DEPLOYMENT');
console.log('🚨 This skips local testing - use with caution!');

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question('Type "YES" to confirm direct production deployment: ', (answer) => {
  if (answer !== 'YES') {
    console.log('❌ Deployment cancelled');
    process.exit(0);
  }

  try {
    // Backup first
    console.log('💾 Creating backup...');
    execSync('node scripts/backup-prod.js', { stdio: 'inherit' });
    
    // Deploy to production
    console.log('🚀 Deploying to production...');
    execSync('supabase db push', { stdio: 'inherit' });
    
    console.log('✅ Production deployment complete!');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
  
  readline.close();
});