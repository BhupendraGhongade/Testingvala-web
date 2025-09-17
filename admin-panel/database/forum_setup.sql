-- Forum Management Database Setup for TestingVala
-- Run these SQL commands in your Supabase SQL Editor

-- 1. Create forum_categories table (if not exists)
CREATE TABLE IF NOT EXISTS forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#0057B7',
  icon TEXT DEFAULT 'message-square',
  is_active BOOLEAN DEFAULT true,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create forum_posts table (if not exists)
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category_id UUID REFERENCES forum_categories(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT,
  user_email TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'pending', 'deleted')),
  is_flagged BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  image_url TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create post_comments table (if not exists)
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  author_name TEXT,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  is_flagged BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create post_likes table (if not exists)
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_email)
);

-- 5. Create user_profiles table (if not exists)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  email TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  company TEXT,
  job_title TEXT,
  is_admin BOOLEAN DEFAULT false,
  is_moderator BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  reputation_score INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  likes_received INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Insert default forum categories
INSERT INTO forum_categories (name, description, slug, color, icon) VALUES
  ('General QA Discussion', 'General discussions about QA practices and methodologies', 'general-qa', '#0057B7', 'message-square'),
  ('Test Automation', 'Automation frameworks, tools, and best practices', 'test-automation', '#FF6600', 'zap'),
  ('Manual Testing', 'Manual testing techniques and strategies', 'manual-testing', '#10B981', 'clipboard'),
  ('Career & Interview', 'Career advice, interview tips, and job discussions', 'career-interview', '#8B5CF6', 'briefcase'),
  ('Tools & Frameworks', 'Testing tools, frameworks, and software discussions', 'tools-frameworks', '#F59E0B', 'layers'),
  ('Performance Testing', 'Load testing, performance optimization, and monitoring', 'performance-testing', '#EF4444', 'trending-up')
ON CONFLICT (slug) DO NOTHING;

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_posts_category_id ON forum_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_user_id ON forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_status ON forum_posts(status);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON forum_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_email ON post_likes(user_email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- 8. Enable Row Level Security (RLS)
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies for public read access
CREATE POLICY "Forum categories are viewable by everyone" ON forum_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Active forum posts are viewable by everyone" ON forum_posts
  FOR SELECT USING (status = 'active');

CREATE POLICY "Post comments are viewable by everyone" ON post_comments
  FOR SELECT USING (true);

CREATE POLICY "Post likes are viewable by everyone" ON post_likes
  FOR SELECT USING (true);

CREATE POLICY "User profiles are viewable by everyone" ON user_profiles
  FOR SELECT USING (true);

-- 10. Create RLS policies for authenticated users
CREATE POLICY "Authenticated users can create posts" ON forum_posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own posts" ON forum_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON forum_posts
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create comments" ON post_comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own comments" ON post_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON post_comments
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can like posts" ON post_likes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can remove their own likes" ON post_likes
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 11. Create admin policies (for users with is_admin = true)
CREATE POLICY "Admins can manage all posts" ON forum_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can manage all comments" ON post_comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can manage categories" ON forum_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Setup complete!
SELECT 'Forum database setup completed successfully!' as status;