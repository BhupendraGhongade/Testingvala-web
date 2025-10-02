-- Fix forum_posts and user_profiles relationship
-- Run this in your Supabase SQL Editor

-- 1. First, ensure user_profiles table exists with proper structure
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add user_id column to forum_posts if it doesn't exist
ALTER TABLE forum_posts 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL;

-- 3. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_forum_posts_user_id ON forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- 4. Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for user_profiles
CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- 6. Update existing forum_posts to link with user_profiles (if needed)
-- This will try to match by email if author_email exists
UPDATE forum_posts 
SET user_id = (
  SELECT id FROM user_profiles 
  WHERE user_profiles.email = forum_posts.author_email
)
WHERE user_id IS NULL AND author_email IS NOT NULL;

-- 7. Verify the relationship works
SELECT 
  fp.id,
  fp.title,
  fp.author_name,
  up.username,
  up.full_name,
  up.email
FROM forum_posts fp
LEFT JOIN user_profiles up ON fp.user_id = up.id
LIMIT 5;