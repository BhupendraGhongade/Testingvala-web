-- Remove all demo posts and check user posts

-- 1. Check what posts currently exist
SELECT 
  id,
  title,
  content,
  user_id,
  status,
  created_at,
  CASE 
    WHEN title LIKE '%demo%' OR title LIKE '%test%' OR title LIKE '%sample%' THEN 'DEMO POST'
    ELSE 'USER POST'
  END as post_type
FROM forum_posts 
ORDER BY created_at DESC;

-- 2. Delete demo/test posts
DELETE FROM forum_posts 
WHERE 
  title ILIKE '%demo%' OR 
  title ILIKE '%test%' OR 
  title ILIKE '%sample%' OR
  content ILIKE '%demo%' OR
  content ILIKE '%test%' OR
  content ILIKE '%sample%' OR
  user_id = 'demo-user' OR
  user_id = 'test-user';

-- 3. Check remaining posts
SELECT 
  COUNT(*) as remaining_posts,
  'Demo posts removed' as status
FROM forum_posts;

-- 4. Show all remaining posts
SELECT 
  id,
  title,
  LEFT(content, 100) as content_preview,
  user_id,
  status,
  created_at
FROM forum_posts 
ORDER BY created_at DESC;