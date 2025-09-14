-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verified user likes (permanent)
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Session-based likes for unverified users
CREATE TABLE session_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, session_id)
);

-- Comments (verified users only)
CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- Allow read access to all
CREATE POLICY "Allow read posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Allow read likes" ON post_likes FOR SELECT USING (true);
CREATE POLICY "Allow read session likes" ON session_likes FOR SELECT USING (true);
CREATE POLICY "Allow read comments" ON post_comments FOR SELECT USING (true);

-- Allow verified users to manage their likes
CREATE POLICY "Verified users can manage likes" ON post_likes 
FOR ALL USING (auth.uid() = user_id AND auth.jwt() ->> 'email_confirmed_at' IS NOT NULL);

-- Allow session-based likes
CREATE POLICY "Allow session likes" ON session_likes FOR ALL USING (true);

-- Only verified users can comment
CREATE POLICY "Verified users can comment" ON post_comments 
FOR ALL USING (auth.uid() = user_id AND auth.jwt() ->> 'email_confirmed_at' IS NOT NULL);