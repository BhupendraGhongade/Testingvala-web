-- Fix contest_submissions table to match the submission form fields
-- Run this in your Supabase SQL Editor

-- Add missing columns to contest_submissions table
ALTER TABLE contest_submissions 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS mobile TEXT,
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS role TEXT,
ADD COLUMN IF NOT EXISTS experience_years TEXT,
ADD COLUMN IF NOT EXISTS technique_title TEXT,
ADD COLUMN IF NOT EXISTS technique_description TEXT,
ADD COLUMN IF NOT EXISTS impact_benefits TEXT;

-- Update the table to ensure it has all the winner fields from the previous update
ALTER TABLE contest_submissions 
ADD COLUMN IF NOT EXISTS winner_rank INTEGER CHECK (winner_rank IN (1, 2, 3)),
ADD COLUMN IF NOT EXISTS winner_announcement_timestamp TIMESTAMP WITH TIME ZONE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contest_submissions_email ON contest_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contest_submissions_status ON contest_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contest_submissions_winner_rank ON contest_submissions(winner_rank) WHERE winner_rank IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contest_submissions_created_at ON contest_submissions(created_at);

-- Update RLS policies to allow inserts from authenticated and anonymous users
-- (This allows the submission form to work)
DROP POLICY IF EXISTS "Allow public read access" ON contest_submissions;
DROP POLICY IF EXISTS "Allow public insert access" ON contest_submissions;

CREATE POLICY "Allow public read access" ON contest_submissions
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON contest_submissions
  FOR INSERT WITH CHECK (true);

-- Enable RLS
ALTER TABLE contest_submissions ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT, INSERT ON contest_submissions TO anon;
GRANT ALL ON contest_submissions TO authenticated;

-- Create a view for easy winner queries (updated)
DROP VIEW IF EXISTS contest_winners;
CREATE OR REPLACE VIEW contest_winners AS
SELECT 
    id,
    name,
    email,
    mobile,
    company,
    role,
    experience_years,
    contest_title,
    technique_title,
    technique_description,
    impact_benefits,
    submission_text,
    submission_file_url,
    winner_rank,
    winner_announcement_timestamp,
    status,
    created_at
FROM contest_submissions
WHERE winner_rank IS NOT NULL
ORDER BY winner_rank ASC, winner_announcement_timestamp DESC;

-- Grant access to the view
GRANT SELECT ON contest_winners TO authenticated;
GRANT SELECT ON contest_winners TO anon;

-- Schema update complete!
-- Now the submission form and admin panel should work together properly.