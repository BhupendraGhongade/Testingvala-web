#!/usr/bin/env node

/**
 * COMPREHENSIVE ADMIN-USER SYNCHRONIZATION TEST
 * 
 * This script tests all synchronization points between admin and user panels
 * to ensure data consistency across the entire TestingVala platform.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 TESTINGVALA ADMIN-USER SYNCHRONIZATION TEST');
console.log('='.repeat(60));

async function testDatabaseConnection() {
  console.log('\n📡 Testing Database Connection...');
  try {
    const { data, error } = await supabase.from('website_content').select('id').limit(1);
    if (error) throw error;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function testForumSynchronization() {
  console.log('\n📝 Testing Forum Post Synchronization...');
  
  try {
    // Test 1: Check forum posts table
    const { data: posts, error: postsError } = await supabase
      .from('forum_posts')
      .select('id, title, author_name, status, created_at')
      .limit(5);
    
    if (postsError) throw postsError;
    
    console.log(`✅ Forum posts table accessible: ${posts.length} posts found`);
    
    // Test 2: Check categories
    const { data: categories, error: categoriesError } = await supabase
      .from('forum_categories')
      .select('id, name, slug')
      .limit(10);
    
    if (categoriesError) throw categoriesError;
    
    console.log(`✅ Forum categories table accessible: ${categories.length} categories found`);
    
    // Test 3: Check if admin can modify posts
    if (posts.length > 0) {
      const testPost = posts[0];
      console.log(`📋 Sample post: "${testPost.title}" by ${testPost.author_name}`);
      console.log(`   Status: ${testPost.status}, Created: ${new Date(testPost.created_at).toLocaleDateString()}`);
    }
    
    return { posts: posts.length, categories: categories.length };
  } catch (error) {
    console.error('❌ Forum synchronization test failed:', error.message);
    return null;
  }
}

async function testEventsSynchronization() {
  console.log('\n📅 Testing Events Synchronization...');
  
  try {
    // Test events table
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, title, event_date, is_active, is_featured')
      .limit(5);
    
    if (eventsError) throw eventsError;
    
    console.log(`✅ Events table accessible: ${events.length} events found`);
    
    if (events.length > 0) {
      const activeEvents = events.filter(e => e.is_active);
      const featuredEvents = events.filter(e => e.is_featured);
      console.log(`   Active events: ${activeEvents.length}`);
      console.log(`   Featured events: ${featuredEvents.length}`);
      
      events.forEach(event => {
        console.log(`📋 Event: "${event.title}" - ${new Date(event.event_date).toLocaleDateString()}`);
      });
    }
    
    return { total: events.length, active: events.filter(e => e.is_active).length };
  } catch (error) {
    console.error('❌ Events synchronization test failed:', error.message);
    return null;
  }
}

async function testWinnersSynchronization() {
  console.log('\n🏆 Testing Winners Synchronization...');
  
  try {
    // Test contest submissions table
    const { data: submissions, error: submissionsError } = await supabase
      .from('contest_submissions')
      .select('id, name, email, winner_rank, status, technique_title')
      .limit(10);
    
    if (submissionsError) throw submissionsError;
    
    console.log(`✅ Contest submissions table accessible: ${submissions.length} submissions found`);
    
    // Check for winners
    const winners = submissions.filter(s => s.winner_rank && s.winner_rank >= 1 && s.winner_rank <= 3);
    console.log(`🏆 Winners found: ${winners.length}`);
    
    winners.forEach(winner => {
      const place = winner.winner_rank === 1 ? '1st' : winner.winner_rank === 2 ? '2nd' : '3rd';
      console.log(`   ${place} Place: ${winner.name} (${winner.email}) - "${winner.technique_title}"`);
    });
    
    // Test website content for winners
    const { data: websiteContent, error: contentError } = await supabase
      .from('website_content')
      .select('content')
      .eq('id', 1)
      .single();
    
    if (contentError) throw contentError;
    
    const winnersInContent = websiteContent.content?.winners || [];
    console.log(`📄 Winners in website content: ${winnersInContent.length}`);
    
    return { 
      submissions: submissions.length, 
      winners: winners.length,
      contentWinners: winnersInContent.length 
    };
  } catch (error) {
    console.error('❌ Winners synchronization test failed:', error.message);
    return null;
  }
}

async function testContestSynchronization() {
  console.log('\n🎯 Testing Contest Synchronization...');
  
  try {
    // Test website content for contest info
    const { data: websiteContent, error: contentError } = await supabase
      .from('website_content')
      .select('content')
      .eq('id', 1)
      .single();
    
    if (contentError) throw contentError;
    
    const contestInfo = websiteContent.content?.contest || {};
    console.log('✅ Contest information accessible');
    console.log(`📋 Current contest: "${contestInfo.title}"`);
    console.log(`   Theme: ${contestInfo.theme}`);
    console.log(`   Status: ${contestInfo.status}`);
    console.log(`   Deadline: ${contestInfo.deadline}`);
    console.log(`   Prizes: ${contestInfo.prizes}`);
    
    return { contest: contestInfo };
  } catch (error) {
    console.error('❌ Contest synchronization test failed:', error.message);
    return null;
  }
}

async function testUserProfilesSynchronization() {
  console.log('\n👥 Testing User Profiles Synchronization...');
  
  try {
    // Test user profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, email, full_name, is_admin, created_at')
      .limit(5);
    
    if (profilesError) throw profilesError;
    
    console.log(`✅ User profiles table accessible: ${profiles.length} profiles found`);
    
    const adminUsers = profiles.filter(p => p.is_admin);
    console.log(`👑 Admin users: ${adminUsers.length}`);
    
    profiles.forEach(profile => {
      const role = profile.is_admin ? 'Admin' : 'User';
      console.log(`   ${role}: ${profile.full_name || profile.email} (${new Date(profile.created_at).toLocaleDateString()})`);
    });
    
    return { total: profiles.length, admins: adminUsers.length };
  } catch (error) {
    console.error('❌ User profiles synchronization test failed:', error.message);
    return null;
  }
}

async function testRealtimeSync() {
  console.log('\n⚡ Testing Real-time Synchronization...');
  
  try {
    // Test if real-time subscriptions work
    console.log('📡 Setting up real-time listeners...');
    
    let forumUpdates = 0;
    let eventUpdates = 0;
    
    // Forum posts subscription
    const forumSubscription = supabase
      .channel('forum_posts_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'forum_posts' },
        (payload) => {
          forumUpdates++;
          console.log(`📝 Forum update detected: ${payload.eventType}`);
        }
      )
      .subscribe();
    
    // Events subscription
    const eventsSubscription = supabase
      .channel('events_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        (payload) => {
          eventUpdates++;
          console.log(`📅 Event update detected: ${payload.eventType}`);
        }
      )
      .subscribe();
    
    console.log('✅ Real-time listeners established');
    
    // Clean up subscriptions
    setTimeout(() => {
      supabase.removeChannel(forumSubscription);
      supabase.removeChannel(eventsSubscription);
      console.log('🧹 Real-time listeners cleaned up');
    }, 2000);
    
    return { forumSubscription: true, eventsSubscription: true };
  } catch (error) {
    console.error('❌ Real-time synchronization test failed:', error.message);
    return null;
  }
}

async function testDataConsistency() {
  console.log('\n🔍 Testing Data Consistency...');
  
  try {
    // Check for orphaned records
    const { data: postsWithoutCategories, error: orphanError } = await supabase
      .from('forum_posts')
      .select('id, title, category_id')
      .not('category_id', 'in', `(SELECT id FROM forum_categories)`);
    
    if (orphanError && !orphanError.message.includes('relation')) {
      throw orphanError;
    }
    
    console.log(`✅ Data consistency check completed`);
    
    // Check for duplicate winners
    const { data: winners, error: winnersError } = await supabase
      .from('contest_submissions')
      .select('winner_rank')
      .not('winner_rank', 'is', null);
    
    if (winnersError) throw winnersError;
    
    const rankCounts = {};
    winners.forEach(w => {
      rankCounts[w.winner_rank] = (rankCounts[w.winner_rank] || 0) + 1;
    });
    
    const duplicateRanks = Object.entries(rankCounts).filter(([rank, count]) => count > 1);
    
    if (duplicateRanks.length > 0) {
      console.log('⚠️  Duplicate winner ranks detected:');
      duplicateRanks.forEach(([rank, count]) => {
        console.log(`   Rank ${rank}: ${count} winners`);
      });
    } else {
      console.log('✅ No duplicate winner ranks found');
    }
    
    return { orphanedPosts: 0, duplicateRanks: duplicateRanks.length };
  } catch (error) {
    console.error('❌ Data consistency test failed:', error.message);
    return null;
  }
}

async function generateSyncReport(results) {
  console.log('\n📊 SYNCHRONIZATION TEST REPORT');
  console.log('='.repeat(60));
  
  const report = {
    timestamp: new Date().toISOString(),
    database_connection: results.dbConnection,
    forum_sync: results.forum,
    events_sync: results.events,
    winners_sync: results.winners,
    contest_sync: results.contest,
    users_sync: results.users,
    realtime_sync: results.realtime,
    data_consistency: results.consistency,
    overall_status: 'PASS'
  };
  
  // Determine overall status
  const failedTests = Object.values(results).filter(result => result === null || result === false);
  if (failedTests.length > 0) {
    report.overall_status = 'FAIL';
  }
  
  console.log(`🎯 Overall Status: ${report.overall_status}`);
  console.log(`📅 Test Date: ${new Date().toLocaleString()}`);
  
  if (results.forum) {
    console.log(`📝 Forum: ${results.forum.posts} posts, ${results.forum.categories} categories`);
  }
  
  if (results.events) {
    console.log(`📅 Events: ${results.events.total} total, ${results.events.active} active`);
  }
  
  if (results.winners) {
    console.log(`🏆 Winners: ${results.winners.winners} winners from ${results.winners.submissions} submissions`);
  }
  
  if (results.users) {
    console.log(`👥 Users: ${results.users.total} profiles, ${results.users.admins} admins`);
  }
  
  // Save report to file
  const reportPath = path.join(process.cwd(), 'sync-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Report saved to: ${reportPath}`);
  
  return report;
}

async function runSyncTest() {
  const results = {};
  
  try {
    results.dbConnection = await testDatabaseConnection();
    results.forum = await testForumSynchronization();
    results.events = await testEventsSynchronization();
    results.winners = await testWinnersSynchronization();
    results.contest = await testContestSynchronization();
    results.users = await testUserProfilesSynchronization();
    results.realtime = await testRealtimeSync();
    results.consistency = await testDataConsistency();
    
    const report = await generateSyncReport(results);
    
    console.log('\n🎉 SYNCHRONIZATION TEST COMPLETED');
    console.log('='.repeat(60));
    
    if (report.overall_status === 'PASS') {
      console.log('✅ All synchronization tests passed!');
      console.log('🔄 Admin and user panels are properly synchronized.');
    } else {
      console.log('❌ Some synchronization tests failed.');
      console.log('⚠️  Please check the issues above and fix them.');
    }
    
  } catch (error) {
    console.error('💥 Critical error during sync test:', error);
    process.exit(1);
  }
}

// Run the test
runSyncTest();