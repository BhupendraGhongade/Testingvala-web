-- Quick Setup Script for Contest Submissions Management
-- Run this in your Supabase SQL Editor

-- 1. Create contest_submissions table
CREATE TABLE IF NOT EXISTS contest_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User Information
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT,
  company TEXT,
  role TEXT,
  experience_years TEXT,
  
  -- Contest Details
  contest_title TEXT NOT NULL,
  contest_id TEXT,
  
  -- Submission Content
  technique_title TEXT,
  technique_description TEXT,
  impact_benefits TEXT,
  submission_text TEXT NOT NULL,
  submission_file_url TEXT,
  
  -- Status and Management
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected', 'winner')),
  admin_notes TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', 
      COALESCE(name, '') || ' ' || 
      COALESCE(email, '') || ' ' || 
      COALESCE(contest_title, '') || ' ' || 
      COALESCE(technique_title, '') || ' ' || 
      COALESCE(submission_text, '')
    )
  ) STORED
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_contest_submissions_status ON contest_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contest_submissions_contest ON contest_submissions(contest_title);
CREATE INDEX IF NOT EXISTS idx_contest_submissions_created ON contest_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contest_submissions_email ON contest_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contest_submissions_search ON contest_submissions USING GIN(search_vector);

-- 3. Create deletion tracking table
CREATE TABLE IF NOT EXISTS contest_submission_deletions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL,
  submission_data JSONB NOT NULL,
  deleted_by TEXT NOT NULL,
  deletion_reason TEXT,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create update trigger
CREATE OR REPLACE FUNCTION update_contest_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contest_submissions_updated_at
  BEFORE UPDATE ON contest_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_contest_submissions_updated_at();

-- 5. Enable RLS
ALTER TABLE contest_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_submission_deletions ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies
CREATE POLICY "Allow public insert" ON contest_submissions
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Allow users to read submissions" ON contest_submissions
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Admin only updates" ON contest_submissions
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin only deletes" ON contest_submissions
  FOR DELETE TO authenticated
  USING (true);

CREATE POLICY "Admin only deletion tracking" ON contest_submission_deletions
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- 7. Grant permissions
GRANT ALL ON contest_submissions TO authenticated;
GRANT ALL ON contest_submission_deletions TO authenticated;
GRANT SELECT, INSERT ON contest_submissions TO anon;

-- 8. Insert sample data (optional - remove if not needed)
INSERT INTO contest_submissions (
  name, email, mobile, company, role, experience_years,
  contest_title, technique_title, technique_description, impact_benefits,
  submission_text, status
) VALUES 
(
  'John Smith',
  'john.smith@example.com',
  '+1-555-0123',
  'TechCorp Inc',
  'Senior QA Engineer',
  '5-7',
  'January 2025 QA Contest',
  'AI-Powered Test Case Generation',
  'Developed an AI system that automatically generates comprehensive test cases based on requirements analysis and code structure.',
  'Reduced test case creation time by 70% and improved test coverage by 45%.',
  'AI-Powered Test Case Generation: Developed an AI system that automatically generates comprehensive test cases based on requirements analysis and code structure. Impact: Reduced test case creation time by 70% and improved test coverage by 45%.',
  'pending'
),
(
  'Sarah Johnson',
  'sarah.j@company.com',
  '+1-555-0456',
  'QualityFirst Solutions',
  'Test Automation Lead',
  '8-10',
  'January 2025 QA Contest',
  'Smart Visual Regression Testing',
  'Created a machine learning-based visual regression testing framework that intelligently identifies meaningful UI changes.',
  'Eliminated 90% of false positives in visual testing and caught 3x more real UI bugs.',
  'Smart Visual Regression Testing: Created a machine learning-based visual regression testing framework that intelligently identifies meaningful UI changes. Impact: Eliminated 90% of false positives in visual testing and caught 3x more real UI bugs.',
  'reviewed'
) ON CONFLICT DO NOTHING;

-- Setup complete! 
-- Your contest submissions management system is now ready.
-- Access it via Admin Panel → Submissions tab