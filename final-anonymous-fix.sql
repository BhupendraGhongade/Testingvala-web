-- FINAL FIX: Allow unverified/anonymous users to read posts
-- This is the root cause of the visibility issue

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "public_read_posts" ON forum_posts;
DROP POLICY IF EXISTS "anonymous_read_posts" ON forum_posts;
DROP POLICY IF EXISTS "authenticated_read_posts" ON forum_posts;
DROP POLICY IF EXISTS "admin_full_access" ON forum_posts;

-- 1. UNIVERSAL READ ACCESS - No authentication required for reading
-- This allows anonymous, unverified, and verified users to read posts
CREATE POLICY "universal_read_access" ON forum_posts
  FOR SELECT 
  USING (status = 'active');

-- 2. ADMIN FULL ACCESS - Admins see everything regardless of status
CREATE POLICY "admin_full_access" ON forum_posts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.is_admin = true
    )
  );

-- Ensure RLS is enabled but allows public read
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

-- Test the fix - this should work without authentication
SELECT 
  id, title, author_name, status, created_at 
FROM forum_posts 
WHERE status = 'active' 
ORDER BY created_at DESC 
LIMIT 5;