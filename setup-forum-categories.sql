-- Setup Forum Categories for TestingVala Community
-- Run this in your Supabase SQL Editor to ensure categories exist

-- Create forum_categories table if it doesn't exist
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

-- Add missing columns if they don't exist
ALTER TABLE forum_categories ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#0057B7';
ALTER TABLE forum_categories ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'message-square';

-- Insert default categories (will skip if they already exist)
INSERT INTO forum_categories (name, description, slug, color, icon, is_active) VALUES
  ('General Discussion', 'General discussions about QA and testing', 'general-discussion', '#0057B7', 'message-square', true),
  ('Manual Testing', 'Manual testing techniques and strategies', 'manual-testing', '#10B981', 'clipboard', true),
  ('Automation Testing', 'Test automation frameworks and tools', 'automation-testing', '#FF6600', 'zap', true),
  ('API Testing', 'API testing tools and methodologies', 'api-testing', '#8B5CF6', 'code', true),
  ('Performance & Load Testing', 'Performance testing and load testing discussions', 'performance-load-testing', '#EF4444', 'trending-up', true),
  ('Security Testing', 'Security testing practices and tools', 'security-testing', '#DC2626', 'shield', true),
  ('Mobile Testing', 'Mobile app testing strategies', 'mobile-testing', '#059669', 'smartphone', true),
  ('Interview Preparation', 'QA interview questions and preparation tips', 'interview-preparation', '#7C3AED', 'user-check', true),
  ('Certifications & Courses', 'Testing certifications and learning resources', 'certifications-courses', '#0891B2', 'award', true),
  ('Career Guidance', 'Career advice for QA professionals', 'career-guidance', '#BE185D', 'briefcase', true),
  ('Freshers & Beginners', 'Help and guidance for testing beginners', 'freshers-beginners', '#16A34A', 'users', true),
  ('Test Management Tools', 'Test management and planning tools', 'test-management-tools', '#CA8A04', 'layers', true),
  ('CI/CD & DevOps', 'Continuous integration and DevOps practices', 'cicd-devops', '#9333EA', 'git-branch', true),
  ('Bug Tracking', 'Bug tracking tools and processes', 'bug-tracking', '#C2410C', 'bug', true),
  ('AI in Testing', 'AI and ML applications in testing', 'ai-in-testing', '#0F766E', 'brain', true),
  ('Job Openings & Referrals', 'Job opportunities and referrals', 'job-openings-referrals', '#B91C1C', 'briefcase', true),
  ('Testing Contests & Challenges', 'Testing competitions and challenges', 'testing-contests-challenges', '#7C2D12', 'trophy', true),
  ('Best Practices & Processes', 'Testing best practices and processes', 'best-practices-processes', '#166534', 'check-circle', true),
  ('Community Helpdesk', 'Get help from the community', 'community-helpdesk', '#1E40AF', 'help-circle', true),
  ('Events & Meetups', 'Testing events and meetups', 'events-meetups', '#BE123C', 'calendar', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  icon = EXCLUDED.icon,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Enable RLS if not already enabled
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
DROP POLICY IF EXISTS "Forum categories are viewable by everyone" ON forum_categories;
CREATE POLICY "Forum categories are viewable by everyone" ON forum_categories
  FOR SELECT USING (is_active = true);

-- Verify categories were created
SELECT 
  id, 
  name, 
  slug, 
  color, 
  is_active,
  created_at
FROM forum_categories 
ORDER BY name;