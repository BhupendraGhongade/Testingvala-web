-- PRODUCTION DATA CLEANUP SCRIPT
-- ⚠️ WARNING: This will DELETE ALL user data from production
-- Run this in Supabase SQL Editor for production database

-- Disable RLS temporarily for cleanup
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_boards DISABLE ROW LEVEL SECURITY;
ALTER TABLE board_pins DISABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE contest_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions DISABLE ROW LEVEL SECURITY;

-- Delete all user-generated content (in correct order to avoid foreign key issues)
DELETE FROM board_pins;
DELETE FROM user_boards;
DELETE FROM forum_posts;
DELETE FROM contest_submissions;
DELETE FROM admin_sessions;
DELETE FROM users;

-- Reset sequences if they exist
SELECT setval(pg_get_serial_sequence('users', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('user_boards', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('board_pins', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('forum_posts', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('contest_submissions', 'id'), 1, false);

-- Re-enable RLS for security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Verify cleanup
SELECT 
  'users' as table_name, 
  COUNT(*) as remaining_records 
FROM users
UNION ALL
SELECT 
  'user_boards' as table_name, 
  COUNT(*) as remaining_records 
FROM user_boards
UNION ALL
SELECT 
  'board_pins' as table_name, 
  COUNT(*) as remaining_records 
FROM board_pins
UNION ALL
SELECT 
  'forum_posts' as table_name, 
  COUNT(*) as remaining_records 
FROM forum_posts
UNION ALL
SELECT 
  'contest_submissions' as table_name, 
  COUNT(*) as remaining_records 
FROM contest_submissions;

SELECT '✅ Production database cleaned successfully!' as message;