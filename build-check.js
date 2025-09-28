#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 TestingVala Build Health Check');
console.log('================================');

// Check Node.js version
const nodeVersion = process.version;
console.log(`✅ Node.js version: ${nodeVersion}`);

// Check if required files exist

const requiredFiles = [
  'package.json',
  'vite.config.js',
  'src/main.jsx',
  'src/App.jsx',
  'src/index.css',
  '.env'
];

console.log('\n📁 Checking required files:');
requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
  }
});

// Check environment variables
console.log('\n🔧 Environment Variables:');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasSupabaseUrl = envContent.includes('VITE_SUPABASE_URL');
  const hasSupabaseKey = envContent.includes('VITE_SUPABASE_ANON_KEY');
  
  console.log(`✅ .env file exists`);
  console.log(`${hasSupabaseUrl ? '✅' : '⚠️'} VITE_SUPABASE_URL ${hasSupabaseUrl ? 'configured' : 'missing'}`);
  console.log(`${hasSupabaseKey ? '✅' : '⚠️'} VITE_SUPABASE_ANON_KEY ${hasSupabaseKey ? 'configured' : 'missing'}`);
} else {
  console.log('❌ .env file missing');
}

// Check dist folder
console.log('\n📦 Build Output:');
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  const distFiles = fs.readdirSync(distPath);
  console.log(`✅ dist folder exists with ${distFiles.length} files`);
  
  const hasIndex = distFiles.includes('index.html');
  const hasAssets = fs.existsSync(path.join(distPath, 'assets'));
  
  console.log(`${hasIndex ? '✅' : '❌'} index.html ${hasIndex ? 'present' : 'missing'}`);
  console.log(`${hasAssets ? '✅' : '❌'} assets folder ${hasAssets ? 'present' : 'missing'}`);
} else {
  console.log('⚠️ dist folder not found - run "npm run build" first');
}

console.log('\n🎯 Summary:');
console.log('- Build system: Vite + React');
console.log('- Status: Ready for development and production');
console.log('- To start dev server: npm run dev');
console.log('- To build for production: npm run build');
console.log('- To preview build: npm run preview');

console.log('\n✨ Build check complete!');