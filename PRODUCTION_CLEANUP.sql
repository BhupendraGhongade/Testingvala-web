-- ============================================================================
-- PRODUCTION CLEANUP SCRIPT
-- ============================================================================
-- WARNING: This will remove ALL demo/test data from production
-- BACKUP FIRST: npm run db:backup
-- ============================================================================

-- 1. REMOVE DEMO FORUM POSTS
-- ============================================================================
DELETE FROM forum_posts 
WHERE 
  title ILIKE '%test%' OR 
  title ILIKE '%demo%' OR 
  title ILIKE '%sample%' OR
  content ILIKE '%test%' OR
  content ILIKE '%demo%' OR
  author_email ILIKE '%test%' OR
  author_email ILIKE '%demo%' OR
  author_email ILIKE '%example%';

-- 2. REMOVE DEMO COMMENTS
-- ============================================================================
DELETE FROM forum_comments 
WHERE 
  content ILIKE '%test%' OR 
  content ILIKE '%demo%' OR
  author_email ILIKE '%test%' OR
  author_email ILIKE '%demo%' OR
  author_email ILIKE '%example%';

DELETE FROM post_comments 
WHERE 
  content ILIKE '%test%' OR 
  content ILIKE '%demo%' OR
  user_email ILIKE '%test%' OR
  user_email ILIKE '%demo%' OR
  user_email ILIKE '%example%';

-- 3. REMOVE TEST USERS
-- ============================================================================
DELETE FROM users 
WHERE 
  email ILIKE '%test%' OR 
  email ILIKE '%demo%' OR 
  email ILIKE '%example%' OR
  email ILIKE '%sample%' OR
  name ILIKE '%test%' OR
  name ILIKE '%demo%';

-- 4. REMOVE DEMO CONTEST SUBMISSIONS
-- ============================================================================
DELETE FROM contest_submissions 
WHERE 
  user_email ILIKE '%test%' OR 
  user_email ILIKE '%demo%' OR 
  user_email ILIKE '%example%' OR
  submission_text ILIKE '%test%' OR
  submission_text ILIKE '%demo%' OR
  contest_title ILIKE '%test%';

-- 5. REMOVE DEVELOPMENT ENVIRONMENT DATA
-- ============================================================================
DELETE FROM forum_posts WHERE environment = 'development';
DELETE FROM forum_comments WHERE environment = 'development';
DELETE FROM contest_submissions WHERE environment = 'development';
DELETE FROM users WHERE environment = 'development';

-- 6. CLEAN ADMIN SESSIONS
-- ============================================================================
DELETE FROM admin_sessions WHERE expires_at < NOW();

-- 7. REMOVE TEST BOARDS AND PINS
-- ============================================================================
DELETE FROM user_boards 
WHERE 
  title ILIKE '%test%' OR 
  title ILIKE '%demo%' OR
  user_id IN (
    SELECT id FROM users WHERE email ILIKE '%test%' OR email ILIKE '%demo%'
  );

DELETE FROM board_pins 
WHERE 
  board_id IN (
    SELECT id FROM user_boards WHERE title ILIKE '%test%' OR title ILIKE '%demo%'
  );

-- 8. CLEAN RESUME DATA
-- ============================================================================
DELETE FROM user_resumes 
WHERE 
  user_email ILIKE '%test%' OR 
  user_email ILIKE '%demo%' OR 
  user_email ILIKE '%example%' OR
  title ILIKE '%test%' OR
  title ILIKE '%demo%';

-- 9. REMOVE TEST ANALYTICS
-- ============================================================================
DELETE FROM resume_analytics 
WHERE 
  resume_id IN (
    SELECT id FROM user_resumes WHERE user_email ILIKE '%test%' OR user_email ILIKE '%demo%'
  );

-- 10. CLEAN PARTNERSHIP INQUIRIES
-- ============================================================================
DELETE FROM partnership_inquiries 
WHERE 
  email ILIKE '%test%' OR 
  email ILIKE '%demo%' OR 
  email ILIKE '%example%' OR
  company_name ILIKE '%test%' OR
  company_name ILIKE '%demo%';

-- 11. REMOVE ORPHANED LIKES
-- ============================================================================
DELETE FROM forum_likes 
WHERE 
  post_id NOT IN (SELECT id FROM forum_posts) OR
  user_email ILIKE '%test%' OR 
  user_email ILIKE '%demo%';

DELETE FROM post_likes 
WHERE 
  post_id NOT IN (SELECT id FROM forum_posts) OR
  user_email ILIKE '%test%' OR 
  user_email ILIKE '%demo%';

-- 12. RESET WEBSITE CONTENT TO PRODUCTION
-- ============================================================================
UPDATE website_content 
SET content = jsonb_set(
  content,
  '{contest}',
  '{
    "title": "January 2025 QA Contest",
    "theme": "Testing Hacks & Smart Techniques", 
    "prizes": "1st Place: $500 | 2nd Place: $300 | 3rd Place: $200",
    "submission": "Share your QA trick with detailed explanation and impact",
    "deadline": "2025-01-31",
    "status": "Active Now"
  }'::jsonb
)
WHERE id = 1;

-- 13. VERIFY CLEANUP
-- ============================================================================
-- Check remaining data counts
SELECT 'forum_posts' as table_name, COUNT(*) as remaining_count FROM forum_posts
UNION ALL
SELECT 'users' as table_name, COUNT(*) as remaining_count FROM users  
UNION ALL
SELECT 'contest_submissions' as table_name, COUNT(*) as remaining_count FROM contest_submissions
UNION ALL
SELECT 'forum_comments' as table_name, COUNT(*) as remaining_count FROM forum_comments
UNION ALL
SELECT 'user_resumes' as table_name, COUNT(*) as remaining_count FROM user_resumes;

-- ============================================================================
-- CLEANUP COMPLETE
-- ============================================================================
-- Next steps:
-- 1. Verify website loads cleanly
-- 2. Test user registration
-- 3. Test magic link system
-- 4. Check admin panel
-- 5. Deploy to production
-- ============================================================================