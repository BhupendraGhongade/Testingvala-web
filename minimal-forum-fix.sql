-- MINIMAL FORUM FIX - Run this to get forum working immediately

-- 1. Drop all existing policies
DROP POLICY IF EXISTS "Allow read posts" ON forum_posts;
DROP POLICY IF EXISTS "Allow insert posts" ON forum_posts;
DROP POLICY IF EXISTS "Allow update own posts" ON forum_posts;
DROP POLICY IF EXISTS "Allow delete own posts" ON forum_posts;

-- 2. Add missing columns to forum_posts
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true;

-- 3. Create simple working policies
CREATE POLICY "public_can_read_approved_posts" ON forum_posts
  FOR SELECT 
  USING (status = 'active' AND is_approved = true);

CREATE POLICY "authenticated_users_can_create_posts" ON forum_posts
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "users_can_update_own_posts" ON forum_posts
  FOR UPDATE
  USING (auth.uid() = user_id::uuid);

CREATE POLICY "users_can_delete_own_posts" ON forum_posts
  FOR DELETE
  USING (auth.uid() = user_id::uuid);

-- 4. Test query
SELECT 'Forum policies fixed' as result;