-- ============================================================================
-- SECURITY HARDENING FOR PRODUCTION
-- ============================================================================
-- Run this AFTER the cleanup script
-- ============================================================================

-- 1. UPDATE ADMIN PASSWORD HASH
-- ============================================================================
-- Note: Change the hardcoded password in AdminPanel.jsx after this
-- Current password: Golu@2205 (CHANGE THIS!)

-- 2. REVOKE ALL EXISTING ADMIN SESSIONS
-- ============================================================================
DELETE FROM admin_sessions;

-- 3. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_inquiries ENABLE ROW LEVEL SECURITY;

-- 4. CREATE PRODUCTION RLS POLICIES
-- ============================================================================

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.email() = email);

CREATE POLICY "Users can update own data" ON users  
  FOR UPDATE USING (auth.email() = email);

-- Forum posts are public for reading, authenticated for writing
CREATE POLICY "Anyone can view forum posts" ON forum_posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON forum_posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own posts" ON forum_posts
  FOR UPDATE USING (author_email = auth.email());

-- Contest submissions - users can only see their own
CREATE POLICY "Users can view own submissions" ON contest_submissions
  FOR SELECT USING (user_email = auth.email());

CREATE POLICY "Users can create submissions" ON contest_submissions
  FOR INSERT WITH CHECK (user_email = auth.email());

-- User boards - private to owner
CREATE POLICY "Users can manage own boards" ON user_boards
  FOR ALL USING (user_email = auth.email());

-- Resume data - private to owner  
CREATE POLICY "Users can manage own resumes" ON user_resumes
  FOR ALL USING (user_email = auth.email());

-- 5. SECURE ADMIN FUNCTIONS
-- ============================================================================
-- Create admin check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if current user has admin session
  RETURN EXISTS (
    SELECT 1 FROM admin_sessions 
    WHERE session_id = current_setting('request.jwt.claims', true)::json->>'session_id'
    AND expires_at > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin-only policies for sensitive tables
CREATE POLICY "Admin only access" ON admin_sessions
  FOR ALL USING (is_admin());

CREATE POLICY "Admin can manage website content" ON website_content
  FOR ALL USING (is_admin());

-- 6. REMOVE DANGEROUS PERMISSIONS
-- ============================================================================
-- Revoke public access to sensitive functions
REVOKE ALL ON FUNCTION is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- 7. AUDIT EXISTING PERMISSIONS
-- ============================================================================
-- Check for overly permissive policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 8. ENABLE AUDIT LOGGING
-- ============================================================================
-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  user_email TEXT,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admin only audit access" ON audit_log
  FOR SELECT USING (is_admin());

-- 9. SECURE EMAIL TEMPLATES
-- ============================================================================
-- Ensure email templates don't contain sensitive data
UPDATE website_content 
SET content = jsonb_set(
  content,
  '{email_settings}',
  '{
    "from_name": "TestingVala",
    "from_email": "info@testingvala.com",
    "reply_to": "info@testingvala.com",
    "support_email": "info@testingvala.com"
  }'::jsonb
)
WHERE id = 1;

-- 10. PRODUCTION ENVIRONMENT VERIFICATION
-- ============================================================================
-- Ensure all data is marked as production environment
UPDATE forum_posts SET environment = 'production' WHERE environment IS NULL;
UPDATE contest_submissions SET environment = 'production' WHERE environment IS NULL;
UPDATE users SET environment = 'production' WHERE environment IS NULL;

-- ============================================================================
-- SECURITY HARDENING COMPLETE
-- ============================================================================
-- Manual steps required:
-- 1. Change admin password in AdminPanel.jsx
-- 2. Rotate API keys if needed
-- 3. Review and test all functionality
-- 4. Monitor audit logs after deployment
-- ============================================================================