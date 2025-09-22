import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function testMagicLink() {
  try {
    console.log('Testing magic link...')
    
    const { data, error } = await supabase.auth.signInWithOtp({
      email: 'test@example.com', // Replace with your email
      options: {
        emailRedirectTo: 'http://localhost:5173/auth/callback'
      }
    })

    if (error) {
      console.error('❌ Magic link failed:', error.message)
    } else {
      console.log('✅ Magic link sent successfully!')
      console.log('Check your email for the magic link.')
    }
  } catch (err) {
    console.error('❌ Test failed:', err.message)
  }
}

testMagicLink()