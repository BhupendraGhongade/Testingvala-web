#!/usr/bin/env node
/**
 * Production Backup Script
 */
import { execSync } from 'child_process';
import fs from 'fs';

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = `backups/${timestamp}`;

console.log('💾 Creating production backup...');

try {
  // Create backup directory
  execSync(`mkdir -p ${backupDir}`, { stdio: 'inherit' });
  
  console.log('🔗 Checking project link...');
  
  // Check if project is linked, if not link it
  try {
    execSync('supabase status', { stdio: 'pipe' });
  } catch (e) {
    console.log('🔗 Linking to production project...');
    execSync('supabase link --project-ref qxsardezvxsquvejvsso', { stdio: 'inherit' });
  }
  
  console.log('📋 Exporting database schema and data...');
  
  // Dump with linked project
  const dump = execSync('supabase db dump --linked', { encoding: 'utf8' });
  fs.writeFileSync(`${backupDir}/complete_backup.sql`, dump);
  
  console.log(`✅ Backup created successfully!`);
  console.log(`📁 Location: ${backupDir}/complete_backup.sql`);
  console.log(`📊 Size: ${(fs.statSync(`${backupDir}/complete_backup.sql`).size / 1024).toFixed(2)} KB`);
  
} catch (error) {
  console.error('❌ Backup failed:', error.message);
  console.log('💡 Troubleshooting:');
  console.log('   1. Make sure you are logged in: supabase login');
  console.log('   2. Check project access: supabase projects list');
  console.log('   3. Verify project link: supabase status');
  process.exit(1);
}