-- Temporary fix: Disable RLS for testing
-- Run this in Supabase SQL editor

ALTER TABLE user_boards DISABLE ROW LEVEL SECURITY;
ALTER TABLE board_pins DISABLE ROW LEVEL SECURITY;

SELECT 'RLS disabled for testing - boards should work now!' as message;