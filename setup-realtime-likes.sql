-- Setup Real-time Like System
-- Run this in your Supabase SQL Editor

-- Ensure post_likes table exists with correct structure
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id TEXT NOT NULL,
  user_email TEXT,
  session_id TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_email ON post_likes(user_email);
CREATE INDEX IF NOT EXISTS idx_post_likes_session_id ON post_likes(session_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_verified ON post_likes(is_verified);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_post_likes_post_user ON post_likes(post_id, user_email) WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_post_likes_post_session ON post_likes(post_id, session_id) WHERE is_verified = false;

-- Enable Row Level Security
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for post_likes table
DROP POLICY IF EXISTS "Anyone can view post likes" ON post_likes;
CREATE POLICY "Anyone can view post likes" ON post_likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage their likes" ON post_likes;
CREATE POLICY "Authenticated users can manage their likes" ON post_likes
  FOR ALL USING (
    auth.uid() IS NOT NULL AND (
      user_email = auth.email() OR
      session_id IS NOT NULL
    )
  );

DROP POLICY IF EXISTS "Anonymous users can manage guest likes" ON post_likes;
CREATE POLICY "Anonymous users can manage guest likes" ON post_likes
  FOR ALL USING (
    auth.uid() IS NULL AND 
    session_id IS NOT NULL AND 
    is_verified = false
  );

-- Enable real-time for post_likes table
ALTER PUBLICATION supabase_realtime ADD TABLE post_likes;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_post_likes_updated_at ON post_likes;
CREATE TRIGGER update_post_likes_updated_at
    BEFORE UPDATE ON post_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to get real-time like count
CREATE OR REPLACE FUNCTION get_post_like_count(post_id_param TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM post_likes
    WHERE post_id = post_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON post_likes TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_post_like_count(TEXT) TO anon, authenticated;

-- Create a view for like statistics (optional)
CREATE OR REPLACE VIEW post_like_stats AS
SELECT 
  post_id,
  COUNT(*) as total_likes,
  COUNT(*) FILTER (WHERE is_verified = true) as verified_likes,
  COUNT(*) FILTER (WHERE is_verified = false) as guest_likes,
  MAX(created_at) as last_liked_at
FROM post_likes
GROUP BY post_id;

GRANT SELECT ON post_like_stats TO anon, authenticated;

-- Test the setup
SELECT 'Real-time like system setup completed successfully!' as status;

-- Show current like counts for verification
SELECT 
  post_id,
  COUNT(*) as total_likes,
  COUNT(*) FILTER (WHERE is_verified = true) as verified_likes,
  COUNT(*) FILTER (WHERE is_verified = false) as guest_likes
FROM post_likes 
GROUP BY post_id 
ORDER BY total_likes DESC 
LIMIT 10;