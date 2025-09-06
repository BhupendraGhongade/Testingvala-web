-- Enhanced Complete Database Setup for TestingVala Website
-- This script creates ALL necessary tables and ensures complete data storage

-- 1. Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. WEBSITE CONTENT TABLE - Stores all main website data
CREATE TABLE IF NOT EXISTS website_content (
  id BIGINT PRIMARY KEY DEFAULT 1,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. UPCOMING EVENTS TABLE - Enhanced events management
CREATE TABLE IF NOT EXISTS upcoming_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(200),
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 120,
    registration_link VARCHAR(500),
    image_url VARCHAR(500),
    event_type VARCHAR(50) DEFAULT 'workshop', -- workshop, seminar, masterclass, webinar
    difficulty_level VARCHAR(20) DEFAULT 'beginner', -- beginner, intermediate, advanced
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. USERS TABLE - User management
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  company TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CONTEST SUBMISSIONS TABLE - Contest entries
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

-- 6. ADMIN SESSIONS TABLE - Admin authentication
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 7. WEBSITE STATISTICS TABLE - Track website metrics
CREATE TABLE IF NOT EXISTS website_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_name VARCHAR(100) NOT NULL,
  stat_value TEXT NOT NULL,
  stat_category VARCHAR(50) NOT NULL, -- hero, about, contest, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. CONTENT VERSIONS TABLE - Track content changes
CREATE TABLE IF NOT EXISTS content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_name VARCHAR(100) NOT NULL,
  content_data JSONB NOT NULL,
  version_number INTEGER NOT NULL,
  change_description TEXT,
  created_by VARCHAR(100) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_website_content_id ON website_content(id);
CREATE INDEX IF NOT EXISTS idx_events_date ON upcoming_events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_active ON upcoming_events(is_active);
CREATE INDEX IF NOT EXISTS idx_events_type ON upcoming_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_featured ON upcoming_events(is_featured);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_contest_submissions_user_id ON contest_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_contest_submissions_status ON contest_submissions(status);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_session_id ON admin_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_website_statistics_category ON website_statistics(stat_category);
CREATE INDEX IF NOT EXISTS idx_content_versions_section ON content_versions(section_name);

-- 10. Enable Row Level Security (RLS)
ALTER TABLE website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE upcoming_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;

-- 11. Create RLS policies
-- Website content policies
CREATE POLICY "Public read access to website content" ON website_content
    FOR SELECT USING (true);

CREATE POLICY "Admin full access to website content" ON website_content
    FOR ALL USING (true);

-- Events policies
CREATE POLICY "Public read access to active events" ON upcoming_events
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin full access to events" ON upcoming_events
    FOR ALL USING (true);

-- Users policies
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data" ON users
    FOR INSERT WITH CHECK (true);

-- Contest submissions policies
CREATE POLICY "Users can view their own submissions" ON contest_submissions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert submissions" ON contest_submissions
    FOR INSERT WITH CHECK (true);

-- Admin sessions policies
CREATE POLICY "Admin session access" ON admin_sessions
    FOR ALL USING (true);

-- Statistics policies
CREATE POLICY "Public read access to statistics" ON website_statistics
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin full access to statistics" ON website_statistics
    FOR ALL USING (true);

-- Content versions policies
CREATE POLICY "Admin read access to content versions" ON content_versions
    FOR SELECT USING (true);

CREATE POLICY "Admin insert access to content versions" ON content_versions
    FOR INSERT WITH CHECK (true);

-- 12. Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 13. Create triggers for updated_at
CREATE TRIGGER update_website_content_updated_at
    BEFORE UPDATE ON website_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON upcoming_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contest_submissions_updated_at
    BEFORE UPDATE ON contest_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_website_statistics_updated_at
    BEFORE UPDATE ON website_statistics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 14. Insert initial website content (only if not exists)
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
    "badge": "🚀 Test Your QA Skills. Win Rewards. Build Your Career",
    "stats": {
      "participants": "500+",
      "prizes": "$2,000+",
      "support": "24/7"
    }
  },
  "winners": [
    {
      "name": "Sarah Johnson",
      "title": "QA Automation Expert",
      "trick": "Implemented a robust test automation framework that reduced testing time by 60% while maintaining 99% accuracy.",
      "avatar": "🏆"
    },
    {
      "name": "Michael Chen",
      "title": "Performance Testing Specialist",
      "trick": "Developed innovative load testing strategies that identified critical bottlenecks before production deployment.",
      "avatar": "🥈"
    },
    {
      "name": "Emily Rodriguez",
      "title": "Mobile Testing Guru",
      "trick": "Created comprehensive mobile testing protocols that improved app stability across all device types.",
      "avatar": "🥉"
    }
  ],
  "about": {
    "description": "TestingVala.com is revolutionizing the QA industry by creating a platform where testing professionals can showcase their skills, learn from each other, and compete for recognition and rewards.",
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

-- 15. Insert initial website statistics
INSERT INTO website_statistics (stat_name, stat_value, stat_category) VALUES
('participants', '500+', 'hero'),
('prizes', '$2,000+', 'hero'),
('support', '24/7', 'hero'),
('members', '10,000+', 'about'),
('tips', '500+', 'about'),
('contests', '12+', 'about'),
('countries', '50+', 'about')
ON CONFLICT DO NOTHING;

-- 16. Insert comprehensive dummy data for upcoming events
INSERT INTO upcoming_events (
    title, 
    description, 
    short_description,
    event_date, 
    event_time, 
    duration_minutes,
    registration_link, 
    image_url, 
    event_type, 
    difficulty_level, 
    max_participants,
    is_featured
) VALUES 
(
    'QA Automation Masterclass 2025',
    'Join industry experts for an intensive 3-hour masterclass covering the latest automation testing frameworks, tools, and best practices. Learn Selenium, Cypress, Playwright, and more. Perfect for QA professionals looking to advance their automation skills.',
    'Master the latest automation testing frameworks and tools in this intensive 3-hour session.',
    '2025-02-15',
    '14:00:00',
    180,
    'https://forms.google.com/automation-masterclass',
    'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=600&h=400&fit=crop',
    'masterclass',
    'advanced',
    50,
    true
),
(
    'Mobile App Testing Workshop',
    'Comprehensive workshop covering mobile application testing strategies, tools, and methodologies. Learn about device testing, automation frameworks, and real-world testing scenarios for iOS and Android applications.',
    'Learn mobile app testing strategies and tools for iOS and Android applications.',
    '2025-02-20',
    '10:00:00',
    120,
    'https://forms.google.com/mobile-testing',
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=400&fit=crop',
    'workshop',
    'intermediate',
    40,
    true
),
(
    'Performance Testing Fundamentals',
    'Introduction to performance testing concepts, tools, and methodologies. Learn about load testing, stress testing, and performance monitoring using tools like JMeter, Gatling, and K6.',
    'Master performance testing fundamentals with hands-on experience using industry tools.',
    '2025-02-25',
    '15:30:00',
    150,
    'https://forms.google.com/performance-testing',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
    'workshop',
    'beginner',
    60,
    false
),
(
    'API Testing with Postman & RestAssured',
    'Learn API testing from basics to advanced techniques using Postman and RestAssured. Cover authentication, validation, automation, and integration testing for REST and GraphQL APIs.',
    'Master API testing using Postman and RestAssured for comprehensive API validation.',
    '2025-03-01',
    '13:00:00',
    120,
    'https://forms.google.com/api-testing',
    'https://images.unsplash.com/photo-1555066931-4365d308bab7?w=600&h=400&fit=crop',
    'workshop',
    'intermediate',
    45,
    false
),
(
    'Security Testing for QA Engineers',
    'Essential security testing concepts and practices for QA professionals. Learn about OWASP Top 10, security testing tools, and how to integrate security testing into your QA process.',
    'Learn essential security testing concepts and integrate them into your QA workflow.',
    '2025-03-05',
    '11:00:00',
    90,
    'https://forms.google.com/security-testing',
    'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop',
    'seminar',
    'intermediate',
    35,
    false
)
ON CONFLICT DO NOTHING;

-- 17. Create views for better data access
CREATE OR REPLACE VIEW featured_events AS
SELECT * FROM upcoming_events 
WHERE is_featured = true AND is_active = true 
ORDER BY event_date ASC;

CREATE OR REPLACE VIEW upcoming_events_30_days AS
SELECT * FROM upcoming_events 
WHERE event_date >= CURRENT_DATE 
AND event_date <= CURRENT_DATE + INTERVAL '30 days'
AND is_active = true 
ORDER BY event_date ASC;

CREATE OR REPLACE VIEW website_overview AS
SELECT 
    wc.id,
    wc.content->>'contest' as contest_data,
    wc.content->>'hero' as hero_data,
    wc.content->>'winners' as winners_data,
    wc.content->>'about' as about_data,
    wc.content->>'contact' as contact_data,
    wc.updated_at as last_updated
FROM website_content wc;

-- 18. Create function to track content changes
CREATE OR REPLACE FUNCTION track_content_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into content_versions table
    INSERT INTO content_versions (section_name, content_data, version_number, change_description, created_by)
    VALUES (
        'website_content',
        NEW.content,
        COALESCE((SELECT MAX(version_number) FROM content_versions WHERE section_name = 'website_content'), 0) + 1,
        'Content updated via admin panel',
        'admin'
    );
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 19. Create trigger for content change tracking
CREATE TRIGGER track_website_content_changes
    AFTER UPDATE ON website_content
    FOR EACH ROW
    EXECUTE FUNCTION track_content_change();

-- 20. Grant permissions (adjust as needed for your setup)
-- GRANT SELECT ON website_content TO anon;
-- GRANT ALL ON website_content TO authenticated;
-- GRANT SELECT ON upcoming_events TO anon;
-- GRANT ALL ON upcoming_events TO authenticated;
-- GRANT SELECT ON featured_events TO anon;
-- GRANT SELECT ON upcoming_events_30_days TO anon;
-- GRANT SELECT ON website_overview TO anon;

-- 21. Create function to get website content with statistics
CREATE OR REPLACE FUNCTION get_website_content_with_stats()
RETURNS TABLE (
    content JSONB,
    statistics JSONB,
    last_updated TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        wc.content,
        COALESCE(
            jsonb_object_agg(ws.stat_name, ws.stat_value),
            '{}'::jsonb
        ) as statistics,
        wc.updated_at
    FROM website_content wc
    LEFT JOIN website_statistics ws ON ws.is_active = true
    WHERE wc.id = 1
    GROUP BY wc.content, wc.updated_at;
END;
$$ language 'plpgsql';

-- 22. Create function to update specific section
CREATE OR REPLACE FUNCTION update_website_section(
    section_name TEXT,
    section_data JSONB
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE website_content 
    SET content = jsonb_set(content, ARRAY[section_name], section_data)
    WHERE id = 1;
    
    RETURN FOUND;
END;
$$ language 'plpgsql';

-- 23. Final verification queries
-- Uncomment these to verify the setup:
-- SELECT 'Tables created successfully' as status;
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
-- SELECT 'Initial data inserted successfully' as status;
-- SELECT COUNT(*) as events_count FROM upcoming_events;
-- SELECT COUNT(*) as stats_count FROM website_statistics;
-- SELECT 'Setup complete!' as status;
