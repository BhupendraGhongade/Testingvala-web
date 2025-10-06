-- Ensure forum categories exist
-- Run this in your Supabase SQL Editor

-- First, check if the table exists and create if needed
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

-- Insert essential categories (will skip if they already exist)
INSERT INTO forum_categories (name, slug, description, color, icon, is_active) VALUES
  ('General Discussion', 'general-discussion', 'General QA discussions and questions', '#0057B7', 'message-square', true),
  ('Manual Testing', 'manual-testing', 'Manual testing techniques and strategies', '#10B981', 'clipboard', true),
  ('Automation Testing', 'automation-testing', 'Test automation frameworks and tools', '#FF6600', 'zap', true),
  ('API Testing', 'api-testing', 'API testing tools and methodologies', '#8B5CF6', 'code', true),
  ('Performance Testing', 'performance-testing', 'Load testing and performance optimization', '#EF4444', 'trending-up', true),
  ('Career Guidance', 'career-guidance', 'Career advice and interview preparation', '#F59E0B', 'briefcase', true)
ON CONFLICT (slug) DO NOTHING;

-- Enable RLS if not already enabled
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
DROP POLICY IF EXISTS "Forum categories are viewable by everyone" ON forum_categories;
CREATE POLICY "Forum categories are viewable by everyone" ON forum_categories
  FOR SELECT USING (is_active = true);

-- Check the results
SELECT 'Categories created successfully!' as status;
SELECT id, name, slug, is_active FROM forum_categories ORDER BY name;