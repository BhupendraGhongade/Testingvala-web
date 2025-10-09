#!/usr/bin/env node

/**
 * QUICK FIX FOR PRODUCTION ISSUES
 * Fixes warnings identified in pre-production audit
 */

import fs from 'fs';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`)
};

// Fix 1: Add missing environment variables to admin
function fixAdminEnvVars() {
  const adminEnvPath = 'Testingvala-admin/.env.production';
  let content = fs.readFileSync(adminEnvPath, 'utf8');
  
  if (!content.includes('ZEPTO_API_KEY')) {
    content += '\n\n# Email Configuration\nZEPTO_API_KEY=Zoho-enczapikey wSsVR60h+H2z1/slQwNXOqACRsi9eCGrL5gLwUVuY8XAqRRGU1Wr98pwWTiokx+AKFBQPPNwNo6se+bsOmGLG68PWlPCWqyqK3sx/VYSPOZsbq6x00Yt1UbckzVUYLtd9Zu1STUvdbSNA==\nZEPTO_FROM_EMAIL=info@testingvala.com\nZEPTO_FROM_NAME=TestingVala';
    fs.writeFileSync(adminEnvPath, content);
    log.success('Added missing environment variables to admin');
  }
}

// Fix 2: Add build config to main vite.config.js
function fixViteConfig() {
  const viteConfigPath = 'vite.config.js';
  if (!fs.existsSync(viteConfigPath)) {
    const config = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
})`;
    fs.writeFileSync(viteConfigPath, config);
    log.success('Created vite.config.js with build configuration');
  }
}

// Fix 3: Remove console.logs for production
function removeConsoleLogs() {
  const files = [
    'src/components/AuthModal.jsx',
    'src/contexts/AuthContext.jsx', 
    'src/services/authService.js'
  ];
  
  files.forEach(file => {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      const originalLength = content.length;
      
      // Replace console.log with production-safe logging
      content = content.replace(/console\.log\(/g, '// console.log(');
      
      if (content.length !== originalLength) {
        fs.writeFileSync(file, content);
        log.success(`Commented out console.logs in ${file}`);
      }
    }
  });
}

// Main fix function
function fixProductionIssues() {
  console.log(`${colors.blue}🔧 FIXING PRODUCTION ISSUES${colors.reset}\n`);
  
  fixAdminEnvVars();
  fixViteConfig();
  removeConsoleLogs();
  
  log.success('All production issues fixed!');
  log.info('Re-run pre-production-audit.js to verify fixes');
}

fixProductionIssues();