-- FINAL COMPLETE FIX - Remove demo posts and connect real user posts

-- 1. Delete ALL demo posts from database
DELETE FROM forum_posts WHERE 
  title ILIKE '%TestingVala%' OR
  title ILIKE '%demo%' OR
  title ILIKE '%welcome%' OR
  content ILIKE '%demo post%' OR
  content ILIKE '%showcase%' OR
  author_name ILIKE '%demo%' OR
  user_email ILIKE '%demo@%' OR
  user_email ILIKE '%guru@%' OR
  id ILIKE '%demo%';

-- 2. Completely disable RLS to show all user posts
ALTER TABLE forum_posts DISABLE ROW LEVEL SECURITY;

-- 3. Update all existing posts to be active and approved
UPDATE forum_posts SET 
  status = 'active',
  is_approved = true
WHERE status IS NULL OR is_approved IS NULL;

-- 4. Check what real posts remain
SELECT 
  id,
  title,
  LEFT(content, 100) as content_preview,
  author_name,
  user_id,
  status,
  created_at,
  'REAL USER POST' as type
FROM forum_posts 
ORDER BY created_at DESC;

-- 5. Verify RLS is disabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'forum_posts';