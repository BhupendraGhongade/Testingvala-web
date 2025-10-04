#!/usr/bin/env node
/**
 * Simple Data Backup Script using Supabase Client
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://qxsardezvxsquvejvsso.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4c2FyZGV6dnhzcXV2ZWp2c3NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTQ0NzY5MywiZXhwIjoyMDcxMDIzNjkzfQ.fWpQKMLUQ-U1zrxKCtNrMD1BtEvLy3HJxVoeGlK_HnQ';

const supabase = createClient(supabaseUrl, supabaseKey);

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = `backups/${timestamp}`;

console.log('💾 Creating data backup...');

async function backupData() {
  try {
    // Create backup directory
    if (!fs.existsSync('backups')) {
      fs.mkdirSync('backups');
    }
    fs.mkdirSync(backupDir);

    // Backup website_content
    console.log('📋 Backing up website content...');
    const { data: content } = await supabase
      .from('website_content')
      .select('*');
    
    fs.writeFileSync(`${backupDir}/website_content.json`, JSON.stringify(content, null, 2));

    // Backup users
    console.log('👥 Backing up users...');
    const { data: users } = await supabase
      .from('users')
      .select('*');
    
    fs.writeFileSync(`${backupDir}/users.json`, JSON.stringify(users, null, 2));

    // Backup contest_submissions
    console.log('📝 Backing up contest submissions...');
    const { data: submissions } = await supabase
      .from('contest_submissions')
      .select('*');
    
    fs.writeFileSync(`${backupDir}/contest_submissions.json`, JSON.stringify(submissions, null, 2));

    // Backup admin_sessions
    console.log('🔐 Backing up admin sessions...');
    const { data: sessions } = await supabase
      .from('admin_sessions')
      .select('*');
    
    fs.writeFileSync(`${backupDir}/admin_sessions.json`, JSON.stringify(sessions, null, 2));

    console.log(`✅ Backup completed: ${backupDir}`);
    console.log('📁 Files created:');
    console.log(`   - ${backupDir}/website_content.json`);
    console.log(`   - ${backupDir}/users.json`);
    console.log(`   - ${backupDir}/contest_submissions.json`);
    console.log(`   - ${backupDir}/admin_sessions.json`);

  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
  }
}

backupData();