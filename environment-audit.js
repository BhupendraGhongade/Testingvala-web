#!/usr/bin/env node

/**
 * COMPREHENSIVE ENVIRONMENT AUDIT SCRIPT
 * Tests all environments: Local, Development, Production
 * Validates Supabase connections, Magic Link auth, Admin/User sync
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Color codes for console output
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

// Environment configurations
const environments = {
  local: {
    name: 'Local Development',
    envFile: '.env.local',
    expectedVars: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_APP_ENV']
  },
  development: {
    name: 'Development',
    envFile: '.env.development', 
    expectedVars: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_APP_ENV']
  },
  production: {
    name: 'Production',
    envFile: '.env.production',
    expectedVars: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_APP_ENV', 'ZEPTO_API_KEY']
  }
};

// Admin environment configurations
const adminEnvironments = {
  local: {
    name: 'Admin Local',
    envFile: 'Testingvala-admin/.env',
    expectedVars: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_KEY']
  },
  production: {
    name: 'Admin Production', 
    envFile: 'Testingvala-admin/.env.production',
    expectedVars: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_KEY']
  }
};

// Audit results storage
const auditResults = {
  environmentParity: {},
  supabaseConnections: {},
  magicLinkTests: {},
  adminUserSync: {},
  securityFindings: [],
  recommendations: []
};

/**
 * Load environment variables from file
 */
