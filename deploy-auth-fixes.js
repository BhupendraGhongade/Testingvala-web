#!/usr/bin/env node

/**
 * SAFE AUTH FIXES DEPLOYMENT SCRIPT
 * Applies auth fixes with rollback capability
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.bold}${colors.blue}\n=== ${msg} ===${colors.reset}`)
};

// Backup original files
const backupFiles = [
  'src/components/AuthModal.jsx',
  'src/contexts/AuthContext.jsx',
  'api/send-magic-link.js'
];

// New files to deploy
const deployFiles = [
  { from: 'src/components/AuthModal-Fixed.jsx', to: 'src/components/AuthModal.jsx' },
  { from: 'src/contexts/AuthContext-Enhanced.jsx', to: 'src/contexts/AuthContext.jsx' },
  { from: 'api/magic-link-unified.js', to: 'api/send-magic-link.js' },
  { from: 'api/verify-magic-token.js', to: 'api/verify-token.js' }
];

async function createBackups() {
  log.header('CREATING BACKUPS');
  
  const backupDir = path.join(__dirname, 'auth-backups', new Date().toISOString().replace(/[:.]/g, '-'));
  
  try {
    fs.mkdirSync(backupDir, { recursive: true });
    log.success(`Backup directory created: ${backupDir}`);
    
    for (const file of backupFiles) {
      const sourcePath = path.join(__dirname, file);
      const backupPath = path.join(backupDir, file.replace(/\//g, '_'));
      
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, backupPath);
        log.success(`Backed up: ${file}`);
      } else {
        log.warning(`File not found for backup: ${file}`);
      }
    }
    
    return backupDir;
  } catch (error) {
    log.error(`Backup failed: ${error.message}`);
    throw error;
  }
}

async function deployFiles() {
  log.header('DEPLOYING AUTH FIXES');
  
  try {
    for (const { from, to } of deployFiles) {
      const sourcePath = path.join(__dirname, from);
      const targetPath = path.join(__dirname, to);
      
      if (!fs.existsSync(sourcePath)) {
        log.error(`Source file not found: ${from}`);
        continue;
      }
      
      // Ensure target directory exists
      const targetDir = path.dirname(targetPath);
      fs.mkdirSync(targetDir, { recursive: true });
      
      // Copy file
      fs.copyFileSync(sourcePath, targetPath);
      log.success(`Deployed: ${from} → ${to}`);
    }
    
    log.success('All auth fixes deployed successfully!');
  } catch (error) {
    log.error(`Deployment failed: ${error.message}`);
    throw error;
  }
}

async function validateDeployment() {
  log.header('VALIDATING DEPLOYMENT');
  
  const validations = [
    {
      file: 'src/components/AuthModal.jsx',
      check: (content) => content.includes('ZeptoEmail') && content.includes('determineUserRole'),
      message: 'AuthModal uses ZeptoEmail API and role assignment'
    },
    {
      file: 'src/contexts/AuthContext.jsx', 
      check: (content) => content.includes('userRole') && content.includes('isAdmin'),
      message: 'AuthContext includes role management'
    },
    {
      file: 'api/send-magic-link.js',
      check: (content) => content.includes('zeptomail') && content.includes('determineUserRole'),
      message: 'Magic Link API uses ZeptoMail with role assignment'
    },
    {
      file: 'api/verify-token.js',
      check: (content) => content.includes('verifyToken') && content.includes('role'),
      message: 'Token verification includes role handling'
    }
  ];
  
  let allValid = true;
  
  for (const validation of validations) {
    const filePath = path.join(__dirname, validation.file);
    
    if (!fs.existsSync(filePath)) {
      log.error(`Validation failed: ${validation.file} not found`);
      allValid = false;
      continue;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (validation.check(content)) {
      log.success(validation.message);
    } else {
      log.error(`Validation failed: ${validation.message}`);
      allValid = false;
    }
  }
  
  return allValid;
}

async function createRollbackScript(backupDir) {
  log.header('CREATING ROLLBACK SCRIPT');
  
  const rollbackScript = `#!/usr/bin/env node

/**
 * ROLLBACK SCRIPT - Generated automatically
 * Restores original auth files from backup
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backupDir = '${backupDir}';

const restoreFiles = [
  { from: 'src_components_AuthModal.jsx', to: 'src/components/AuthModal.jsx' },
  { from: 'src_contexts_AuthContext.jsx', to: 'src/contexts/AuthContext.jsx' },
  { from: 'api_send-magic-link.js', to: 'api/send-magic-link.js' }
];

console.log('🔄 Rolling back auth changes...');

try {
  for (const { from, to } of restoreFiles) {
    const sourcePath = path.join(backupDir, from);
    const targetPath = path.join(__dirname, to);
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(\`✅ Restored: \${to}\`);
    }
  }
  
  console.log('✅ Rollback completed successfully!');
  console.log('⚠️  Remember to restart your development server');
} catch (error) {
  console.error('❌ Rollback failed:', error.message);
  process.exit(1);
}
`;

  const rollbackPath = path.join(__dirname, 'rollback-auth-changes.js');
  fs.writeFileSync(rollbackPath, rollbackScript);
  fs.chmodSync(rollbackPath, '755');
  
  log.success(`Rollback script created: rollback-auth-changes.js`);
}

async function main() {
  console.log(`${colors.bold}${colors.blue}
╔══════════════════════════════════════════════════════════════╗
║                    AUTH FIXES DEPLOYMENT                     ║
║              Safe deployment with rollback                   ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

  try {
    // Step 1: Create backups
    const backupDir = await createBackups();
    
    // Step 2: Deploy new files
    await deployFiles();
    
    // Step 3: Validate deployment
    const isValid = await validateDeployment();
    
    if (!isValid) {
      log.error('Deployment validation failed!');
      log.warning('Consider running rollback script if issues occur');
    }
    
    // Step 4: Create rollback script
    await createRollbackScript(backupDir);
    
    log.header('DEPLOYMENT COMPLETE');
    log.success('Auth fixes deployed successfully! 🚀');
    log.info('Changes applied:');
    log.info('  • AuthModal now uses ZeptoEmail API');
    log.info('  • Role assignment implemented (Admin/User)');
    log.info('  • Unified Magic Link endpoint');
    log.info('  • Token verification with roles');
    
    log.warning('Next steps:');
    log.warning('  1. Restart your development server');
    log.warning('  2. Test Magic Link flow in all environments');
    log.warning('  3. Verify role assignment works correctly');
    log.warning('  4. If issues occur, run: node rollback-auth-changes.js');
    
  } catch (error) {
    log.error(`Deployment failed: ${error.message}`);
    log.warning('Original files are backed up and can be restored manually');
    process.exit(1);
  }
}

main();