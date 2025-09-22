// Complete debugging script for winners issue
// Run this in browser console on the Winners page

console.log('🔍 Starting complete winners debugging...');

// 1. Check environment variables
console.log('📋 Environment Variables:');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing');

// 2. Check Supabase client
import { supabase } from './src/lib/supabase.js';
console.log('🔧 Supabase client:', supabase);

// 3. Test database connection
async function testDatabase() {
  try {
    console.log('🧪 Testing database connection...');
    
    // Test 1: Basic connection
    const { data: testData, error: testError } = await supabase
      .from('contest_submissions')
      .select('count')
      .limit(1);
    
    console.log('📊 Connection test:', { data: testData, error: testError });
    
    // Test 2: Check table structure
    const { data: structureData, error: structureError } = await supabase
      .from('contest_submissions')
      .select('id, name, email, winner_rank, status, created_at')
      .limit(3);
    
    console.log('🏗️ Table structure:', { data: structureData, error: structureError });
    
    // Test 3: Check for Bhupendra specifically
    const { data: bhupendraData, error: bhupendraError } = await supabase
      .from('contest_submissions')
      .select('*')
      .eq('email', 'bghongade@york.ie');
    
    console.log('👤 Bhupendra data:', { data: bhupendraData, error: bhupendraError });
    
    // Test 4: Check all winners
    const { data: winnersData, error: winnersError } = await supabase
      .from('contest_submissions')
      .select('*')
      .in('winner_rank', [1, 2, 3]);
    
    console.log('🏆 Winners data:', { data: winnersData, error: winnersError });
    
    // Test 5: Alternative winner query
    const { data: altWinners, error: altError } = await supabase
      .from('contest_submissions')
      .select('*')
      .not('winner_rank', 'is', null);
    
    console.log('🏆 Alt winners query:', { data: altWinners, error: altError });
    
    // Test 6: Raw SQL query
    const { data: rawData, error: rawError } = await supabase
      .rpc('get_winners_debug');
    
    console.log('🔧 Raw SQL query:', { data: rawData, error: rawError });
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

// 4. Check localStorage
console.log('💾 LocalStorage data:');
const localSubmissions = JSON.parse(localStorage.getItem('contest_submissions') || '[]');
console.log('Local submissions:', localSubmissions);
const localWinners = localSubmissions.filter(sub => sub.winner_rank);
console.log('Local winners:', localWinners);

// 5. Run all tests
testDatabase();

// 6. Manual winner creation test
async function createTestWinner() {
  try {
    console.log('🧪 Creating test winner...');
    
    const testSubmission = {
      name: 'Test Winner',
      email: 'test@example.com',
      contest_title: 'Test Contest',
      technique_title: 'Test Technique',
      technique_description: 'This is a test technique',
      submission_text: 'Test submission',
      winner_rank: 1,
      status: 'winner',
      winner_announcement_timestamp: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('contest_submissions')
      .insert([testSubmission])
      .select();
    
    console.log('🧪 Test winner creation:', { data, error });
    
    if (data) {
      // Clean up test data
      await supabase
        .from('contest_submissions')
        .delete()
        .eq('email', 'test@example.com');
      console.log('🧹 Test data cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Test winner creation failed:', error);
  }
}

// Run test winner creation
createTestWinner();

console.log('✅ Debugging script completed. Check console output above.');