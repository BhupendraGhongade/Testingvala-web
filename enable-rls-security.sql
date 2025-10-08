-- CRITICAL SECURITY FIX: Enable RLS on all tables
-- Run this in both local and production Supabase

-- Enable RLS on all user-related tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_submissions ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for users table
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for user_boards
CREATE POLICY "Users can view their own boards" ON user_boards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own boards" ON user_boards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own boards" ON user_boards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own boards" ON user_boards
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for board_pins
CREATE POLICY "Users can view pins on their boards" ON board_pins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_boards 
      WHERE user_boards.id = board_pins.board_id 
      AND user_boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create pins on their boards" ON board_pins
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_boards 
      WHERE user_boards.id = board_pins.board_id 
      AND user_boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update pins on their boards" ON board_pins
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_boards 
      WHERE user_boards.id = board_pins.board_id 
      AND user_boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete pins on their boards" ON board_pins
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_boards 
      WHERE user_boards.id = board_pins.board_id 
      AND user_boards.user_id = auth.uid()
    )
  );

-- Create RLS policies for forum_posts
CREATE POLICY "Anyone can view published forum posts" ON forum_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Users can create forum posts" ON forum_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own forum posts" ON forum_posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own forum posts" ON forum_posts
  FOR DELETE USING (auth.uid() = author_id);

-- Create RLS policies for contest_submissions
CREATE POLICY "Users can view their own contest submissions" ON contest_submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create contest submissions" ON contest_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contest submissions" ON contest_submissions
  FOR UPDATE USING (auth.uid() = user_id);

-- Admin policies (for service role access)
CREATE POLICY "Service role can access all data" ON users
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can access all boards" ON user_boards
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can access all pins" ON board_pins
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can access all forum posts" ON forum_posts
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can access all contest submissions" ON contest_submissions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'user_boards', 'board_pins', 'forum_posts', 'contest_submissions');

SELECT 'RLS Security policies have been enabled!' as message;