#!/usr/bin/env node
/**
 * Production Backup Script
 */
const { execSync } = require('child_process');
const fs = require('fs');

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = `backups/${timestamp}`;

console.log('💾 Creating production backup...');

try {
  // Create backup directory
  execSync(`mkdir -p ${backupDir}`, { stdio: 'inherit' });
  
  // Export complete database
  console.log('📋 Exporting complete database...');
  const dump = execSync('supabase db dump', { encoding: 'utf8' });
  fs.writeFileSync(`${backupDir}/complete_backup.sql`, dump);
  
  console.log(`✅ Backup created: ${backupDir}`);
  
} catch (error) {
  console.error('❌ Backup failed:', error.message);
  process.exit(1);
}