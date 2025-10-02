#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 TestingVala Startup Check');
console.log('============================');

// Check for common runtime issues
const checkFile = (filePath, description) => {
  try {
    const content = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
    
    // Check for common issues
    const issues = [];
    
    if (content.includes('import.meta.env') && !content.includes('VITE_')) {
      issues.push('Non-VITE environment variables detected');
    }
    
    if (content.includes('process.env') && filePath.includes('src/')) {
      issues.push('process.env used in frontend code (should use import.meta.env)');
    }
    
    if (content.includes('require(') && filePath.endsWith('.jsx')) {
      issues.push('CommonJS require() in JSX file');
    }
    
    if (issues.length === 0) {
      console.log(`✅ ${description}`);
    } else {
      console.log(`⚠️ ${description}:`);
      issues.forEach(issue => console.log(`   - ${issue}`));
    }
    
    return issues.length === 0;
  } catch (error) {
    console.log(`❌ ${description}: ${error.message}`);
    return false;
  }
};

console.log('\n🔍 Checking key files for runtime issues:');

const checks = [
  ['src/main.jsx', 'Main entry point'],
  ['src/App.jsx', 'Main App component'],
  ['src/lib/supabase.js', 'Supabase configuration'],
  ['src/contexts/AuthContext.jsx', 'Authentication context'],
  ['src/contexts/GlobalDataContext.jsx', 'Global data context']
];

let allGood = true;
checks.forEach(([file, desc]) => {
  const result = checkFile(file, desc);
  allGood = allGood && result;
});

// Check for potential memory leaks
console.log('\n🧠 Memory leak prevention check:');
const appContent = fs.readFileSync(path.join(__dirname, 'src/App.jsx'), 'utf8');

if (appContent.includes('useEffect') && appContent.includes('return () =>')) {
  console.log('✅ Cleanup functions found in useEffect');
} else {
  console.log('⚠️ Consider adding cleanup functions to useEffect hooks');
}

// Check for error boundaries
if (appContent.includes('ErrorBoundary')) {
  console.log('✅ Error boundary implemented');
} else {
  console.log('⚠️ No error boundary found');
}

console.log('\n📊 Performance checks:');

// Check bundle size
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  const assetsPath = path.join(distPath, 'assets');
  if (fs.existsSync(assetsPath)) {
    const files = fs.readdirSync(assetsPath);
    const jsFiles = files.filter(f => f.endsWith('.js'));
    
    let totalSize = 0;
    jsFiles.forEach(file => {
      const stats = fs.statSync(path.join(assetsPath, file));
      totalSize += stats.size;
    });
    
    const sizeMB = (totalSize / 1024 / 1024).toFixed(2);
    console.log(`📦 Total JS bundle size: ${sizeMB} MB`);
    
    if (totalSize > 5 * 1024 * 1024) { // 5MB
      console.log('⚠️ Bundle size is large, consider code splitting');
    } else {
      console.log('✅ Bundle size is reasonable');
    }
  }
}

console.log('\n🎯 Recommendations:');
if (allGood) {
  console.log('✅ All checks passed! Your app should run smoothly.');
  console.log('💡 To start development: npm run dev');
  console.log('💡 To test production build: npm run preview');
} else {
  console.log('⚠️ Some issues detected. Review the warnings above.');
}

console.log('\n✨ Startup check complete!');