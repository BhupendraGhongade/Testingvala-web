-- Create website_content table
CREATE TABLE IF NOT EXISTS website_content (
  id BIGINT PRIMARY KEY DEFAULT 1,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  company TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contest_submissions table
CREATE TABLE IF NOT EXISTS contest_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  contest_title TEXT NOT NULL,
  submission_text TEXT NOT NULL,
  submission_file_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_requests table
CREATE TABLE IF NOT EXISTS payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  email TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin schema and tables
CREATE SCHEMA IF NOT EXISTS admin;

CREATE TABLE IF NOT EXISTS admin.admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS admin.payment_config (
  id BIGINT PRIMARY KEY DEFAULT 1,
  monthly_price INTEGER NOT NULL DEFAULT 99,
  upi_id TEXT NOT NULL DEFAULT 'testingvala@paytm',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_categories table
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

-- Create forum_posts table
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category_id UUID REFERENCES forum_categories(id),
  user_id UUID,
  author_name TEXT,
  experience_years TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'active',
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert all 20 default categories
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
ON CONFLICT (slug) DO NOTHING;

-- Enable RLS
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Forum categories are viewable by everyone" ON forum_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Forum posts are viewable by everyone" ON forum_posts
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can create posts" ON forum_posts
  FOR INSERT WITH CHECK (true);

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('testingvala-bucket', 'testingvala-bucket', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'testingvala-bucket');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'testingvala-bucket');