import { supabase } from './src/lib/supabase.js';

async function debugAuth() {
  console.log('🔍 Debugging Supabase Auth Configuration...');
  
  // Test 1: Check Supabase connection
  try {
    const { data, error } = await supabase.auth.getSession();
    console.log('✅ Supabase connection:', error ? 'Failed' : 'Success');
    if (error) console.log('❌ Connection error:', error);
  } catch (err) {
    console.log('❌ Supabase client error:', err);
  }

  // Test 2: Try magic link with detailed logging
  try {
    console.log('🧪 Testing magic link...');
    const { data, error } = await supabase.auth.signInWithOtp({
      email: 'test@example.com',
      options: {
        emailRedirectTo: 'http://localhost:5173/auth/callback'
      }
    });
    
    console.log('📧 Magic link response:', { data, error });
    
    if (error) {
      console.log('❌ Error details:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        code: error.code
      });
    }
  } catch (err) {
    console.log('❌ Magic link test failed:', err);
  }

  // Test 3: Check auth settings
  try {
    const response = await fetch(`https://qxsardezvxsquvejvsso.supabase.co/auth/v1/settings`, {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4c2FyZGV6dnhzcXV2ZWp2c3NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NDc2OTMsImV4cCI6MjA3MTAyMzY5M30.ZQhcxebPR4kvAAwCIJr7WlugVwoZivTDN9ID3p_aC04'
      }
    });
    const settings = await response.json();
    console.log('⚙️ Auth settings:', settings);
  } catch (err) {
    console.log('❌ Settings check failed:', err);
  }
}

debugAuth();