-- ============================================================================
-- SUPABASE EMAIL CONFIGURATION FOR TESTINGVALA
-- ============================================================================
-- This file contains the SQL commands to configure custom email templates
-- and SMTP settings for TestingVala magic link authentication
-- ============================================================================

-- 1. First, you need to configure SMTP settings in Supabase Dashboard:
-- Go to: Authentication > Settings > SMTP Settings
-- Configure your email provider (Gmail, SendGrid, Mailgun, etc.)

-- Example SMTP Configuration (to be set in Supabase Dashboard):
/*
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: [SET_IN_DASHBOARD]
SMTP Pass: [SET_IN_DASHBOARD]
Sender Name: TestingVala Community
Sender Email: [SET_IN_DASHBOARD]
*/

-- 2. Custom Email Templates (Optional - can be set in Dashboard)
-- You can customize the magic link email template in:
-- Authentication > Settings > Email Templates

-- Example Magic Link Email Template:
/*
Subject: Welcome to TestingVala - Verify Your Email

HTML Template:
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to TestingVala</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Welcome to TestingVala!</h1>
            <p>Join the global QA community</p>
        </div>
        <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Hi there!</p>
            <p>Welcome to TestingVala, the premier platform for QA professionals to showcase skills, participate in contests, and connect with the global testing community.</p>
            <p>Click the button below to verify your email and start participating:</p>
            <a href="{{ .ConfirmationURL }}" class="button">Verify Email & Join Community</a>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">{{ .ConfirmationURL }}</p>
            <p><strong>What you can do after verification:</strong></p>
            <ul>
                <li>💬 Comment on community posts</li>
                <li>❤️ Like and save posts to your boards</li>
                <li>🏆 Participate in monthly QA contests</li>
                <li>📝 Share your testing expertise</li>
                <li>🎯 Build your professional network</li>
            </ul>
        </div>
        <div class="footer">
            <p>This link will expire in 24 hours for security reasons.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <p>© 2025 TestingVala - Empowering QA Professionals Worldwide</p>
            <p>
                <a href="https://testingvala.com">Website</a> | 
                <a href="https://instagram.com/testingvala">Instagram</a> | 
                <a href="https://youtube.com/@TestingvalaOfficial">YouTube</a>
            </p>
        </div>
    </div>
</body>
</html>
*/

-- 3. Enable Row Level Security for auth-related tables (if needed)
-- This ensures proper security for authentication flows

-- Enable RLS on auth.users (usually already enabled)

-- 6. Update existing users table to ensure compatibility
-- The `user_profiles` table is now the single source of truth for user data.

-- 7. RLS policies for user_profiles are defined in `setup-boards-schema.sql`

-- 8. Create a function to check if user is verified
CREATE OR REPLACE FUNCTION public.is_user_verified(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = user_email 
    AND email_confirmed_at IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Update user verification status based on auth.users
CREATE OR REPLACE FUNCTION public.sync_user_verification()
RETURNS VOID AS $$
BEGIN
  UPDATE user_profiles 
  SET is_verified = true, updated_at = NOW()
  WHERE email IN (
    SELECT email FROM auth.users 
    WHERE email_confirmed_at IS NOT NULL
  ) AND is_verified = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the sync function once to update existing users
SELECT public.sync_user_verification();

-- 10. Create a scheduled job to periodically sync verification status (optional)
-- This requires the pg_cron extension to be enabled in Supabase
-- SELECT cron.schedule('sync-user-verification', '*/5 * * * *', 'SELECT public.sync_user_verification();');

-- ============================================================================
-- INSTRUCTIONS FOR SETUP:
-- ============================================================================
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. Go to Supabase Dashboard > Authentication > Settings > SMTP Settings
-- 3. Configure your SMTP provider (Gmail recommended for simplicity)
-- 4. Optionally customize email templates in Authentication > Settings > Email Templates
-- 5. Test the magic link functionality
-- ============================================================================

-- Test query to verify setup
SELECT 
  'Setup verification' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') 
    THEN '✅ Users table exists'
    ELSE '❌ Users table missing'
  END as users_table,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'handle_new_user') 
    THEN '✅ User creation function exists'
    ELSE '❌ User creation function missing'
  END as user_function,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'is_user_verified') 
    THEN '✅ Verification check function exists'
    ELSE '❌ Verification check function missing'
  END as verification_function;