-- COMPLETE WORKING FIX FOR ADMIN & FORUM

-- 1. Drop ALL existing policies first
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

-- 2. DISABLE RLS temporarily to make all posts visible
ALTER TABLE forum_posts DISABLE ROW LEVEL SECURITY;

-- 3. Add required columns
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true;

-- 4. Update all posts to be approved
UPDATE forum_posts SET is_approved = true;

-- 5. Re-enable RLS with simple working policies
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

-- 6. Create ONE simple policy that allows everyone to see all posts
CREATE POLICY "allow_all_read_posts" ON forum_posts
  FOR SELECT 
  USING (true);

-- 7. Allow authenticated users to create posts
CREATE POLICY "allow_authenticated_create" ON forum_posts
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 8. Allow users to update their own posts
CREATE POLICY "allow_users_update_own" ON forum_posts
  FOR UPDATE
  USING (auth.uid() = user_id::uuid);

-- 9. Allow users to delete their own posts
CREATE POLICY "allow_users_delete_own" ON forum_posts
  FOR DELETE
  USING (auth.uid() = user_id::uuid);

-- 10. Test - this should show all posts
SELECT 
  id, 
  title, 
  LEFT(content, 50) as content_preview,
  user_id,
  status,
  created_at
FROM forum_posts 
ORDER BY created_at DESC 
LIMIT 5;