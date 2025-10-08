-- Boards System Schema for TestingVala
-- Run this script in your Supabase SQL editor to enable the save/boards functionality

-- User Boards Table
CREATE TABLE IF NOT EXISTS user_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  
  user_id TEXT NOT NULL, -- Changed to TEXT to support both UUID and email
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Board Pins Table (saved posts)
CREATE TABLE IF NOT EXISTS board_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES user_boards(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL, -- Can be UUID or string for local posts
  post_title TEXT NOT NULL,
  post_content TEXT NOT NULL,
  post_author TEXT NOT NULL,
  post_category TEXT,
  post_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Profiles Table (if not exists)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  company TEXT,
  role TEXT,
  is_admin BOOLEAN DEFAULT false,
  is_moderator BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_boards
CREATE POLICY "Users can view their own or public boards" ON user_boards
  FOR SELECT USING (
    (auth.uid()::text = user_id OR auth.jwt()->>'email' = user_id) OR is_private = false
  );

CREATE POLICY "Users can create their own boards" ON user_boards
  FOR INSERT WITH CHECK (auth.uid()::text = user_id OR auth.jwt()->>'email' = user_id);

CREATE POLICY "Users can update their own boards" ON user_boards
  FOR UPDATE USING (auth.uid()::text = user_id OR auth.jwt()->>'email' = user_id);

CREATE POLICY "Users can delete their own boards" ON user_boards
  FOR DELETE USING (auth.uid()::text = user_id OR auth.jwt()->>'email' = user_id);

-- RLS Policies for board_pins
CREATE POLICY "Users can view pins in their own or public boards" ON board_pins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_boards 
      WHERE user_boards.id = board_pins.board_id 
      AND (
        (user_boards.user_id = auth.uid()::text OR user_boards.user_id = auth.jwt()->>'email') OR user_boards.is_private = false
      )
    )
  );

CREATE POLICY "Users can add pins to their boards" ON board_pins
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_boards 
      WHERE user_boards.id = board_pins.board_id 
      AND (user_boards.user_id = auth.uid()::text OR user_boards.user_id = auth.jwt()->>'email')
    )
  );

CREATE POLICY "Users can delete pins from their boards" ON board_pins
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_boards 
      WHERE user_boards.id = board_pins.board_id 
      AND (user_boards.user_id = auth.uid()::text OR user_boards.user_id = auth.jwt()->>'email')
    )
  );

-- RLS Policies for user_profiles
CREATE POLICY "Users can view all profiles" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, username, is_verified, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)) || '_' || substr(new.id::text, 1, 4), -- Ensure unique username
    (new.email_confirmed_at IS NOT NULL),
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_boards_user_id ON user_boards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_boards_is_private ON user_boards(is_private);
CREATE INDEX IF NOT EXISTS idx_board_pins_board_id ON board_pins(board_id);
CREATE INDEX IF NOT EXISTS idx_board_pins_post_id ON board_pins(post_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- Success message
SELECT 'Boards system setup completed successfully! You can now use the save functionality.' as message;