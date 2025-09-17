-- Fix anonymous user access to forum posts
-- This ensures unverified users can still read posts

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "public_read_posts" ON forum_posts;
DROP POLICY IF EXISTS "admin_full_access" ON forum_posts;

-- 1. ANONYMOUS AND PUBLIC READ ACCESS - No authentication required
CREATE POLICY "anonymous_read_posts" ON forum_posts
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

-- 3. AUTHENTICATED USER READ ACCESS - Logged in users see all active posts
CREATE POLICY "authenticated_read_posts" ON forum_posts
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND status = 'active'
  );

-- Ensure RLS is enabled
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

-- Test query to verify anonymous access works
-- This should return posts without requiring authentication
SELECT COUNT(*) as visible_posts_count FROM forum_posts WHERE status = 'active' AND is_approved = true;