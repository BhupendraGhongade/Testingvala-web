// Simple test to check Supabase auth configuration
const SUPABASE_URL = 'https://qxsardezvxsquvejvsso.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4c2FyZGV6dnhzcXV2ZWp2c3NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NDc2OTMsImV4cCI6MjA3MTAyMzY5M30.ZQhcxebPR4kvAAwCIJr7WlugVwoZivTDN9ID3p_aC04';

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