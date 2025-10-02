-- Local Development Test Data
-- This creates realistic test data for development

-- Create tables if they don't exist (for local development)
CREATE TABLE IF NOT EXISTS website_content (
    id BIGINT PRIMARY KEY DEFAULT 1,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    company TEXT,
    role TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_email TEXT NOT NULL,
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

-- Insert test data
INSERT INTO website_content (id, content) VALUES (1, '{
  "contest": {
    "title": "🧪 Local Dev Contest",
    "theme": "Testing Environment",
    "prizes": "Test Prizes Only",
    "submission": "This is test data for local development",
    "deadline": "2025-12-31",
    "status": "Testing"
  },
  "hero": {
    "headline": "Local Development Environment",
    "subtitle": "Safe testing environment with fake data",
    "badge": "🧪 DEV MODE",
    "stats": {
      "participants": "10",
      "prizes": "$0",
      "support": "Local"
    }
  },
  "winners": [
    {
      "name": "Test User 1",
      "title": "Test Winner",
      "trick": "Local Testing Technique",
      "avatar": "🧪"
    }
  ],
  "about": {
    "description": "Local development environment for TestingVala",
    "features": [
      "Local testing",
      "Safe development",
      "Fake data",
      "No production impact"
    ]
  },
  "contact": {
    "email": "dev@localhost",
    "website": "localhost:3000",
    "location": "Local Development"
  }
}') ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content;

-- Test users
INSERT INTO users (id, email, name, company, role) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'testuser@example.com', 'Test User', 'Test Company', 'QA Engineer'),
  ('00000000-0000-0000-0000-000000000002', 'admin@example.com', 'Test Admin', 'TestingVala', 'Admin'),
  ('00000000-0000-0000-0000-000000000003', 'john@example.com', 'John Doe', 'Tech Corp', 'Senior QA'),
  ('00000000-0000-0000-0000-000000000004', 'jane@example.com', 'Jane Smith', 'StartupXYZ', 'QA Lead')
ON CONFLICT (id) DO NOTHING;

-- Test contest submissions
INSERT INTO contest_submissions (user_id, contest_title, submission_text, status) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Local Test Contest', 'This is a test submission for local development', 'approved'),
  ('00000000-0000-0000-0000-000000000003', 'Local Test Contest', 'Another test submission with different content', 'pending')
ON CONFLICT (id) DO NOTHING;

-- Test payment requests
INSERT INTO payment_requests (user_name, user_email, email, user_phone, transaction_id, status) VALUES 
  ('Test User', 'testuser@example.com', 'testuser@example.com', '+1234567890', 'TEST123456', 'approved'),
  ('John Doe', 'john@example.com', 'john@example.com', '+1987654321', 'TEST789012', 'pending')
ON CONFLICT (id) DO NOTHING;

-- Test forum posts
INSERT INTO forum_posts (title, content, author_name, author_email) VALUES 
  ('Welcome to Local Development', 'This is a test forum post for local development environment.', 'Test Admin', 'admin@example.com'),
  ('Testing Best Practices', 'Here are some testing tips for local development...', 'Test User', 'testuser@example.com')
ON CONFLICT (id) DO NOTHING;

-- Admin test data
INSERT INTO admin.payment_config (id, monthly_price, upi_id) VALUES 
  (1, 99, 'test@paytm') 
ON CONFLICT (id) DO UPDATE SET 
  monthly_price = EXCLUDED.monthly_price,
  upi_id = EXCLUDED.upi_id;

INSERT INTO admin.admin_sessions (session_id, expires_at) VALUES 
  ('test-session-123', NOW() + INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

SELECT '✅ Local test data loaded successfully!' as status;