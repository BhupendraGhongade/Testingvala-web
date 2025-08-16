-- TestingVala Database Setup
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Website content table
CREATE TABLE IF NOT EXISTS website_content (
  id BIGINT PRIMARY KEY DEFAULT 1,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  company TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contest submissions table
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

-- Admin sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Insert initial website content (only if not exists)
INSERT INTO website_content (id, content) 
VALUES (1, '{
  "contest": {
    "title": "January 2025 QA Contest",
    "theme": "Testing Hacks & Smart Techniques",
    "prizes": "1st Place: $500 | 2nd Place: $300 | 3rd Place: $200",
    "submission": "Share your QA trick with detailed explanation and impact",
    "deadline": "2025-01-31",
    "status": "Active Now"
  },
  "hero": {
    "headline": "Win Big with Your Testing Expertise",
    "subtitle": "Show off your QA skills in our monthly contest! Share your best testing hacks, automation tricks, and innovative approaches.",
    "badge": "🚀 Test Your QA Skills. Win Rewards. Build Your Career.",
    "stats": {
      "participants": "500+",
      "prizes": "$2,000+",
      "support": "24/7"
    }
  },
  "winners": [
    {
      "name": "Sarah Chen",
      "title": "December 2024 Winner",
      "trick": "AI-Powered Test Case Generation",
      "avatar": "👑"
    },
    {
      "name": "Mike Rodriguez",
      "title": "November 2024 Winner",
      "trick": "Cross-Browser Testing Automation",
      "avatar": "🥈"
    },
    {
      "name": "Emma Thompson",
      "title": "October 2024 Winner",
      "trick": "Performance Testing Optimization",
      "avatar": "🥉"
    }
  ],
  "about": {
    "description": "TestingVala.com is your go-to platform for daily QA tricks, hacks, and interview preparation tips.",
    "features": [
      "Daily QA tips and best practices",
      "Interview preparation resources",
      "Process improvement techniques",
      "Monthly QA contests with prizes"
    ],
    "stats": {
      "members": "10,000+",
      "tips": "500+",
      "contests": "12+",
      "countries": "50+"
    }
  },
  "contact": {
    "email": "info@testingvala.com",
    "website": "www.testingvala.com",
    "location": "Global QA Community",
    "socialMedia": {
      "instagram": "https://www.instagram.com/testingvala",
      "youtube": "https://www.youtube.com/@TestingvalaOfficial",
      "twitter": "https://twitter.com/testingvala",
      "linkedin": "https://www.linkedin.com/company/testingvala"
    }
  }
}')
ON CONFLICT (id) DO NOTHING;

-- Set up Row Level Security (RLS) - only if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'website_content' AND policyname = 'Public read access') THEN
    CREATE POLICY "Public read access" ON website_content FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'website_content' AND policyname = 'Admin write access') THEN
    CREATE POLICY "Admin write access" ON website_content FOR ALL USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view their own data') THEN
    CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can insert their own data') THEN
    CREATE POLICY "Users can insert their own data" ON users FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contest_submissions' AND policyname = 'Users can view their own submissions') THEN
    CREATE POLICY "Users can view their own submissions" ON contest_submissions FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contest_submissions' AND policyname = 'Users can insert submissions') THEN
    CREATE POLICY "Users can insert submissions" ON contest_submissions FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_sessions' AND policyname = 'Admin session access') THEN
    CREATE POLICY "Admin session access" ON admin_sessions FOR ALL USING (true);
  END IF;
END $$;

-- Enable RLS on tables (only if not already enabled)
ALTER TABLE website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_website_content_id ON website_content(id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_contest_submissions_user_id ON contest_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_contest_submissions_status ON contest_submissions(status);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_session_id ON admin_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);
