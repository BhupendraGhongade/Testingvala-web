import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hqvvswhqyazfbdmsfplz.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxdnZzd2hxeWF6ZmJkbXNmcGx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMzIwMTUsImV4cCI6MjA3MDkwODAxNX0.99uzuk8iHqCaC5Arv9VzZM1ky2driiZ8zBYDhuz2TNI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database tables structure:
// 1. website_content - stores all website content (contest, hero, about, contact, winners)
// 2. users - stores user registrations and profiles
// 3. contest_submissions - stores contest submissions
// 4. admin_sessions - stores admin authentication sessions

export const TABLES = {
  WEBSITE_CONTENT: 'website_content',
  USERS: 'users',
  CONTEST_SUBMISSIONS: 'contest_submissions',
  ADMIN_SESSIONS: 'admin_sessions'
}
