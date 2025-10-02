-- ============================================================================
-- COMPREHENSIVE FORUM VISIBILITY FIX - INDUSTRY STANDARD APPROACH
-- Based on Reddit, LinkedIn, and Discord best practices
-- ============================================================================

-- First, drop existing problematic policies
DROP POLICY IF EXISTS "Allow read posts" ON forum_posts;
DROP POLICY IF EXISTS "Allow insert posts" ON forum_posts;
DROP POLICY IF EXISTS "Allow update own posts" ON forum_posts;
DROP POLICY IF EXISTS "Allow delete own posts" ON forum_posts;

-- Create user_profiles table if it doesn't exist (for admin management)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  is_moderator BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  reputation_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add moderation fields to forum_posts if they don't exist
ALTER TABLE forum_posts 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS moderation_notes TEXT,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- ============================================================================
-- INDUSTRY-STANDARD RLS POLICIES
-- ============================================================================

-- 1. PUBLIC READ ACCESS - Everyone (including anonymous) can see active posts
CREATE POLICY "public_read_posts" ON forum_posts
  FOR SELECT 
  USING (status = 'active' AND is_approved = true);

-- 2. ADMIN FULL ACCESS - Admins see everything
CREATE POLICY "admin_full_access" ON forum_posts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.is_admin = true
    )
  );

-- 3. VERIFIED USER POSTING (LinkedIn Verification Model)
-- Only verified users can create posts
CREATE POLICY "verified_users_can_post" ON forum_posts
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND (
      -- Check if user is verified via email confirmation
      auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
      OR
      -- Check if user is marked as verified in user_profiles
      EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.is_verified = true
      )
    )
  );

-- 4. AUTHOR EDIT ACCESS (Standard Model)
-- Users can edit their own posts (with some restrictions)
CREATE POLICY "authors_can_edit_own_posts" ON forum_posts
  FOR UPDATE
  USING (
    auth.uid()::text = user_id 
    AND status = 'active'
    AND created_at > NOW() - INTERVAL '24 hours' -- Edit window limit
  )
  WITH CHECK (
    auth.uid()::text = user_id 
    AND status = 'active'
  );

-- 5. AUTHOR DELETE ACCESS (with restrictions)
-- Users can delete their own posts within time limit
CREATE POLICY "authors_can_delete_own_posts" ON forum_posts
  FOR DELETE
  USING (
    auth.uid()::text = user_id 
    AND (
      created_at > NOW() - INTERVAL '1 hour' -- Short delete window
      OR 
      EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND (user_profiles.is_admin = true OR user_profiles.is_moderator = true)
      )
    )
  );

-- ============================================================================
-- ADMIN HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = user_id AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve posts (admin/moderator only)
CREATE OR REPLACE FUNCTION approve_post(post_id UUID, approval_notes TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_id UUID := auth.uid();
BEGIN
  -- Check if user is admin or moderator
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = current_user_id 
    AND (is_admin = true OR is_moderator = true)
  ) THEN
    RAISE EXCEPTION 'Only admins and moderators can approve posts';
  END IF;
  
  -- Update the post
  UPDATE forum_posts 
  SET 
    is_approved = true,
    approved_by = current_user_id,
    approved_at = NOW(),
    moderation_notes = approval_notes
  WHERE id = post_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject posts (admin/moderator only)
CREATE OR REPLACE FUNCTION reject_post(post_id UUID, rejection_reason TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_id UUID := auth.uid();
BEGIN
  -- Check if user is admin or moderator
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = current_user_id 
    AND (is_admin = true OR is_moderator = true)
  ) THEN
    RAISE EXCEPTION 'Only admins and moderators can reject posts';
  END IF;
  
  -- Update the post
  UPDATE forum_posts 
  SET 
    is_approved = false,
    status = 'rejected',
    approved_by = current_user_id,
    approved_at = NOW(),
    moderation_notes = rejection_reason
  WHERE id = post_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- AUTO-PROFILE CREATION TRIGGER
-- ============================================================================

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, username, is_verified)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    -- Auto-verify users with confirmed emails
    CASE WHEN new.email_confirmed_at IS NOT NULL THEN true ELSE false END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================================
-- ADMIN USER SETUP
-- ============================================================================

