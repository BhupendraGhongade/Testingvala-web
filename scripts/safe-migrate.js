#!/usr/bin/env node
/**
 * Safe Migration Script - Tests locally first
 */
import { execSync } from 'child_process';

console.log('🔍 Testing migrations locally...');

try {
  execSync('supabase start', { stdio: 'inherit' });
  execSync('supabase db push --local', { stdio: 'inherit' });
  
  console.log('✅ Local test passed! Ready for production.');
  console.log('Run: npm run db:deploy');
} catch (error) {
  console.error('❌ Migration failed locally');
  process.exit(1);
}