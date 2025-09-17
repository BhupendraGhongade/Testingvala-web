-- COMPREHENSIVE DEBUG: Check posts visibility for unverified users

-- 1. Check if forum_posts table exists and has data
SELECT 'Table exists and row count:' as check_type, COUNT(*) as result FROM forum_posts;

-- 2. Check RLS status
SELECT 'RLS enabled:' as check_type, 
       CASE WHEN relrowsecurity THEN 'YES' ELSE 'NO' END as result
FROM pg_class 
WHERE relname = 'forum_posts';

-- 3. List all policies on forum_posts
SELECT 'Current policies:' as check_type, policyname as result
FROM pg_policies 
WHERE tablename = 'forum_posts';

-- 4. Check posts by status
SELECT 'Posts by status:' as check_type, status, COUNT(*) as count
FROM forum_posts 
GROUP BY status;

-- 5. Check if is_approved column exists and values
SELECT 'Posts by approval:' as check_type, 
       COALESCE(is_approved::text, 'NULL') as is_approved, 
       COUNT(*) as count
FROM forum_posts 
GROUP BY is_approved;

-- 6. Sample posts data
SELECT 'Sample posts:' as check_type, id, title, status, 
       COALESCE(is_approved::text, 'NULL') as is_approved,
       created_at
FROM forum_posts 
ORDER BY created_at DESC 
LIMIT 3;

-- 7. Test anonymous access (this should work if RLS is properly configured)
-- This simulates what an unverified user would see
SET LOCAL role TO anon;
SELECT 'Anonymous can see:' as check_type, COUNT(*) as result
FROM forum_posts 
WHERE status = 'active';
RESET ROLE;