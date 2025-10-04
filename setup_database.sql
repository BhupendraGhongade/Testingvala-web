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

-- Insert initial website content
INSERT INTO website_content (id, content) VALUES (1, '{
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
    "badge": "🚀Test Your QA Skills. Win Rewards. Build Your Career.",
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