#!/usr/bin/env node
/**
 * Multi-Environment Deployment Script
 * Handles deployment to different environments with proper configuration
 */

const { execSync } = require('child_process');
const fs = require('fs');

const environments = {
  dev: {
    name: 'Development',
    configFile: 'vercel-dev.json',
    envFile: '.env.development',
    branch: 'dev'
  },
  prod: {
    name: 'Production', 
    configFile: 'vercel.json',
    envFile: '.env',
    branch: 'main'
  }
};

async function deployToEnvironment(env) {
  const config = environments[env];
  if (!config) {
    console.error(`❌ Unknown environment: ${env}`);
    console.log('Available environments: dev, prod');
    process.exit(1);
  }

  console.log(`🚀 Deploying to ${config.name}...`);
  
  try {
    // Check if config file exists
    if (!fs.existsSync(config.configFile)) {
      console.error(`❌ Config file not found: ${config.configFile}`);
      process.exit(1);
    }

    // Deploy with specific config - using safe command execution
    const deployArgs = env === 'prod' 
      ? ['vercel', '--prod']
      : ['vercel', '--config', config.configFile];
      
    // Validate arguments to prevent injection
    const allowedArgs = ['vercel', '--prod', '--config'];
    const allowedFiles = ['vercel.json', 'vercel-dev.json'];
    
    const validArgs = deployArgs.filter(arg => 
      allowedArgs.includes(arg) || allowedFiles.includes(arg)
    );
    
    if (validArgs.length !== deployArgs.length) {
      throw new Error('Invalid deployment arguments detected');
    }
      
    console.log(`📋 Running: ${validArgs.join(' ')}`);
    // Use array form to prevent command injection
    const { spawn } = require('child_process');
    const child = spawn(validArgs[0], validArgs.slice(1), { stdio: 'inherit' });
    
    await new Promise((resolve, reject) => {
      child.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Deployment process exited with code ${code}`));
        } else {
          resolve();
        }
      });
      
      child.on('error', (error) => {
        reject(error);
      });
    });
    
    console.log(`✅ ${config.name} deployment successful!`);
    
  } catch (error) {
    console.error(`❌ ${config.name} deployment failed:`, error.message);
    process.exit(1);
  }
}

// Get environment from command line
const targetEnv = process.argv[2];

if (!targetEnv) {
  console.log('🎯 Multi-Environment Deployment');
  console.log('Usage: node scripts/deploy-environments.js <env>');
  console.log('');
  console.log('Available environments:');
  console.log('  dev  - Development environment');
  console.log('  prod - Production environment');
  process.exit(0);
}

deployToEnvironment(targetEnv);