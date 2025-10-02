-- ============================================================================
-- STEP-BY-STEP FORUM FIX - Run each section separately
-- ============================================================================

-- STEP 1: Drop existing policies first
DROP POLICY IF EXISTS "Allow read posts" ON forum_posts;
DROP POLICY IF EXISTS "Allow insert posts" ON forum_posts;
DROP POLICY IF EXISTS "Allow update own posts" ON forum_posts;
DROP POLICY IF EXISTS "Allow delete own posts" ON forum_posts;
DROP POLICY IF EXISTS "admin_full_access" ON forum_posts;
DROP POLICY IF EXISTS "public_read_posts" ON forum_posts;
DROP POLICY IF EXISTS "verified_users_can_post" ON forum_posts;
DROP POLICY IF EXISTS "authors_can_edit_own_posts" ON forum_posts;
DROP POLICY IF EXISTS "authors_can_delete_own_posts" ON forum_posts;

-- STEP 2: Create user_profiles table (run this first)
DROP TABLE IF EXISTS user_profiles CASCADE;
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  is_moderator BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  reputation_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 3: Add columns to forum_posts
ALTER TABLE forum_posts 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS moderation_notes TEXT,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- STEP 4: Simple RLS policies (run after tables exist)
-- Public read access
CREATE POLICY "public_read_posts" ON forum_posts
  FOR SELECT 
  USING (status = 'active' AND is_approved = true);

-- Allow authenticated users to post
CREATE POLICY "authenticated_users_can_post" ON forum_posts
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can edit their own posts
CREATE POLICY "users_edit_own_posts" ON forum_posts
  FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Users can delete their own posts
CREATE POLICY "users_delete_own_posts" ON forum_posts
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- STEP 5: Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "public_read_profiles" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "users_update_own_profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- STEP 6: Create admin function
CREATE OR REPLACE FUNCTION promote_to_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_profiles 
  SET 
    is_admin = true,
    is_moderator = true,
    is_verified = true
  WHERE email = user_email;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 7: Test query
SELECT 'Setup complete' as status;