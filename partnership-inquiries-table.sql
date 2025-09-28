-- Create partnership inquiries table
CREATE TABLE partnership_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  partnership_type TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'in_progress', 'completed', 'rejected')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  contacted_at TIMESTAMP WITH TIME ZONE,
  contacted_by TEXT
);

-- Create index for faster queries
CREATE INDEX idx_partnership_inquiries_status ON partnership_inquiries(status);
CREATE INDEX idx_partnership_inquiries_created_at ON partnership_inquiries(created_at);
CREATE INDEX idx_partnership_inquiries_partnership_type ON partnership_inquiries(partnership_type);

-- Enable RLS (Row Level Security)
ALTER TABLE partnership_inquiries ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access (adjust based on your admin authentication)
CREATE POLICY "Admin can view all partnership inquiries" ON partnership_inquiries
  FOR ALL USING (true);

-- Insert sample data for testing
INSERT INTO partnership_inquiries (
  company_name, contact_name, email, phone, website, 
  partnership_type, message, status, priority
) VALUES 
(
  'TechCorp Solutions', 
  'John Smith', 
  'john.smith@techcorp.com', 
  '+1-555-0123', 
  'https://techcorp.com',
  'corporate-training',
  'We are interested in providing QA training for our 500+ developers. Looking for comprehensive testing methodologies and automation training programs.',
  'pending',
  'high'
),
(
  'StartupXYZ', 
  'Sarah Johnson', 
  'sarah@startupxyz.com', 
  '+1-555-0456', 
  'https://startupxyz.com',
  'event-hosting',
  'We would like to sponsor your next QA contest and host a webinar on modern testing practices.',
  'contacted',
  'medium'
);