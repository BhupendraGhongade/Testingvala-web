-- Temporary fix: Disable RLS for testing boards functionality
-- Run this in Supabase SQL editor if the main fix doesn't work immediately

-- Disable RLS temporarily to test functionality
ALTER TABLE user_boards DISABLE ROW LEVEL SECURITY;
ALTER TABLE board_pins DISABLE ROW LEVEL SECURITY;

-- Verify tables exist and are accessible
SELECT 'user_boards table check' as test, count(*) as count FROM user_boards;
SELECT 'board_pins table check' as test, count(*) as count FROM board_pins;

-- Show current table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_boards' 
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'board_pins' 
ORDER BY ordinal_position;

SELECT 'RLS disabled for testing - boards should work now' as message;