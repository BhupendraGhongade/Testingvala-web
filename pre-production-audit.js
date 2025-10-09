#!/usr/bin/env node

/**
 * COMPREHENSIVE PRE-PRODUCTION AUDIT
 * Checks for bugs, conflicts, version issues, and deployment readiness
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

const auditResults = {
  critical: [],
  warnings: [],
  info: [],
  passed: []
};

function addResult(type, message, details = '') {
  auditResults[type].push({ message, details });
}

// Check package.json versions and dependencies
function checkPackageVersions() {
  log.header('1️⃣ PACKAGE VERSIONS & DEPENDENCIES');
  
  const userPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const adminPackage = JSON.parse(fs.readFileSync('Testingvala-admin/package.json', 'utf8'));
  
  // Check for version conflicts
  const userDeps = { ...userPackage.dependencies, ...userPackage.devDependencies };
  const adminDeps = { ...adminPackage.dependencies, ...adminPackage.devDependencies };
  
  const conflicts = [];
  Object.keys(userDeps).forEach(dep => {
    if (adminDeps[dep] && userDeps[dep] !== adminDeps[dep]) {
      conflicts.push(`${dep}: User(${userDeps[dep]}) vs Admin(${adminDeps[dep]})`);
    }
  });
  
  if (conflicts.length > 0) {
    addResult('warnings', 'Version conflicts detected', conflicts.join(', '));
    log.warning(`Found ${conflicts.length} version conflicts`);
  } else {
    addResult('passed', 'No version conflicts detected');
    log.success('No version conflicts found');
  }
  
  // Check critical dependencies
  const criticalDeps = ['react', 'react-dom', '@supabase/supabase-js', 'vite'];
  criticalDeps.forEach(dep => {
    if (!userDeps[dep]) {
      addResult('critical', `Missing critical dependency: ${dep}`);
      log.error(`Missing: ${dep}`);
    } else {
      log.success(`${dep}: ${userDeps[dep]}`);
    }
  });
}

// Check environment variables
function checkEnvironmentVariables() {
  log.header('2️⃣ ENVIRONMENT VARIABLES');
  
  const envFiles = ['.env.production', 'Testingvala-admin/.env.production'];
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY', 
    'ZEPTO_API_KEY',
    'ZEPTO_FROM_EMAIL'
  ];
  
  envFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      addResult('critical', `Missing environment file: ${file}`);
      log.error(`Missing: ${file}`);
      return;
    }
    
    const content = fs.readFileSync(file, 'utf8');
    const missing = requiredVars.filter(varName => !content.includes(varName));
    
    if (missing.length > 0) {
      addResult('warnings', `Missing variables in ${file}`, missing.join(', '));
      log.warning(`${file}: Missing ${missing.join(', ')}`);
    } else {
      addResult('passed', `All variables present in ${file}`);
      log.success(`${file}: All required variables present`);
    }
  });
}

// Check for hardcoded secrets
function checkHardcodedSecrets() {
  log.header('3️⃣ HARDCODED SECRETS SCAN');
  
  const patterns = [
    /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, // JWT tokens
    /sk_[a-zA-Z0-9]+/g, // Stripe secret keys
    /Zoho-enczapikey [A-Za-z0-9+/=]+/g, // ZeptoMail keys
    /sb_secret_[A-Za-z0-9_-]+/g, // Supabase service role keys
  ];
  
  const filesToCheck = [
    'src/lib/supabase.js',
    'src/services/authService.js',
    'Testingvala-admin/src/lib/supabase.js',
    'api/send-magic-link.js'
  ];
  
  let secretsFound = 0;
  
  filesToCheck.forEach(file => {
    if (!fs.existsSync(file)) return;
    
    const content = fs.readFileSync(file, 'utf8');
    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        secretsFound += matches.length;
        addResult('critical', `Hardcoded secret in ${file}`, matches[0].substring(0, 20) + '...');
        log.error(`Secret found in ${file}`);
      }
    });
  });
  
  if (secretsFound === 0) {
    addResult('passed', 'No hardcoded secrets found');
    log.success('No hardcoded secrets detected');
  }
}

// Check build configuration
function checkBuildConfig() {
  log.header('4️⃣ BUILD CONFIGURATION');
  
  const configs = ['vite.config.js', 'Testingvala-admin/vite.config.js'];
  
  configs.forEach(config => {
    if (!fs.existsSync(config)) {
      addResult('warnings', `Missing build config: ${config}`);
      log.warning(`Missing: ${config}`);
      return;
    }
    
    const content = fs.readFileSync(config, 'utf8');
    
    // Check for production optimizations
    if (!content.includes('build')) {
      addResult('warnings', `No build config in ${config}`);
      log.warning(`${config}: No build configuration found`);
    } else {
      addResult('passed', `Build config present in ${config}`);
      log.success(`${config}: Build configuration found`);
    }
  });
}

// Check API endpoints
function checkAPIEndpoints() {
  log.header('5️⃣ API ENDPOINTS');
  
  const apiFiles = [
    'api/send-magic-link.js',
    'api/verify-token.js',
    'api/health.js'
  ];
  
  apiFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      addResult('critical', `Missing API endpoint: ${file}`);
      log.error(`Missing: ${file}`);
      return;
    }
    
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for proper error handling
    if (!content.includes('try') || !content.includes('catch')) {
      addResult('warnings', `No error handling in ${file}`);
      log.warning(`${file}: Missing error handling`);
    } else {
      addResult('passed', `Error handling present in ${file}`);
      log.success(`${file}: Proper error handling found`);
    }
  });
}

// Check database schema
function checkDatabaseSchema() {
  log.header('6️⃣ DATABASE SCHEMA');
  
  const migrationFiles = fs.readdirSync('supabase/migrations').filter(f => f.endsWith('.sql'));
  
  if (migrationFiles.length === 0) {
    addResult('warnings', 'No migration files found');
    log.warning('No migration files in supabase/migrations');
  } else {
    addResult('passed', `Found ${migrationFiles.length} migration files`);
    log.success(`Found ${migrationFiles.length} migration files`);
    
    // Check for RLS policies
    const hasRLS = migrationFiles.some(file => {
      const content = fs.readFileSync(`supabase/migrations/${file}`, 'utf8');
      return content.includes('ROW LEVEL SECURITY') || content.includes('POLICY');
    });
    
    if (!hasRLS) {
      addResult('critical', 'No RLS policies found in migrations');
      log.error('Missing RLS policies - SECURITY RISK');
    } else {
      addResult('passed', 'RLS policies found in migrations');
      log.success('RLS policies configured');
    }
  }
}

// Check for common bugs
function checkCommonBugs() {
  log.header('7️⃣ COMMON BUGS SCAN');
  
  const bugPatterns = [
    { pattern: /console\.log\(/g, message: 'Console logs found', severity: 'warnings' },
    { pattern: /debugger;/g, message: 'Debugger statements found', severity: 'warnings' },
    { pattern: /TODO|FIXME|HACK/g, message: 'TODO/FIXME comments found', severity: 'info' },
    { pattern: /localhost:3000/g, message: 'Hardcoded localhost URLs', severity: 'warnings' },
    { pattern: /\.only\(/g, message: 'Test .only() calls found', severity: 'warnings' }
  ];
  
  const filesToScan = [
    'src/components/AuthModal.jsx',
    'src/contexts/AuthContext.jsx',
    'src/services/authService.js',
    'Testingvala-admin/src/components/AdminLogin.jsx'
  ];
  
  let bugsFound = 0;
  
  filesToScan.forEach(file => {
    if (!fs.existsSync(file)) return;
    
    const content = fs.readFileSync(file, 'utf8');
    bugPatterns.forEach(({ pattern, message, severity }) => {
      const matches = content.match(pattern);
      if (matches) {
        bugsFound += matches.length;
        addResult(severity, `${message} in ${file}`, `${matches.length} occurrences`);
        log.warning(`${file}: ${message} (${matches.length})`);
      }
    });
  });
  
  if (bugsFound === 0) {
    addResult('passed', 'No common bugs detected');
    log.success('No common bugs found');
  }
}

// Generate deployment commands
function generateDeploymentCommands() {
  log.header('8️⃣ PRODUCTION DEPLOYMENT COMMANDS');
  
  const commands = `
# 🚀 PRODUCTION DEPLOYMENT COMMANDS

## 1️⃣ PRE-DEPLOYMENT CHECKS
npm run security:check
npm run build:prod
npm test

## 2️⃣ DATABASE SCHEMA MIGRATION (Docker → Production)
# Backup current production database
npm run db:backup

# Generate migration from local changes
supabase db diff -f migration_$(date +%Y%m%d_%H%M%S)

# Apply migrations to production
supabase db push --linked

# Verify migration success
supabase db status --linked

## 3️⃣ ENVIRONMENT VARIABLES (Vercel)
# Set production environment variables
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add ZEPTO_API_KEY production
vercel env add ZEPTO_FROM_EMAIL production
vercel env add VITE_ADMIN_EMAIL production
vercel env add VITE_ADMIN_PASSWORD production

## 4️⃣ BUILD & DEPLOY
# User site
npm run build
vercel --prod

# Admin site
cd Testingvala-admin
npm run build
vercel --prod

## 5️⃣ POST-DEPLOYMENT VERIFICATION
# Test magic link functionality
curl -X POST https://testingvala.com/api/send-magic-link \\
  -H "Content-Type: application/json" \\
  -d '{"email": "test@testingvala.com"}'

# Test admin login
# Navigate to admin URL and verify login works

## 6️⃣ ROLLBACK PLAN (if needed)
# Revert database migration
supabase db reset --linked
# Restore from backup
# Redeploy previous version

## 🔄 REGULAR DEPLOYMENT WORKFLOW
# Run this before every production release:
npm run pre-prod-audit
npm run db:backup
supabase db push --linked
npm run build
vercel --prod
`;
  
  fs.writeFileSync('PRODUCTION_DEPLOYMENT_COMMANDS.md', commands);
  log.success('Deployment commands saved to PRODUCTION_DEPLOYMENT_COMMANDS.md');
}

// Generate audit report
function generateAuditReport() {
  log.header('GENERATING AUDIT REPORT');
  
  const report = `# 🔍 PRE-PRODUCTION AUDIT REPORT
Generated: ${new Date().toISOString()}

## 📊 AUDIT SUMMARY
- **Critical Issues**: ${auditResults.critical.length}
- **Warnings**: ${auditResults.warnings.length}
- **Info Items**: ${auditResults.info.length}
- **Passed Checks**: ${auditResults.passed.length}

## 🚨 CRITICAL ISSUES
${auditResults.critical.length === 0 ? '✅ No critical issues found' : 
  auditResults.critical.map(item => `❌ ${item.message}${item.details ? ` - ${item.details}` : ''}`).join('\n')}

## ⚠️ WARNINGS
${auditResults.warnings.length === 0 ? '✅ No warnings' :
  auditResults.warnings.map(item => `⚠️ ${item.message}${item.details ? ` - ${item.details}` : ''}`).join('\n')}

## ℹ️ INFO ITEMS
${auditResults.info.map(item => `ℹ️ ${item.message}${item.details ? ` - ${item.details}` : ''}`).join('\n')}

## ✅ PASSED CHECKS
${auditResults.passed.map(item => `✅ ${item.message}`).join('\n')}

## 🎯 PRODUCTION READINESS
${auditResults.critical.length === 0 ? 
  '✅ **READY FOR PRODUCTION** - No critical issues found' : 
  '❌ **NOT READY** - Critical issues must be resolved first'}

## 📋 NEXT STEPS
${auditResults.critical.length > 0 ? 
  '1. Fix all critical issues\n2. Re-run audit\n3. Proceed with deployment' :
  '1. Review warnings\n2. Run deployment commands\n3. Monitor production'}
`;
  
  fs.writeFileSync('PRE_PRODUCTION_AUDIT_REPORT.md', report);
  log.success('Audit report saved to PRE_PRODUCTION_AUDIT_REPORT.md');
}

// Main audit function
async function runPreProductionAudit() {
  console.log(`${colors.bold}${colors.blue}
╔══════════════════════════════════════════════════════════════╗
║                PRE-PRODUCTION AUDIT                         ║
║            Comprehensive Bug & Conflict Check               ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

  try {
    checkPackageVersions();
    checkEnvironmentVariables();
    checkHardcodedSecrets();
    checkBuildConfig();
    checkAPIEndpoints();
    checkDatabaseSchema();
    checkCommonBugs();
    generateDeploymentCommands();
    generateAuditReport();
    
    log.header('AUDIT COMPLETE');
    
    const totalIssues = auditResults.critical.length + auditResults.warnings.length;
    
    if (auditResults.critical.length === 0) {
      log.success(`🎉 PRODUCTION READY! Found ${totalIssues} total issues (${auditResults.critical.length} critical)`);
    } else {
      log.error(`❌ NOT READY FOR PRODUCTION! ${auditResults.critical.length} critical issues must be fixed`);
    }
    
    log.info('📋 Review PRE_PRODUCTION_AUDIT_REPORT.md for detailed findings');
    log.info('🚀 Check PRODUCTION_DEPLOYMENT_COMMANDS.md for deployment steps');
    
  } catch (error) {
    log.error(`Audit failed: ${error.message}`);
    process.exit(1);
  }
}

runPreProductionAudit();