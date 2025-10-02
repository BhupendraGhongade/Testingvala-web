-- Database Cleanup Script for TestingVala
-- This script removes unused tables and optimizes the database structure

-- Drop unused forum-related tables (if they exist)
DROP TABLE IF EXISTS forum_posts CASCADE;
DROP TABLE IF EXISTS forum_categories CASCADE;
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS post_comments CASCADE;
DROP TABLE IF EXISTS session_likes CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Drop unused boards-related tables (if they exist)
DROP TABLE IF EXISTS boards CASCADE;
DROP TABLE IF EXISTS board_posts CASCADE;
DROP TABLE IF EXISTS board_members CASCADE;
DROP TABLE IF EXISTS saved_posts CASCADE;
DROP TABLE IF EXISTS pinned_posts CASCADE;

-- Drop unused events tables (if they exist)
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS event_registrations CASCADE;

-- Drop unused resume tables (if they exist)
DROP TABLE IF EXISTS resumes CASCADE;
DROP TABLE IF EXISTS resume_templates CASCADE;

-- Drop unused test management tables (if they exist)
DROP TABLE IF EXISTS test_cases CASCADE;
DROP TABLE IF EXISTS test_runs CASCADE;
DROP TABLE IF EXISTS test_results CASCADE;

-- Drop unused metrics tables (if they exist)
DROP TABLE IF EXISTS metrics CASCADE;
DROP TABLE IF EXISTS reports CASCADE;

-- Keep only essential tables:
-- 1. website_content (for admin panel content management)
-- 2. users (for user registration)
-- 3. contest_submissions (for contest entries)
-- 4. admin_sessions (for admin authentication)
-- 5. premium_subscriptions (for premium features)
-- 6. payment_config (for payment settings)
-- 7. ai_resume_generations (for resume builder tracking)

-- Verify remaining tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Clean up any orphaned policies
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
        AND tablename NOT IN ('website_content', 'users', 'contest_submissions', 'admin_sessions', 'premium_subscriptions', 'payment_config', 'ai_resume_generations')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            policy_record.policyname, 
            policy_record.schemaname, 
            policy_record.tablename);
    END LOOP;
END $$;

-- Optimize remaining tables
VACUUM ANALYZE website_content;
VACUUM ANALYZE users;
VACUUM ANALYZE contest_submissions;
VACUUM ANALYZE admin_sessions;
VACUUM ANALYZE premium_subscriptions;
VACUUM ANALYZE payment_config;
VACUUM ANALYZE ai_resume_generations;

-- Update table statistics
ANALYZE;

COMMENT ON SCHEMA public IS 'TestingVala - Cleaned and optimized database schema';