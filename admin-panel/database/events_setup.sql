-- Events Management Database Setup for TestingVala
-- Run this SQL in your Supabase SQL Editor

-- Create upcoming_events table
CREATE TABLE IF NOT EXISTS upcoming_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 120,
  registration_link TEXT,
  image_url TEXT,
  event_type TEXT DEFAULT 'workshop' CHECK (event_type IN ('workshop', 'seminar', 'masterclass', 'webinar', 'conference')),
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  max_participants INTEGER,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  price TEXT DEFAULT '$99',
  capacity INTEGER DEFAULT 50,
  registered_count INTEGER DEFAULT 0,
  speaker TEXT DEFAULT 'QA Expert',
  speaker_title TEXT DEFAULT 'Senior QA Professional',
  company TEXT DEFAULT 'TestingVala',
  location TEXT DEFAULT 'Online',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_upcoming_events_date ON upcoming_events(event_date);
CREATE INDEX IF NOT EXISTS idx_upcoming_events_active ON upcoming_events(is_active);
CREATE INDEX IF NOT EXISTS idx_upcoming_events_featured ON upcoming_events(is_featured);
CREATE INDEX IF NOT EXISTS idx_upcoming_events_type ON upcoming_events(event_type);

-- Enable Row Level Security
ALTER TABLE upcoming_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Events are viewable by everyone" ON upcoming_events
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all events" ON upcoming_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_upcoming_events_updated_at ON upcoming_events;
CREATE TRIGGER update_upcoming_events_updated_at
  BEFORE UPDATE ON upcoming_events
  FOR EACH ROW EXECUTE FUNCTION update_events_updated_at();

-- Insert sample events (optional)
INSERT INTO upcoming_events (
  title, 
  description, 
  short_description, 
  event_date, 
  event_time, 
  duration_minutes,
  event_type,
  difficulty_level,
  price,
  capacity,
  speaker,
  speaker_title,
  registration_link,
  is_featured,
  is_active
) VALUES 
(
  'QA Automation Masterclass',
  'Comprehensive hands-on training covering modern test automation frameworks, best practices, and real-world implementation strategies.',
  'Master test automation with hands-on training and real-world examples.',
  CURRENT_DATE + INTERVAL '7 days',
  '10:00:00',
  180,
  'masterclass',
  'intermediate',
  '$149',
  100,
  'Sarah Johnson',
  'Senior QA Automation Engineer',
  'https://forms.google.com/automation-masterclass',
  true,
  true
),
(
  'Performance Testing Workshop',
  'Learn performance testing fundamentals, load testing strategies, and how to identify bottlenecks in web applications.',
  'Learn performance testing with practical load testing exercises.',
  CURRENT_DATE + INTERVAL '14 days',
  '15:00:00',
  120,
  'workshop',
  'beginner',
  'Free',
  50,
  'Michael Chen',
  'Performance Testing Specialist',
  'https://forms.google.com/performance-workshop',
  false,
  true
),
(
  'API Testing Seminar',
  'Deep dive into API testing methodologies, tools, and automation strategies for REST and GraphQL APIs.',
  'Master API testing with REST and GraphQL examples.',
  CURRENT_DATE + INTERVAL '21 days',
  '14:00:00',
  90,
  'seminar',
  'intermediate',
  '$99',
  75,
  'Emily Rodriguez',
  'API Testing Expert',
  'https://forms.google.com/api-testing-seminar',
  false,
  true
)
ON CONFLICT DO NOTHING;

SELECT 'Events database setup completed successfully!' as status;