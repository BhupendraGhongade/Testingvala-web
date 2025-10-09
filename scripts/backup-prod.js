#!/usr/bin/env node
/**
 * Production Backup Script
 */
import { execSync } from 'child_process';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = `backups/${timestamp}`;

console.log('💾 Creating production backup...');

try {
  // Create backup directory
  execSync(`mkdir -p ${backupDir}`, { stdio: 'inherit' });
  
  // Use supabase db dump with --linked flag to use project credentials
  console.log('📋 Exporting database schema and data...');
  
  // Link to project first if not already linked
  try {
    execSync('supabase link --project-ref qxsardezvxsquvejvsso', { stdio: 'pipe' });
  } catch (e) {
    // Already linked, continue
  }
  
  // Dump with linked project
  const dump = execSync('supabase db dump --linked', { encoding: 'utf8' });
  fs.writeFileSync(`${backupDir}/complete_backup.sql`, dump);
  
  console.log(`✅ Backup created: ${backupDir}`);
  console.log(`📁 Location: ${backupDir}/complete_backup.sql`);
  
} catch (error) {
  console.error('❌ Backup failed:', error.message);
  console.log('💡 Make sure you are logged in: supabase login');
  process.exit(1);
}