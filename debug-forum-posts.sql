-- DEBUG: Check what posts exist in database
SELECT 
  id,
  title,
  content,
  user_id,
  status,
  is_approved,
  created_at,
  'DEBUG: All posts in database' as note
FROM forum_posts 
ORDER BY created_at DESC;

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'forum_posts';

-- Check existing policies
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'forum_posts';

-- Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'forum_posts'
ORDER BY ordinal_position;