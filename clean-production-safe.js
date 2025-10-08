#!/usr/bin/env node

/**
 * SAFE PRODUCTION DATA CLEANUP
 * Interactive script with confirmation prompts
 */

import { createClient } from '@supabase/supabase-js';
import readline from 'readline';

const PROD_CONFIG = {
  url: 'https://qxsardezvxsquvejvsso.supabase.co',
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4c2FyZGV6dnhzcXV2ZWp2c3NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTQ0NzY5MywiZXhwIjoyMDcxMDIzNjkzfQ.fWpQKMLUQ-U1zrxKCtNrMD1BtEvLy3HJxVoeGlK_HnQ'
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`)
};

const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
};

async function cleanProductionData() {
  console.log(`${colors.bold}${colors.red}
╔══════════════════════════════════════════════════════════════╗
║                    ⚠️  DANGER ZONE ⚠️                        ║
║              PRODUCTION DATA CLEANUP SCRIPT                 ║
║                                                              ║
║  This will PERMANENTLY DELETE all user data from:           ║
║  • Users                                                     ║
║  • User Boards                                               ║
║  • Board Pins                                                ║
║  • Forum Posts                                               ║
║  • Contest Submissions                                       ║
║  • Admin Sessions                                            ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

  // First confirmation
  const confirm1 = await askQuestion('\n❓ Are you ABSOLUTELY SURE you want to delete ALL production data? (type "YES" to continue): ');
  if (confirm1 !== 'YES') {
    log.info('Operation cancelled. No data was deleted.');
    rl.close();
    return;
  }

  // Second confirmation
  const confirm2 = await askQuestion('\n❓ This action CANNOT be undone. Type "DELETE ALL DATA" to proceed: ');
  if (confirm2 !== 'DELETE ALL DATA') {
    log.info('Operation cancelled. No data was deleted.');
    rl.close();
    return;
  }

  try {
    log.info('Connecting to production database...');
    const supabase = createClient(PROD_CONFIG.url, PROD_CONFIG.serviceKey);

    // Check current data counts
    log.info('Checking current data counts...');
    const tables = ['users', 'user_boards', 'board_pins', 'forum_posts', 'contest_submissions'];
    const counts = {};

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          log.warning(`Could not count ${table}: ${error.message}`);
          counts[table] = 'unknown';
        } else {
          counts[table] = count || 0;
        }
      } catch (err) {
        counts[table] = 'error';
      }
    }

    console.log('\n📊 Current data counts:');
    Object.entries(counts).forEach(([table, count]) => {
      console.log(`   ${table}: ${count} records`);
    });

    // Final confirmation with data counts
    const confirm3 = await askQuestion(`\n❓ Proceed to delete ${Object.values(counts).reduce((sum, count) => sum + (typeof count === 'number' ? count : 0), 0)} total records? (type "CONFIRM DELETE"): `);
    if (confirm3 !== 'CONFIRM DELETE') {
      log.info('Operation cancelled. No data was deleted.');
      rl.close();
      return;
    }

    log.warning('Starting data deletion...');

    // Delete in correct order (reverse foreign key dependencies)
    const deleteOrder = ['board_pins', 'user_boards', 'forum_posts', 'contest_submissions', 'admin_sessions', 'users'];
    
    for (const table of deleteOrder) {
      try {
        log.info(`Deleting all records from ${table}...`);
        const { error } = await supabase
          .from(table)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
        
        if (error) {
          log.error(`Failed to delete from ${table}: ${error.message}`);
        } else {
          log.success(`✅ Cleared ${table}`);
        }
      } catch (err) {
        log.error(`Error deleting from ${table}: ${err.message}`);
      }
    }

    // Verify cleanup
    log.info('Verifying cleanup...');
    let totalRemaining = 0;
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (!error) {
          totalRemaining += count || 0;
          console.log(`   ${table}: ${count || 0} records remaining`);
        }
      } catch (err) {
        log.warning(`Could not verify ${table}`);
      }
    }

    if (totalRemaining === 0) {
      log.success('🎉 Production database successfully cleaned!');
      log.info('All user data has been permanently removed.');
    } else {
      log.warning(`⚠️  ${totalRemaining} records may still remain. Manual cleanup may be needed.`);
    }

  } catch (error) {
    log.error(`Cleanup failed: ${error.message}`);
  } finally {
    rl.close();
  }
}

cleanProductionData();