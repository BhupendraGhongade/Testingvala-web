-- Create boards tables
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

ALTER TABLE user_boards DISABLE ROW LEVEL SECURITY;
ALTER TABLE board_pins DISABLE ROW LEVEL SECURITY;