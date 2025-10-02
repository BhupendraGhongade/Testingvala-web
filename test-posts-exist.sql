-- Test if posts exist in database
SELECT 
  COUNT(*) as total_posts,
  'Posts in database' as check_type
FROM forum_posts;

-- Show all posts without any filters
SELECT 
  id,
  title,
  content,
  user_id,
  author_name,
  status,
  created_at
FROM forum_posts 
ORDER BY created_at DESC
LIMIT 10;

-- Check table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'forum_posts'
ORDER BY ordinal_position;