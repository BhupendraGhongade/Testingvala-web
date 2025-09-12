-- Create upcoming_events table for TestingVala website
CREATE TABLE IF NOT EXISTS upcoming_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    registration_link VARCHAR(500),
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_events_date ON upcoming_events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_active ON upcoming_events(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE upcoming_events ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access to active events" ON upcoming_events
    FOR SELECT USING (is_active = true);

-- Create policy for admin insert/update/delete
CREATE POLICY "Allow admin full access to events" ON upcoming_events
    FOR ALL USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON upcoming_events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample events for testing
INSERT INTO upcoming_events (title, description, event_date, event_time, registration_link, image_url) VALUES
('QA Automation Workshop', 'Learn the latest automation techniques and tools for quality assurance', '2025-02-15', '14:00:00', 'https://forms.google.com/workshop1', NULL),
('Testing Best Practices Seminar', 'Industry experts share insights on modern testing methodologies', '2025-02-20', '10:00:00', 'https://forms.google.com/seminar1', NULL),
('Performance Testing Masterclass', 'Deep dive into performance testing strategies and tools', '2025-02-25', '15:30:00', 'https://forms.google.com/masterclass1', NULL),
('Mobile App Testing Workshop', 'Comprehensive guide to mobile application testing', '2025-03-01', '13:00:00', 'https://forms.google.com/mobile1', NULL),
('API Testing Fundamentals', 'Learn API testing from basics to advanced techniques', '2025-03-05', '11:00:00', 'https://forms.google.com/api1', NULL);
