-- Simple Forum Tables Setup for TestingVala
-- Run this in your Supabase SQL Editor

-- Create forum categories table
CREATE TABLE IF NOT EXISTS forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum posts table
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  category_id UUID REFERENCES forum_categories(id),
  user_id UUID,
  image_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO forum_categories (id, name, description, slug) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'General QA Discussion', 'General discussions about QA practices', 'general-qa'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Test Automation', 'Automation frameworks and tools', 'test-automation'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Manual Testing', 'Manual testing techniques', 'manual-testing'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Career & Interview', 'Career advice and interviews', 'career-interview')
ON CONFLICT (slug) DO NOTHING;

-- Enable RLS
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read categories" ON forum_categories FOR SELECT USING (true);
CREATE POLICY "Allow read posts" ON forum_posts FOR SELECT USING (true);
CREATE POLICY "Allow insert posts" ON forum_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update own posts" ON forum_posts FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Allow delete own posts" ON forum_posts FOR DELETE USING (auth.uid()::text = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_forum_posts_category_id ON forum_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_user_id ON forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON forum_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_forum_posts_status ON forum_posts(status);