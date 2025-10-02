#!/usr/bin/env node
/**
 * Environment Checker
 * Validates environment configuration and shows current setup
 */

const fs = require('fs');
const path = require('path');

function checkEnvironmentFiles() {
  console.log('🔍 Checking Environment Configuration...\n');
  
  const envFiles = [
    { file: '.env', name: 'Production', required: true },
    { file: '.env.development', name: 'Development', required: true },
    { file: '.env.local', name: 'Local', required: false },
    { file: 'vercel.json', name: 'Vercel Production Config', required: true },
    { file: 'vercel-dev.json', name: 'Vercel Dev Config', required: true }
  ];

  let allGood = true;

  envFiles.forEach(({ file, name, required }) => {
    const exists = fs.existsSync(file);
    const status = exists ? '✅' : (required ? '❌' : '⚠️');
    const message = exists ? 'Found' : (required ? 'Missing (Required)' : 'Missing (Optional)');
    
    console.log(`${status} ${name}: ${message}`);
    
    if (required && !exists) {
      allGood = false;
    }
    
    // Show environment variables if file exists
    if (exists && file.startsWith('.env')) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n').filter(line => 
          line.trim() && !line.startsWith('#') && line.includes('=')
        );
        
        console.log(`   Variables: ${lines.length} configured`);
        lines.forEach(line => {
          const [key] = line.split('=');
          console.log(`   - ${key}`);
        });
      } catch (error) {
        console.log(`   Error reading file: ${error.message}`);
      }
    }
    console.log('');
  });

  return allGood;
}

function showEnvironmentMatrix() {
  console.log('🌍 Environment Matrix:\n');
  console.log('┌─────────────┬─────────────────┬──────────────────────────────────────┐');
  console.log('│ Environment │ Database        │ Purpose                              │');
  console.log('├─────────────┼─────────────────┼──────────────────────────────────────┤');
  console.log('│ Local       │ localhost:54321 │ Safe testing, fake data              │');
  console.log('│ Development │ Production DB   │ Team testing, realistic data         │');
  console.log('│ Production  │ Production DB   │ Live website, real customer data     │');
  console.log('└─────────────┴─────────────────┴──────────────────────────────────────┘');
  console.log('');
}

function showDeploymentCommands() {
  console.log('🚀 Deployment Commands:\n');
  console.log('Local Development:');
  console.log('  npm run dev:setup     # Start local with test data');
  console.log('  npm run dev:reset     # Reset local database');
  console.log('');
  console.log('Database Management:');
  console.log('  npm run db:migrate    # Test migrations locally');
  console.log('  npm run db:deploy     # Deploy to production DB');
  console.log('');
  console.log('Vercel Deployment:');
  console.log('  npm run deploy:dev    # Deploy to dev environment');
  console.log('  npm run deploy:prod   # Deploy to production');
  console.log('');
}

function main() {
  console.log('🎯 TestingVala Environment Status\n');
  
  const configOk = checkEnvironmentFiles();
  showEnvironmentMatrix();
  showDeploymentCommands();
  
  if (configOk) {
    console.log('✅ All required configuration files are present!');
    console.log('🎉 Your multi-environment setup is ready to use.');
  } else {
    console.log('❌ Some required configuration files are missing.');
    console.log('📝 Please create the missing files before deploying.');
  }
}

main();