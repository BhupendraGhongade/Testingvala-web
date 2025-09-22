-- Create unified likes table
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT, -- For non-verified users
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id),
  UNIQUE(post_id, session_id)
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_session_id ON post_likes(session_id);

-- Enable RLS
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view likes" ON post_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert their own likes" ON post_likes FOR INSERT WITH CHECK (
  auth.uid() = user_id OR (auth.uid() IS NULL AND session_id IS NOT NULL)
);
CREATE POLICY "Users can delete their own likes" ON post_likes FOR DELETE USING (
  auth.uid() = user_id OR (auth.uid() IS NULL AND session_id IS NOT NULL)
);

-- Function to get like count for a post
CREATE OR REPLACE FUNCTION get_post_like_count(post_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM post_likes
    WHERE post_id = post_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user liked a post
CREATE OR REPLACE FUNCTION user_liked_post(post_uuid UUID, user_uuid UUID DEFAULT NULL, session_token TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  IF user_uuid IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM post_likes 
      WHERE post_id = post_uuid AND user_id = user_uuid
    );
  ELSIF session_token IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM post_likes 
      WHERE post_id = post_uuid AND session_id = session_token
    );
  END IF;
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime for likes table
ALTER PUBLICATION supabase_realtime ADD TABLE post_likes;