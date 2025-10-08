-- Quick fix for boards table
-- Run this in your Supabase SQL editor

-- Create user_boards table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT false,
  cover_image_url TEXT,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create board_pins table if it doesn't exist
CREATE TABLE IF NOT EXISTS board_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES user_boards(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL,
  post_title TEXT NOT NULL,
  post_content TEXT NOT NULL,
  post_author TEXT NOT NULL,
  post_category TEXT,
  post_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE user_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_pins ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies that allow all operations for now
DROP POLICY IF EXISTS "Allow all operations on user_boards" ON user_boards;
CREATE POLICY "Allow all operations on user_boards" ON user_boards FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on board_pins" ON board_pins;
CREATE POLICY "Allow all operations on board_pins" ON board_pins FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_boards_user_id ON user_boards(user_id);
CREATE INDEX IF NOT EXISTS idx_board_pins_board_id ON board_pins(board_id);

SELECT 'Boards tables created successfully!' as message;