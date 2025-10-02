#!/usr/bin/env node
/**
 * Development Environment Setup
 * Sets up local development with test data
 */
const { execSync } = require('child_process');

console.log('🛠️  Setting up local development environment...');

try {
  // Start local Supabase
  console.log('🚀 Starting local Supabase...');
  execSync('supabase start', { stdio: 'inherit' });
  
  // Apply migrations
  console.log('📋 Applying migrations...');
  execSync('supabase db push --local', { stdio: 'inherit' });
  
  // Seed with test data
  console.log('🌱 Loading test data...');
  execSync('supabase seed --local', { stdio: 'inherit' });
  
  console.log('✅ Development environment ready!');
  console.log('');
  console.log('🎯 Local URLs:');
  console.log('   Database: http://localhost:54321');
  console.log('   Studio: http://localhost:54323');
  console.log('   API: http://localhost:54321');
  console.log('');
  console.log('📊 Test Data Available:');
  console.log('   - 4 test users');
  console.log('   - 2 contest submissions');
  console.log('   - 2 payment requests');
  console.log('   - 2 forum posts');
  console.log('   - Admin configuration');
  console.log('');
  console.log('🔧 Next: Update your app to use .env.local for development');
  
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}