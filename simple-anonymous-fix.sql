-- SIMPLE FIX: Allow anonymous users to read posts without user_profiles dependency

-- Drop all existing policies
DROP POLICY IF EXISTS "public_read_posts" ON forum_posts;
DROP POLICY IF EXISTS "anonymous_read_posts" ON forum_posts;
DROP POLICY IF EXISTS "authenticated_read_posts" ON forum_posts;
DROP POLICY IF EXISTS "admin_full_access" ON forum_posts;
DROP POLICY IF EXISTS "universal_read_access" ON forum_posts;

-- 1. SIMPLE PUBLIC READ - Anyone can read active posts
CREATE POLICY "simple_public_read" ON forum_posts
  FOR SELECT 
  USING (status = 'active');

-- 2. SIMPLE ADMIN ACCESS - Use email-based admin check (no user_profiles needed)
CREATE POLICY "simple_admin_access" ON forum_posts
  FOR ALL
  USING (
    auth.jwt() ->> 'email' IN ('admin@testingvala.com', 'owner@testingvala.com')
  );

-- Ensure RLS is enabled
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

-- Test query - should work for anonymous users
SELECT COUNT(*) as visible_posts FROM forum_posts WHERE status = 'active';