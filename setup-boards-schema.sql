-- Boards System Schema for TestingVala
-- Run this script in your Supabase SQL editor to enable the save/boards functionality

-- User Boards Table
CREATE TABLE IF NOT EXISTS user_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
  email TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_boards
CREATE POLICY "Users can view their own boards" ON user_boards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public boards" ON user_boards
  FOR SELECT USING (is_private = false);

CREATE POLICY "Users can create their own boards" ON user_boards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own boards" ON user_boards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own boards" ON user_boards
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for board_pins
CREATE POLICY "Users can view pins in their boards" ON board_pins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_boards 
      WHERE user_boards.id = board_pins.board_id 
      AND user_boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view pins in public boards" ON board_pins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_boards 
      WHERE user_boards.id = board_pins.board_id 
      AND user_boards.is_private = false
    )
  );

CREATE POLICY "Users can add pins to their boards" ON board_pins
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_boards 
      WHERE user_boards.id = board_pins.board_id 
      AND user_boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete pins from their boards" ON board_pins
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_boards 
      WHERE user_boards.id = board_pins.board_id 
      AND user_boards.user_id = auth.uid()
    )
  );

-- RLS Policies for user_profiles
CREATE POLICY "Users can view all profiles" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR ALL USING (auth.uid() = id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_boards_user_id ON user_boards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_boards_is_private ON user_boards(is_private);
CREATE INDEX IF NOT EXISTS idx_board_pins_board_id ON board_pins(board_id);
CREATE INDEX IF NOT EXISTS idx_board_pins_post_id ON board_pins(post_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, username)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_boards updated_at
DROP TRIGGER IF EXISTS update_user_boards_updated_at ON user_boards;
CREATE TRIGGER update_user_boards_updated_at
    BEFORE UPDATE ON user_boards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_profiles updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some default data for testing (optional)
-- You can remove this section if you don't want test data

-- Create a sample public board (only if no boards exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM user_boards LIMIT 1) THEN
    -- This will only work if you have at least one user in your system
    -- You can remove this or modify it as needed
    INSERT INTO user_boards (user_id, name, description, is_private)
    SELECT 
      id,
      'QA Resources',
      'Collection of useful QA and testing resources',
      false
    FROM auth.users 
    WHERE email LIKE '%admin%' OR email LIKE '%test%'
    LIMIT 1;
  END IF;
END $$;

-- Success message
SELECT 'Boards system setup completed successfully! You can now use the save functionality.' as message;