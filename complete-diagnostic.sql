-- COMPLETE DIAGNOSTIC: Check everything about forum_posts visibility

-- 1. Check if table exists
SELECT 'forum_posts table exists' as status, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_posts') 
            THEN 'YES' ELSE 'NO' END as result;

-- 2. Check RLS status
SELECT 'RLS enabled' as status,
       CASE WHEN relrowsecurity THEN 'YES' ELSE 'NO' END as result
FROM pg_class WHERE relname = 'forum_posts';

-- 3. Count total posts
SELECT 'Total posts' as status, COUNT(*)::text as result FROM forum_posts;

-- 4. Check posts by status
SELECT 'Active posts' as status, COUNT(*)::text as result 
FROM forum_posts WHERE status = 'active';

-- 5. Check approved posts
SELECT 'Approved posts' as status, COUNT(*)::text as result 
FROM forum_posts WHERE is_approved = true;

-- 6. Check active AND approved posts
SELECT 'Active AND approved posts' as status, COUNT(*)::text as result 
FROM forum_posts WHERE status = 'active' AND is_approved = true;

-- 7. Show sample posts
SELECT id, title, status, is_approved, created_at 
FROM forum_posts 
ORDER BY created_at DESC 
LIMIT 3;