function loadEnvFile(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    if (!fs.existsSync(fullPath)) {
      return { error: `File not found: ${filePath}` };
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    const vars = {};
    
    content.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          vars[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    
    return { vars };
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * 1️⃣ Environment Parity & Variable Consistency Check
 */
async function checkEnvironmentParity() {
  log.header('1️⃣ ENVIRONMENT PARITY & VARIABLE CONSISTENCY');
  
  const results = {};
  
  // Check user environments
  for (const [envKey, config] of Object.entries(environments)) {
    log.info(`Checking ${config.name} environment...`);
    
    const { vars, error } = loadEnvFile(config.envFile);
    if (error) {
      log.error(`${config.name}: ${error}`);
      results[envKey] = { status: 'FAIL', error };
      continue;
    }
    
    const missing = config.expectedVars.filter(varName => !vars[varName]);
    const extra = Object.keys(vars).filter(varName => 
      !config.expectedVars.includes(varName) && 
      !varName.startsWith('VITE_DEV_') &&
      !varName.startsWith('ZEPTO_') &&
      !varName.startsWith('VITE_MAX_') &&
      !varName.startsWith('VITE_RATE_') &&
      !varName.startsWith('VITE_SESSION_') &&
      !varName.startsWith('VITE_ENABLE_')
    );
    
    // Check for client-side security issues
    const securityIssues = [];
    Object.keys(vars).forEach(key => {
      if (key.includes('SECRET') || key.includes('SERVICE_ROLE')) {
        if (key.startsWith('VITE_')) {
          securityIssues.push(`${key} should not be prefixed with VITE_ (client-side exposure)`);
        }
      }
    });
    
    results[envKey] = {
      status: missing.length === 0 && securityIssues.length === 0 ? 'PASS' : 'FAIL',
      vars: Object.keys(vars).length,
      missing,
      extra,
      securityIssues,
      supabaseUrl: vars.VITE_SUPABASE_URL,
      environment: vars.VITE_APP_ENV
    };
    
    if (results[envKey].status === 'PASS') {
      log.success(`${config.name}: All required variables present`);
    } else {
      log.error(`${config.name}: Issues found`);
      if (missing.length > 0) log.warning(`  Missing: ${missing.join(', ')}`);
      if (securityIssues.length > 0) log.error(`  Security: ${securityIssues.join(', ')}`);
    }
  }
  
  // Check admin environments
  for (const [envKey, config] of Object.entries(adminEnvironments)) {
    log.info(`Checking ${config.name} environment...`);
    
    const { vars, error } = loadEnvFile(config.envFile);
    if (error) {
      log.error(`${config.name}: ${error}`);
      results[`admin_${envKey}`] = { status: 'FAIL', error };
      continue;
    }
    
    const missing = config.expectedVars.filter(varName => !vars[varName]);
    
    results[`admin_${envKey}`] = {
      status: missing.length === 0 ? 'PASS' : 'FAIL',
      vars: Object.keys(vars).length,
      missing,
      supabaseUrl: vars.VITE_SUPABASE_URL
    };
    
    if (results[`admin_${envKey}`].status === 'PASS') {
      log.success(`${config.name}: All required variables present`);
    } else {
      log.error(`${config.name}: Missing variables: ${missing.join(', ')}`);
    }
  }
  
  auditResults.environmentParity = results;
}

/**
 * 2️⃣ Supabase Connection Audit
 */
async function checkSupabaseConnections() {
  log.header('2️⃣ SUPABASE CONNECTION AUDIT');
  
  const results = {};
  
  for (const [envKey, config] of Object.entries(environments)) {
    log.info(`Testing ${config.name} Supabase connection...`);
    
    const { vars, error } = loadEnvFile(config.envFile);
    if (error) {
      results[envKey] = { status: 'FAIL', error: 'Environment file not found' };
      continue;
    }
    
    try {
      const supabase = createClient(vars.VITE_SUPABASE_URL, vars.VITE_SUPABASE_ANON_KEY);
      
      // Test basic connection
      const { data, error: queryError } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (queryError) {
        results[envKey] = {
          status: 'FAIL',
          error: queryError.message,
          url: vars.VITE_SUPABASE_URL
        };
        log.error(`${config.name}: ${queryError.message}`);
      } else {
        results[envKey] = {
          status: 'PASS',
          url: vars.VITE_SUPABASE_URL,
          recordCount: data?.length || 0
        };
        log.success(`${config.name}: Connection successful`);
      }
      
      // Test RLS policies
      try {
        const { error: rlsError } = await supabase
          .from('user_boards')
          .select('id')
          .limit(1);
        
        results[envKey].rlsStatus = rlsError ? 'ENABLED' : 'DISABLED';
        if (rlsError && rlsError.message.includes('RLS')) {
          log.info(`${config.name}: RLS is properly enabled`);
        } else {
          log.warning(`${config.name}: RLS may be disabled`);
        }
      } catch (rlsTestError) {
        results[envKey].rlsStatus = 'UNKNOWN';
      }
      
    } catch (connectionError) {
      results[envKey] = {
        status: 'FAIL',
        error: connectionError.message,
        url: vars.VITE_SUPABASE_URL
      };
      log.error(`${config.name}: ${connectionError.message}`);
    }
  }
  
  auditResults.supabaseConnections = results;
}

/**
 * 3️⃣ Magic Link Authentication Audit
 */
async function checkMagicLinkAuth() {
  log.header('3️⃣ MAGIC LINK AUTHENTICATION AUDIT');
  
  const results = {};
  
  // Check if magic link API endpoints exist
  const apiFiles = [
    'api/secure-send-magic-link.js',
    'api/send-magic-link.js',
    'api/verify-token.js'
  ];
  
  for (const file of apiFiles) {
    const exists = fs.existsSync(path.join(__dirname, file));
    log.info(`API endpoint ${file}: ${exists ? 'EXISTS' : 'MISSING'}`);
  }
  
  // Check ZeptoMail configuration
  for (const [envKey, config] of Object.entries(environments)) {
    if (envKey === 'production') {
      const { vars } = loadEnvFile(config.envFile);
      if (vars?.ZEPTO_API_KEY) {
        const isValidKey = vars.ZEPTO_API_KEY.startsWith('Zoho-enczapikey');
        results[envKey] = {
          status: isValidKey ? 'PASS' : 'FAIL',
          hasZeptoKey: true,
          keyFormat: isValidKey ? 'VALID' : 'INVALID'
        };
        log.success(`${config.name}: ZeptoMail key format is valid`);
      } else {
        results[envKey] = {
          status: 'FAIL',
          hasZeptoKey: false,
          error: 'ZEPTO_API_KEY missing'
        };
        log.error(`${config.name}: ZEPTO_API_KEY missing`);
      }
    }
  }
  
  auditResults.magicLinkTests = results;
}

/**
 * 4️⃣ Admin & User Data Sync Audit
 */
async function checkAdminUserSync() {
  log.header('4️⃣ ADMIN & USER DATA SYNC AUDIT');
  
  const results = {};
  
  // Compare Supabase URLs between admin and user environments
  const userProdEnv = loadEnvFile('.env.production');
  const adminProdEnv = loadEnvFile('Testingvala-admin/.env.production');
  
  if (userProdEnv.vars && adminProdEnv.vars) {
    const urlsMatch = userProdEnv.vars.VITE_SUPABASE_URL === adminProdEnv.vars.VITE_SUPABASE_URL;
    const keysMatch = userProdEnv.vars.VITE_SUPABASE_ANON_KEY === adminProdEnv.vars.VITE_SUPABASE_ANON_KEY;
    
    results.production = {
      status: urlsMatch && keysMatch ? 'PASS' : 'FAIL',
      urlsMatch,
      keysMatch,
      userUrl: userProdEnv.vars.VITE_SUPABASE_URL,
      adminUrl: adminProdEnv.vars.VITE_SUPABASE_URL
    };
    
    if (urlsMatch && keysMatch) {
      log.success('Production: Admin and User apps use same Supabase project');
    } else {
      log.error('Production: Admin and User apps use different Supabase configurations');
    }
  }
  
  // Check local environments
  const userLocalEnv = loadEnvFile('.env.local');
  const adminLocalEnv = loadEnvFile('Testingvala-admin/.env');
  
  if (userLocalEnv.vars && adminLocalEnv.vars) {
    const localUrlsMatch = userLocalEnv.vars.VITE_SUPABASE_URL === adminLocalEnv.vars.VITE_SUPABASE_URL;
    
    results.local = {
      status: localUrlsMatch ? 'PASS' : 'FAIL',
      urlsMatch: localUrlsMatch,
      userUrl: userLocalEnv.vars.VITE_SUPABASE_URL,
      adminUrl: adminLocalEnv.vars.VITE_SUPABASE_URL
    };
    
    if (localUrlsMatch) {
      log.success('Local: Admin and User apps use same Supabase instance');
    } else {
      log.warning('Local: Admin and User apps use different Supabase instances');
    }
  }
  
  auditResults.adminUserSync = results;
}

/**
 * 5️⃣ Docker Connectivity Check (Local Only)
 */
async function checkDockerConnectivity() {
  log.header('5️⃣ DOCKER CONNECTIVITY CHECK');
  
  // Check if Supabase is running locally
  try {
    const { vars } = loadEnvFile('.env.local');
    if (vars?.VITE_SUPABASE_URL?.includes('localhost') || vars?.VITE_SUPABASE_URL?.includes('127.0.0.1')) {
      const supabase = createClient(vars.VITE_SUPABASE_URL, vars.VITE_SUPABASE_ANON_KEY);
      
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) {
        log.error('Local Supabase: Not running or not accessible');
        log.info('Run: npm run db:start');
      } else {
        log.success('Local Supabase: Running and accessible');
      }
    } else {
      log.info('Local environment not configured for Docker/Supabase local instance');
    }
  } catch (error) {
    log.error(`Docker connectivity check failed: ${error.message}`);
  }
}

/**
 * 6️⃣ Security Posture Audit
 */
async function checkSecurityPosture() {
  log.header('6️⃣ SECURITY POSTURE AUDIT');
  
  const findings = [];
  
  // Scan for hardcoded secrets
  const secretPatterns = [
    /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/, // JWT tokens
    /sk_[a-zA-Z0-9]+/, // Stripe secret keys
    /pk_[a-zA-Z0-9]+/, // Stripe public keys
    /Zoho-enczapikey [A-Za-z0-9+/=]+/, // ZeptoMail keys
    /sb_secret_[A-Za-z0-9_-]+/, // Supabase service role keys
  ];
  
  // Check source files for hardcoded secrets
  const sourceFiles = [
    'src/lib/supabase.js',
    'src/services/authService.js',
    'api/secure-send-magic-link.js'
  ];
  
  for (const file of sourceFiles) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      for (const pattern of secretPatterns) {
        if (pattern.test(content)) {
          findings.push({
            severity: 'HIGH',
            file,
            issue: 'Potential hardcoded secret detected',
            recommendation: 'Move secrets to environment variables'
          });
        }
      }
    }
  }
  
  // Check Vercel configuration
  const vercelConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'vercel.json'), 'utf8'));
  
  if (vercelConfig.headers) {
    log.success('Security headers configured in vercel.json');
  } else {
    findings.push({
      severity: 'MEDIUM',
      issue: 'Missing security headers in Vercel configuration',
      recommendation: 'Add security headers to vercel.json'
    });
  }
  
  // Check CORS configuration
  const corsHeaders = vercelConfig.headers?.find(h => h.source === '/api/(.*)');
  if (corsHeaders) {
    const allowOrigin = corsHeaders.headers.find(h => h.key === 'Access-Control-Allow-Origin');
    if (allowOrigin && allowOrigin.value !== '*') {
      log.success('CORS properly restricted');
    } else {
      findings.push({
        severity: 'HIGH',
        issue: 'CORS allows all origins',
        recommendation: 'Restrict CORS to specific domains'
      });
    }
  }
  
  auditResults.securityFindings = findings;
  
  findings.forEach(finding => {
    const color = finding.severity === 'HIGH' ? colors.red : 
                  finding.severity === 'MEDIUM' ? colors.yellow : colors.blue;
    console.log(`${color}${finding.severity}: ${finding.issue}${colors.reset}`);
    if (finding.file) console.log(`  File: ${finding.file}`);
    console.log(`  Fix: ${finding.recommendation}`);
  });
  
  if (findings.length === 0) {
    log.success('No critical security issues found');
  }
}

