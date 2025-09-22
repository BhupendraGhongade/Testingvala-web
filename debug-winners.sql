-- Debug script to check winners data
-- Run this in your Supabase SQL Editor to debug the winners issue

-- 1. Check if the table exists and has data
SELECT 'Table exists and row count:' as debug_step, COUNT(*) as total_rows 
FROM contest_submissions;

-- 2. Check all submissions for Bhupendra
SELECT 'Bhupendra submissions:' as debug_step, *
FROM contest_submissions 
WHERE email = 'bghongade@york.ie';

-- 3. Check all winners (any winner_rank)
SELECT 'All winners:' as debug_step, id, name, email, winner_rank, status, created_at, updated_at
FROM contest_submissions 
WHERE winner_rank IS NOT NULL
ORDER BY winner_rank;

-- 4. Check winners with specific ranks
SELECT 'Winners by rank:' as debug_step, winner_rank, COUNT(*) as count
FROM contest_submissions 
WHERE winner_rank IN (1, 2, 3)
GROUP BY winner_rank
ORDER BY winner_rank;

-- 5. Check table structure
SELECT 'Table columns:' as debug_step, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'contest_submissions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Check recent updates
SELECT 'Recent updates:' as debug_step, id, name, email, winner_rank, status, updated_at
FROM contest_submissions 
WHERE updated_at > NOW() - INTERVAL '1 hour'
ORDER BY updated_at DESC;

-- 7. Check RLS policies
SELECT 'RLS policies:' as debug_step, schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'contest_submissions';

-- 8. Test the exact query used by Winners component
SELECT 'Winners component query:' as debug_step, *
FROM contest_submissions 
WHERE winner_rank IN (1, 2, 3)
ORDER BY winner_rank;