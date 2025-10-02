-- CRITICAL FORUM FIX - DISABLE ALL RLS TO MAKE POSTS VISIBLE
-- This will make ALL posts visible to admin panel immediately

-- 1. Drop ALL existing policies completely
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
DROP POLICY IF EXISTS "allow_all_read_posts" ON forum_posts;
DROP POLICY IF EXISTS "allow_authenticated_create" ON forum_posts;
DROP POLICY IF EXISTS "allow_users_update_own" ON forum_posts;
DROP POLICY IF EXISTS "allow_users_delete_own" ON forum_posts;
DROP POLICY IF EXISTS "everyone_can_read_posts" ON forum_posts;
DROP POLICY IF EXISTS "authenticated_can_create" ON forum_posts;

-- 2. COMPLETELY DISABLE RLS - This makes ALL posts visible
ALTER TABLE forum_posts DISABLE ROW LEVEL SECURITY;

-- 3. Add missing columns if they don't exist
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true;
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- 4. Update ALL existing posts to be approved and active
UPDATE forum_posts SET 
  is_approved = true,
  status = 'active'
WHERE is_approved IS NULL OR status IS NULL;

-- 5. Verify all posts are now visible (this should show ALL posts)
SELECT 
  id,
  title,
  LEFT(content, 100) as content_preview,
  user_id,
  status,
  is_approved,
  created_at,
  'ALL POSTS NOW VISIBLE' as note
FROM forum_posts 
ORDER BY created_at DESC;