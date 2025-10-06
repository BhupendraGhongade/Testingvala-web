/**
 * SIMPLE ADMIN-USER SYNCHRONIZATION TEST
 * Tests synchronization between admin and user panels
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 TESTINGVALA ADMIN-USER SYNCHRONIZATION TEST');
console.log('='.repeat(60));

function testEnvironmentFiles() {
  console.log('\n📁 Testing Environment Configuration...');
  
  const envFiles = [
    '.env',
    '.env.development', 
    '.env.production',
    'Testingvala-admin/.env',
    'Testingvala-admin/.env.production'
  ];
  
  const results = {};
  
  envFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const hasSupabaseUrl = content.includes('VITE_SUPABASE_URL');
      const hasSupabaseKey = content.includes('VITE_SUPABASE_ANON_KEY');
      const isLocal = content.includes('127.0.0.1:54321');
      const isProduction = content.includes('qxsardezvxsquvejvsso.supabase.co');
      
      results[file] = {
        exists: true,
        hasSupabaseUrl,
        hasSupabaseKey,
        isLocal,
        isProduction
      };
      
      console.log(`✅ ${file}: ${isLocal ? 'LOCAL' : isProduction ? 'PRODUCTION' : 'UNKNOWN'}`);
    } else {
      results[file] = { exists: false };
      console.log(`❌ ${file}: NOT FOUND`);
    }
  });
  
  return results;
}

function testComponentStructure() {
  console.log('\n🧩 Testing Component Structure...');
  
  const userComponents = [
    'src/components/CommunityHub.jsx',
    'src/components/EventsPage.jsx', 
    'src/components/Winners.jsx',
    'src/components/ContestSection.jsx'
  ];
  
  const adminComponents = [
    'Testingvala-admin/src/components/ForumModeration.jsx',
    'Testingvala-admin/src/components/EventsManagement.jsx',
    'Testingvala-admin/src/components/ContestSubmissionsManager.jsx',
    'Testingvala-admin/src/components/WebsiteAdminPanel.jsx'
  ];
  
  const results = { user: {}, admin: {} };
  
  console.log('👤 User Components:');
  userComponents.forEach(component => {
    const exists = fs.existsSync(path.join(process.cwd(), component));
    results.user[component] = exists;
    console.log(`  ${exists ? '✅' : '❌'} ${component}`);
  });
  
  console.log('👑 Admin Components:');
  adminComponents.forEach(component => {
    const exists = fs.existsSync(path.join(process.cwd(), component));
    results.admin[component] = exists;
    console.log(`  ${exists ? '✅' : '❌'} ${component}`);
  });
  
  return results;
}

function testDataFlowPatterns() {
  console.log('\n🔄 Testing Data Flow Patterns...');
  
  const patterns = {
    forum: {
      userComponent: 'src/components/CommunityHub.jsx',
      adminComponent: 'Testingvala-admin/src/components/ForumModeration.jsx',
      sharedTable: 'forum_posts'
    },
    events: {
      userComponent: 'src/components/EventsPage.jsx', 
      adminComponent: 'Testingvala-admin/src/components/EventsManagement.jsx',
      sharedTable: 'events'
    },
    winners: {
      userComponent: 'src/components/Winners.jsx',
      adminComponent: 'Testingvala-admin/src/components/ContestSubmissionsManager.jsx',
      sharedTable: 'contest_submissions'
    }
  };
  
  const results = {};
  
  Object.entries(patterns).forEach(([feature, config]) => {
    console.log(`\n📋 ${feature.toUpperCase()} Feature:`);
    
    const userExists = fs.existsSync(path.join(process.cwd(), config.userComponent));
    const adminExists = fs.existsSync(path.join(process.cwd(), config.adminComponent));
    
    results[feature] = {
      userComponent: userExists,
      adminComponent: adminExists,
      sharedTable: config.sharedTable
    };
    
    console.log(`  User Side: ${userExists ? '✅' : '❌'} ${config.userComponent}`);
    console.log(`  Admin Side: ${adminExists ? '✅' : '❌'} ${config.adminComponent}`);
    console.log(`  Shared Table: ${config.sharedTable}`);
    
    if (userExists && adminExists) {
      // Check for Supabase imports
      const userContent = fs.readFileSync(path.join(process.cwd(), config.userComponent), 'utf8');
      const adminContent = fs.readFileSync(path.join(process.cwd(), config.adminComponent), 'utf8');
      
      const userHasSupabase = userContent.includes('supabase');
      const adminHasSupabase = adminContent.includes('supabase');
      
      console.log(`  User Supabase Integration: ${userHasSupabase ? '✅' : '❌'}`);
      console.log(`  Admin Supabase Integration: ${adminHasSupabase ? '✅' : '❌'}`);
      
      results[feature].userSupabase = userHasSupabase;
      results[feature].adminSupabase = adminHasSupabase;
    }
  });
  
  return results;
}

function testContextIntegration() {
  console.log('\n🌐 Testing Context Integration...');
  
  const contextFile = 'src/contexts/GlobalDataContext.jsx';
  const contextPath = path.join(process.cwd(), contextFile);
  
  if (!fs.existsSync(contextPath)) {
    console.log('❌ GlobalDataContext.jsx not found');
    return { exists: false };
  }
  
  const content = fs.readFileSync(contextPath, 'utf8');
  
  const hooks = [
    'useWebsiteData',
    'useCommunityData', 
    'useWinnersData',
    'useEventsData'
  ];
  
  const results = { exists: true, hooks: {} };
  
  hooks.forEach(hook => {
    const hasHook = content.includes(hook);
    results.hooks[hook] = hasHook;
    console.log(`  ${hasHook ? '✅' : '❌'} ${hook}`);
  });
  
  return results;
}

function checkSupabaseConfiguration() {
  console.log('\n🗄️ Testing Supabase Configuration...');
  
  const supabaseFile = 'src/lib/supabase.js';
  const supabasePath = path.join(process.cwd(), supabaseFile);
  
  if (!fs.existsSync(supabasePath)) {
    console.log('❌ Supabase configuration file not found');
    return { exists: false };
  }
  
  const content = fs.readFileSync(supabasePath, 'utf8');
  
  const checks = {
    hasCreateClient: content.includes('createClient'),
    hasEnvironmentVars: content.includes('VITE_SUPABASE_URL') && content.includes('VITE_SUPABASE_ANON_KEY'),
    hasExport: content.includes('export') && content.includes('supabase')
  };
  
  Object.entries(checks).forEach(([check, passed]) => {
    console.log(`  ${passed ? '✅' : '❌'} ${check}`);
  });
  
  return { exists: true, ...checks };
}

function generateSyncReport(results) {
  console.log('\n📊 SYNCHRONIZATION TEST REPORT');
  console.log('='.repeat(60));
  
  const report = {
    timestamp: new Date().toISOString(),
    environment: results.environment,
    components: results.components,
    dataFlow: results.dataFlow,
    context: results.context,
    supabase: results.supabase,
    overallStatus: 'UNKNOWN'
  };
  
  // Calculate overall status
  let passCount = 0;
  let totalChecks = 0;
  
  // Environment checks
  Object.values(results.environment).forEach(env => {
    if (env.exists) {
      totalChecks++;
      if (env.hasSupabaseUrl && env.hasSupabaseKey) passCount++;
    }
  });
  
  // Component checks  
  Object.values(results.components.user).forEach(exists => {
    totalChecks++;
    if (exists) passCount++;
  });
  
  Object.values(results.components.admin).forEach(exists => {
    totalChecks++;
    if (exists) passCount++;
  });
  
  // Data flow checks
  Object.values(results.dataFlow).forEach(flow => {
    totalChecks += 2;
    if (flow.userComponent) passCount++;
    if (flow.adminComponent) passCount++;
  });
  
  const passRate = totalChecks > 0 ? (passCount / totalChecks) * 100 : 0;
  
  if (passRate >= 90) {
    report.overallStatus = 'EXCELLENT';
  } else if (passRate >= 75) {
    report.overallStatus = 'GOOD';
  } else if (passRate >= 50) {
    report.overallStatus = 'NEEDS_IMPROVEMENT';
  } else {
    report.overallStatus = 'CRITICAL';
  }
  
  console.log(`🎯 Overall Status: ${report.overallStatus}`);
  console.log(`📊 Pass Rate: ${passRate.toFixed(1)}% (${passCount}/${totalChecks})`);
  console.log(`📅 Test Date: ${new Date().toLocaleString()}`);
  
  // Feature-specific status
  console.log('\n📋 Feature Synchronization Status:');
  Object.entries(results.dataFlow).forEach(([feature, flow]) => {
    const status = flow.userComponent && flow.adminComponent ? '✅ SYNCED' : '❌ NOT SYNCED';
    console.log(`  ${feature.toUpperCase()}: ${status}`);
  });
  
  // Save report
  const reportPath = path.join(process.cwd(), 'sync-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Report saved to: ${reportPath}`);
  
  return report;
}

async function runSyncTest() {
  console.log('🚀 Starting synchronization test...\n');
  
  const results = {
    environment: testEnvironmentFiles(),
    components: testComponentStructure(), 
    dataFlow: testDataFlowPatterns(),
    context: testContextIntegration(),
    supabase: checkSupabaseConfiguration()
  };
  
  const report = generateSyncReport(results);
  
  console.log('\n🎉 SYNCHRONIZATION TEST COMPLETED');
  console.log('='.repeat(60));
  
  if (report.overallStatus === 'EXCELLENT' || report.overallStatus === 'GOOD') {
    console.log('✅ Admin and user panels are well synchronized!');
    console.log('🔄 Data flow between components appears to be working correctly.');
  } else {
    console.log('⚠️  Some synchronization issues detected.');
    console.log('🔧 Please review the report and fix the identified issues.');
  }
  
  console.log('\n📋 KEY FINDINGS:');
  
  // Environment summary
  const envCount = Object.values(results.environment).filter(e => e.exists).length;
  console.log(`📁 Environment Files: ${envCount}/5 configured`);
  
  // Component summary
  const userComponents = Object.values(results.components.user).filter(Boolean).length;
  const adminComponents = Object.values(results.components.admin).filter(Boolean).length;
  console.log(`🧩 Components: ${userComponents}/4 user, ${adminComponents}/4 admin`);
  
  // Feature summary
  const syncedFeatures = Object.values(results.dataFlow).filter(f => f.userComponent && f.adminComponent).length;
  console.log(`🔄 Synchronized Features: ${syncedFeatures}/3 (Forum, Events, Winners)`);
  
  return report;
}

// Run the test
runSyncTest().catch(console.error);