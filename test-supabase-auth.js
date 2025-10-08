// Simple test to check Supabase auth configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'local_key';

async function testSupabaseAuth() {
  try {
    console.log('Testing Supabase auth...');
    
    const response = await fetch(`${SUPABASE_URL}/auth/v1/otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        email: 'test@example.com',
        create_user: true,
        gotrue_meta_security: {}
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Supabase auth working');
      console.log('Response:', data);
    } else {
      console.error('❌ Supabase auth failed');
      console.error('Status:', response.status);
      console.error('Error:', data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSupabaseAuth();