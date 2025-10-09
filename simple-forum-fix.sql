-- SIMPLE FORUM FIX - Make all posts visible to everyone

-- 1. Drop ALL existing policies
DROP POLICY IF EXISTS "Allow read posts" ON forum_posts;
DROP POLICY IF EXISTS "Allow insert posts" ON forum_posts;
DROP POLICY IF EXISTS "Allow update own posts" ON forum_posts;
DROP POLICY IF EXISTS "Allow delete own posts" ON forum_posts;
DROP POLICY IF EXISTS "public_can_read_approved_posts" ON forum_posts;
DROP POLICY IF EXISTS "authenticated_users_can_create_posts" ON forum_posts;
DROP POLICY IF EXISTS "users_can_update_own_posts" ON forum_posts;
DROP POLICY IF EXISTS "users_can_delete_own_posts" ON forum_posts;
DROP POLICY IF EXISTS "admin_can_see_all_posts" ON forum_posts;
DROP POLICY IF EXISTS "users_can_read_own_posts" ON forum_posts;
DROP POLICY IF EXISTS "users_and_admins_can_update_posts" ON forum_posts;
DROP POLICY IF EXISTS "users_and_admins_can_delete_posts" ON forum_posts;
DROP POLICY IF EXISTS "admin_full_access" ON forum_posts;
DROP POLICY IF EXISTS "public_read_approved" ON forum_posts;
DROP POLICY IF EXISTS "users_read_own" ON forum_posts;
DROP POLICY IF EXISTS "authenticated_create" ON forum_posts;
DROP POLICY IF EXISTS "users_update_own" ON forum_posts;
DROP POLICY IF EXISTS "users_delete_own" ON forum_posts;

-- 2. Temporarily disable RLS to see all posts
ALTER TABLE forum_posts DISABLE ROW LEVEL SECURITY;

-- 3. Add missing columns
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true;

-- 4. Approve all existing posts
UPDATE forum_posts SET is_approved = true WHERE is_approved IS NULL OR is_approved = false;

-- 5. Re-enable RLS with simple policies
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

-- 6. Create simple policies that work
-- Everyone can read all active posts
CREATE POLICY "everyone_can_read_posts" ON forum_posts
  FOR SELECT 
  USING (status = 'active');

-- Authenticated users can create posts
CREATE POLICY "authenticated_can_create" ON forum_posts
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own posts
CREATE POLICY "users_update_own" ON forum_posts
  FOR UPDATE
  USING (auth.uid() = user_id::uuid);

-- Users can delete their own posts
CREATE POLICY "users_delete_own" ON forum_posts
  FOR DELETE
  USING (auth.uid() = user_id::uuid);

-- 7. Verify posts are visible
SELECT 
  id, 
  title, 
  content, 
  user_id, 
  status, 
  is_approved,
  created_at
FROM forum_posts 
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 10;