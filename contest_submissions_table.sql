-- Contest Submissions Table
-- This table stores all contest submissions from users

CREATE TABLE IF NOT EXISTS contest_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT NOT NULL,
  experience_years TEXT NOT NULL,
  technique_title TEXT NOT NULL,
  technique_description TEXT NOT NULL,
  impact_benefits TEXT NOT NULL,
  contest_theme TEXT NOT NULL DEFAULT 'Advanced Testing Methodologies',
  attachment_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contest_submissions_status ON contest_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contest_submissions_email ON contest_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contest_submissions_submission_date ON contest_submissions(submission_date);
CREATE INDEX IF NOT EXISTS idx_contest_submissions_contest_theme ON contest_submissions(contest_theme);

-- Enable Row Level Security (RLS)
ALTER TABLE contest_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for contest submissions
-- Allow anyone to insert (submit) contest entries
CREATE POLICY "Anyone can submit contest entries" ON contest_submissions
  FOR INSERT WITH CHECK (true);

-- Allow users to view their own submissions
CREATE POLICY "Users can view their own submissions" ON contest_submissions
  FOR SELECT USING (auth.jwt() ->> 'email' = email);

-- Allow admins to view all submissions
CREATE POLICY "Admins can view all submissions" ON contest_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_sessions 
      WHERE session_id = current_setting('request.jwt.claims', true)::json ->> 'session_id'
      AND expires_at > NOW()
    )
  );

-- Allow admins to update submissions (change status, add notes)
CREATE POLICY "Admins can update submissions" ON contest_submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_sessions 
      WHERE session_id = current_setting('request.jwt.claims', true)::json ->> 'session_id'
      AND expires_at > NOW()
    )
  );

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_contest_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_contest_submissions_updated_at_trigger
  BEFORE UPDATE ON contest_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_contest_submissions_updated_at();

-- Insert some sample data for testing (optional)
INSERT INTO contest_submissions (
  full_name,
  email,
  mobile,
  experience_years,
  technique_title,
  technique_description,
  impact_benefits,
  contest_theme,
  status
) VALUES 
(
  'Sarah Johnson',
  'sarah.johnson@techcorp.com',
  '+1 (555) 123-4567',
  '6-8',
  'AI-Powered Test Case Generation',
  'Developed an innovative approach using machine learning to automatically generate comprehensive test cases based on user stories and requirements. This technique leverages natural language processing to understand requirements and creates both positive and negative test scenarios. The system integrates with popular test management tools and can generate test cases in multiple formats including Gherkin, traditional test cases, and automated test scripts.',
  'Reduced test case creation time from 8 hours to 2.4 hours per sprint (70% reduction). Improved test coverage by 45% and caught 30% more edge cases compared to manual methods. The technique has been adopted by 3 teams in our organization, resulting in overall testing efficiency improvements and faster release cycles.',
  'Advanced Testing Methodologies',
  'pending'
),
(
  'Michael Chen',
  'michael.chen@innovate.io',
  '+1 (555) 987-6543',
  '9-12',
  'Smart Visual Regression Testing',
  'Created a visual testing framework that uses computer vision and machine learning algorithms to detect UI changes with 99.5% accuracy. The system automatically identifies critical visual bugs while ignoring acceptable variations like dynamic content, timestamps, and minor layout shifts. It integrates with CI/CD pipelines and provides detailed visual diff reports with highlighted changes.',
  'Eliminated 95% of false positives in visual testing, saving 12 hours per week of manual review time. Reduced visual QA time by 60% while improving accuracy. Caught 40% more visual regressions that were previously missed by manual testing. Improved user experience quality scores by 40% and reduced post-release visual bugs by 85%.',
  'Advanced Testing Methodologies',
  'approved'
),
(
  'Emily Rodriguez',
  'emily.r@qualitytech.com',
  '+1 (555) 456-7890',
  '4-5',
  'Behavioral-Driven Performance Testing',
  'Integrated BDD principles with performance testing to create user-story-driven performance scenarios. This approach makes performance requirements more understandable and testable for the entire team. Performance tests are written in Gherkin syntax and can be executed by both technical and non-technical team members. The framework supports load, stress, and endurance testing scenarios.',
  'Improved stakeholder understanding of performance requirements by 80%. Reduced performance-related production issues by 55% through better requirement clarity. Accelerated performance testing cycles by 35% due to improved collaboration between teams. Enhanced performance test coverage by 50% as business analysts can now contribute to performance test scenarios.',
  'Advanced Testing Methodologies',
  'pending'
);

-- Create a view for contest submission statistics
CREATE OR REPLACE VIEW contest_submission_stats AS
SELECT 
  contest_theme,
  COUNT(*) as total_submissions,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
  MIN(submission_date) as first_submission,
  MAX(submission_date) as latest_submission
FROM contest_submissions
GROUP BY contest_theme;

-- Grant necessary permissions
GRANT SELECT ON contest_submission_stats TO anon, authenticated;
GRANT ALL ON contest_submissions TO authenticated;
GRANT ALL ON contest_submissions TO service_role;