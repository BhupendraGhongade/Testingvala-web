-- Enhanced Community Features Database Migration
-- Run this in your Supabase SQL Editor

-- 1. Add experience_years field to forum_posts
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS experience_years TEXT;

-- 2. Add tags support
CREATE TABLE IF NOT EXISTS post_tags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES forum_posts(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add reactions table
CREATE TABLE IF NOT EXISTS post_reactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  reaction_type TEXT NOT NULL, -- 'like', 'love', 'helpful', 'insightful', 'fire', 'applause'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_email, reaction_type)
);

-- 4. Add user_profiles table for mentions and reputation
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  experience_years TEXT,
  reputation_score INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Add threaded comments support (enhance existing structure)
ALTER TABLE post_comments ADD COLUMN IF NOT EXISTS parent_comment_id uuid REFERENCES post_comments(id) ON DELETE CASCADE;
ALTER TABLE post_comments ADD COLUMN IF NOT EXISTS depth INTEGER DEFAULT 0;
ALTER TABLE post_comments ADD COLUMN IF NOT EXISTS thread_path TEXT;

-- 6. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_name ON post_tags(tag_name);
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user_email ON post_reactions(user_email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_post_comments_parent ON post_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_thread_path ON post_comments(thread_path);

-- 7. Enable RLS on new tables
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies

-- Post tags policies
DROP POLICY IF EXISTS "Anyone can view post tags" ON post_tags;
CREATE POLICY "Anyone can view post tags" ON post_tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage tags" ON post_tags;
CREATE POLICY "Authenticated users can manage tags" ON post_tags FOR ALL USING (auth.role() = 'authenticated');

-- Post reactions policies
DROP POLICY IF EXISTS "Anyone can view reactions" ON post_reactions;
CREATE POLICY "Anyone can view reactions" ON post_reactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their own reactions" ON post_reactions;
CREATE POLICY "Users can manage their own reactions" ON post_reactions FOR ALL USING (auth.email() = user_email);

-- User profiles policies
DROP POLICY IF EXISTS "Anyone can view public profiles" ON user_profiles;
CREATE POLICY "Anyone can view public profiles" ON user_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.email() = email);

DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT WITH CHECK (auth.email() = email);

-- 9. Create helper functions

-- Function to get post with reactions count
CREATE OR REPLACE FUNCTION get_post_reactions(post_uuid uuid)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  reactions_json JSON;
BEGIN
  SELECT json_object_agg(reaction_type, reaction_count)
  INTO reactions_json
  FROM (
    SELECT 
      reaction_type,
      COUNT(*) as reaction_count
    FROM post_reactions 
    WHERE post_id = post_uuid
    GROUP BY reaction_type
  ) reactions;
  
  RETURN COALESCE(reactions_json, '{}'::json);
END;
$$;

-- Function to get threaded comments
CREATE OR REPLACE FUNCTION get_threaded_comments(post_uuid uuid)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  comments_json JSON;
BEGIN
  WITH RECURSIVE comment_tree AS (
    -- Base case: top-level comments
    SELECT 
      id, content, author_name, user_email, created_at,
      parent_comment_id, depth, thread_path,
      ARRAY[id] as path
    FROM post_comments 
    WHERE post_id = post_uuid AND parent_comment_id IS NULL
    
    UNION ALL
    
    -- Recursive case: child comments
    SELECT 
      c.id, c.content, c.author_name, c.user_email, c.created_at,
      c.parent_comment_id, c.depth, c.thread_path,
      ct.path || c.id
    FROM post_comments c
    JOIN comment_tree ct ON c.parent_comment_id = ct.id
    WHERE c.depth < 3 -- Limit depth to prevent infinite recursion
  )
  SELECT json_agg(
    json_build_object(
      'id', id,
      'content', content,
      'author_name', author_name,
      'user_email', user_email,
      'created_at', created_at,
      'parent_comment_id', parent_comment_id,
      'depth', depth,
      'path', path
    ) ORDER BY path
  )
  INTO comments_json
  FROM comment_tree;
  
  RETURN COALESCE(comments_json, '[]'::json);
END;
$$;

-- 10. Update existing data
UPDATE forum_posts SET experience_years = '1-3' WHERE experience_years IS NULL AND author_name != 'Anonymous';

-- 11. Grant permissions
GRANT ALL ON post_tags TO authenticated, anon;
GRANT ALL ON post_reactions TO authenticated, anon;
GRANT ALL ON user_profiles TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_post_reactions(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_threaded_comments(uuid) TO authenticated, anon;

-- 12. Verification queries
SELECT 'Enhanced community features installed successfully!' as status;

-- Check new columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'forum_posts' AND column_name = 'experience_years';

-- Check new tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('post_tags', 'post_reactions', 'user_profiles');

-- Sample data for testing
INSERT INTO user_profiles (email, username, full_name, experience_years, reputation_score)
VALUES 
  ('demo@testingvala.com', 'demo_user', 'Demo User', '3-5', 150),
  ('expert@testingvala.com', 'qa_expert', 'QA Expert', '8-12', 500)
ON CONFLICT (email) DO NOTHING;