// Test Supabase email delivery
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your_supabase_url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your_supabase_anon_key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmailDelivery() {
  console.log('🧪 Testing Supabase Email Delivery\n');
  
  const testEmail = 'test@testingvala.com';
  
  try {
    console.log(`📧 Sending magic link to: ${testEmail}`);
    
    const { data, error } = await supabase.auth.signInWithOtp({
      email: testEmail,
      options: {
        emailRedirectTo: 'https://your-domain.vercel.app/auth/callback'
      }
    });

    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }

    console.log('✅ Success! Magic link sent via Supabase');
    console.log('📊 Response:', data);
    console.log('\n📋 Next Steps:');
    console.log('1. Check your email inbox');
    console.log('2. Click the magic link');
    console.log('3. You should be redirected to /auth/callback');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testEmailDelivery();