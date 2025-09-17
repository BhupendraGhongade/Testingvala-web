-- STEP 1: Find and delete ALL demo posts
DELETE FROM forum_posts WHERE 
  title LIKE '%TestingVala%' OR
  title LIKE '%demo%' OR
  title LIKE '%Demo%' OR
  content LIKE '%demo post%' OR
  content LIKE '%showcase%' OR
  author_name LIKE '%Demo%' OR
  user_id LIKE '%demo%' OR
  id LIKE '%demo%';

-- STEP 2: Check what posts remain
SELECT 
  id,
  title,
  content,
  author_name,
  user_id,
  created_at,
  'REMAINING POST' as type
FROM forum_posts 
ORDER BY created_at DESC;

-- STEP 3: Completely disable RLS
ALTER TABLE forum_posts DISABLE ROW LEVEL SECURITY;

-- STEP 4: Check table permissions
SELECT 
  schemaname, 
  tablename, 
  rowsecurity,
  'RLS STATUS' as check_type
FROM pg_tables 
WHERE tablename = 'forum_posts';