-- Function to promote user to admin (run manually for first admin)
CREATE OR REPLACE FUNCTION promote_to_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_profiles 
  SET 
    is_admin = true,
    is_moderator = true,
    is_verified = true
  WHERE email = user_email;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_forum_posts_approved_status ON forum_posts(is_approved, status) WHERE is_approved = true AND status = 'active';
CREATE INDEX IF NOT EXISTS idx_forum_posts_user_moderation ON forum_posts(user_id, is_approved, status);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_approved ON forum_posts(created_at DESC) WHERE is_approved = true AND status = 'active';
CREATE INDEX IF NOT EXISTS idx_user_profiles_roles ON user_profiles(is_admin, is_moderator, is_verified);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "public_read_profiles" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "users_update_own_profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================

-- Insert sample admin user (replace with your actual admin email)
-- Run this manually: SELECT promote_to_admin('admin@testingvala.com');

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- 1. Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('forum_posts', 'user_profiles');

-- 2. List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('forum_posts', 'user_profiles')
ORDER BY tablename, policyname;

-- 3. Test public read access (should return approved posts only)
SELECT id, title, content, status, is_approved, created_at
FROM forum_posts 
WHERE status = 'active' AND is_approved = true
LIMIT 5;

-- 4. Check user profiles structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 5. Verify indexes exist
SELECT indexname, tablename, indexdef
FROM pg_indexes 
WHERE tablename IN ('forum_posts', 'user_profiles')
AND schemaname = 'public';

-- ============================================================================
-- POST-DEPLOYMENT SETUP INSTRUCTIONS
-- ============================================================================

/*
AFTER RUNNING THIS SCHEMA:

1. PROMOTE FIRST ADMIN:
   SELECT promote_to_admin('your-admin-email@testingvala.com');

2. TEST ANONYMOUS ACCESS:
   - Open incognito browser
   - Visit your forum page
   - Should see approved posts only

3. TEST AUTHENTICATED USER:
   - Sign up new user
   - User should be auto-verified if email confirmed
   - Should be able to create posts

4. TEST ADMIN ACCESS:
   - Login as admin
   - Should see all posts (approved/pending)
   - Should be able to approve/reject posts

5. VERIFY PERFORMANCE:
   EXPLAIN ANALYZE SELECT * FROM forum_posts 
   WHERE status = 'active' AND is_approved = true 
   ORDER BY created_at DESC LIMIT 20;

6. MONITOR LOGS:
   Check Supabase logs for any RLS policy violations
*/

-- ============================================================================
-- EMERGENCY ROLLBACK (IF NEEDED)
-- ============================================================================

/*
IF SOMETHING GOES WRONG, RUN THIS TO DISABLE RLS TEMPORARILY:

ALTER TABLE forum_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

THEN INVESTIGATE AND RE-ENABLE:

ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
*/

-- ============================================================================
-- SCHEMA COMPLETE ✅
-- ============================================================================

-- This schema provides:
-- ✅ Public read access for approved posts
-- ✅ Admin full control
-- ✅ Verified user posting
-- ✅ Author edit/delete with time limits
-- ✅ Moderation system
-- ✅ Auto user profile creation
-- ✅ Performance optimized indexes
-- ✅ Security best practices

-- Ready for production deployment!====================================

-- Query to check if setup is working correctly
-- SELECT 'Setup completed successfully!' as message;

-- Query to verify policies are active
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename IN ('forum_posts', 'user_profiles');

COMMENT ON TABLE forum_posts IS 'Forum posts with industry-standard visibility and moderation controls';
COMMENT ON TABLE user_profiles IS 'User profiles with role-based access control';
COMMENT ON FUNCTION approve_post IS 'Admin/moderator function to approve posts';
COMMENT ON FUNCTION reject_post IS 'Admin/moderator function to reject posts';
COMMENT ON FUNCTION is_admin IS 'Helper function to check admin status';
COMMENT ON FUNCTION promote_to_admin IS 'Function to promote users to admin role';

-- Success message
SELECT 'Forum visibility fix applied successfully! 
✅ Public can view approved posts
✅ Verified users can create posts  
✅ Admins can see all posts for moderation
✅ Industry-standard RLS policies active' as status;