/**
 * Generate Audit Report
 */
function generateAuditReport() {
  log.header('GENERATING AUDIT REPORT');
  
  const report = `# ENVIRONMENT AUDIT REPORT
Generated: ${new Date().toISOString()}

## 🎯 EXECUTIVE SUMMARY

### Environment Status
${Object.entries(auditResults.environmentParity).map(([env, result]) => 
  `- **${env}**: ${result.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}`
).join('\n')}

### Supabase Connectivity
${Object.entries(auditResults.supabaseConnections).map(([env, result]) => 
  `- **${env}**: ${result.status === 'PASS' ? '✅ CONNECTED' : '❌ FAILED'} (${result.url})`
).join('\n')}

### Security Findings
- **Total Issues**: ${auditResults.securityFindings.length}
- **High Severity**: ${auditResults.securityFindings.filter(f => f.severity === 'HIGH').length}
- **Medium Severity**: ${auditResults.securityFindings.filter(f => f.severity === 'MEDIUM').length}

## 📊 DETAILED RESULTS

### 1️⃣ Environment Parity
\`\`\`json
${JSON.stringify(auditResults.environmentParity, null, 2)}
\`\`\`

### 2️⃣ Supabase Connections
\`\`\`json
${JSON.stringify(auditResults.supabaseConnections, null, 2)}
\`\`\`

### 3️⃣ Magic Link Configuration
\`\`\`json
${JSON.stringify(auditResults.magicLinkTests, null, 2)}
\`\`\`

### 4️⃣ Admin/User Sync
\`\`\`json
${JSON.stringify(auditResults.adminUserSync, null, 2)}
\`\`\`

### 5️⃣ Security Findings
${auditResults.securityFindings.map(finding => 
  `- **${finding.severity}**: ${finding.issue}\n  - Fix: ${finding.recommendation}${finding.file ? `\n  - File: ${finding.file}` : ''}`
).join('\n')}

## 🔧 RECOMMENDATIONS

### Immediate Actions Required
${auditResults.securityFindings.filter(f => f.severity === 'HIGH').map(f => 
  `1. ${f.issue} - ${f.recommendation}`
).join('\n')}

### Environment Fixes Needed
${Object.entries(auditResults.environmentParity).filter(([_, result]) => result.status === 'FAIL').map(([env, result]) => 
  `1. **${env}**: ${result.missing?.length ? `Add missing variables: ${result.missing.join(', ')}` : result.error}`
).join('\n')}

### Connection Issues
${Object.entries(auditResults.supabaseConnections).filter(([_, result]) => result.status === 'FAIL').map(([env, result]) => 
  `1. **${env}**: ${result.error}`
).join('\n')}

## ✅ DEPLOYMENT CHECKLIST

- [ ] All environment variables present in production
- [ ] Supabase connections working in all environments  
- [ ] Magic Link authentication configured
- [ ] Admin and User apps use same Supabase project
- [ ] Security headers configured
- [ ] CORS properly restricted
- [ ] No hardcoded secrets in source code
- [ ] RLS policies enabled on sensitive tables

## 🚨 HOTFIX PLAN

If critical issues found:
1. Rotate any exposed API keys immediately
2. Update environment variables in Vercel dashboard
3. Redeploy applications
4. Test authentication flow
5. Verify admin/user data sync

---
*Audit completed successfully. Review findings and apply recommendations.*
`;

  fs.writeFileSync(path.join(__dirname, 'audit-report.md'), report);
  log.success('Audit report generated: audit-report.md');
}

/**
 * Main audit execution
 */
async function runAudit() {
  console.log(`${colors.bold}${colors.blue}
╔══════════════════════════════════════════════════════════════╗
║                    TESTINGVALA ENVIRONMENT AUDIT            ║
║                     Full System Health Check                ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

  try {
    await checkEnvironmentParity();
    await checkSupabaseConnections();
    await checkMagicLinkAuth();
    await checkAdminUserSync();
    await checkDockerConnectivity();
    await checkSecurityPosture();
    
    generateAuditReport();
    
    log.header('AUDIT COMPLETE');
    log.success('Full audit completed successfully!');
    log.info('Review audit-report.md for detailed findings and recommendations');
    
  } catch (error) {
    log.error(`Audit failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the audit
runAudit();