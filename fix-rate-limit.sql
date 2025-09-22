-- ============================================================================
-- FIX SUPABASE RATE LIMIT AND EMAIL CONFIGURATION
-- ============================================================================

-- 1. Check current auth configuration
SELECT 
  'Auth Config Check' as status,
  current_timestamp as checked_at;

-- 2. Reset rate limit (if you have admin access)
-- This requires superuser privileges - run in Supabase Dashboard SQL Editor

-- 3. Check if SMTP is properly configured
-- Go to Supabase Dashboard > Authentication > Settings > SMTP Settings
-- Ensure these are set:
/*
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: info@testingvala.com  
SMTP Pass: [Your Gmail App Password]
Sender Name: TestingVala
Sender Email: info@testingvala.com
Enable SMTP: YES
*/

-- 4. Alternative: Use a different email for testing
-- Try with a different email address to bypass rate limit

-- 5. Check auth rate limits in your project
-- Go to: https://supabase.com/dashboard/project/qxsardezvxsquvejvsso/auth/rate-limits

-- 6. Temporary fix: Wait 1 hour or use different email
-- Rate limits reset after time period

-- 7. Production fix: Upgrade Supabase plan for higher limits
-- Free tier has very low email limits