-- Fix RLS policies for contest_submissions table
-- Run this in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access" ON contest_submissions;
DROP POLICY IF EXISTS "Allow public insert access" ON contest_submissions;
DROP POLICY IF EXISTS "Allow public update access" ON contest_submissions;

-- Create comprehensive RLS policies
CREATE POLICY "Allow public read access" ON contest_submissions
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON contest_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON contest_submissions
  FOR UPDATE USING (true);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON contest_submissions TO anon;
GRANT ALL ON contest_submissions TO authenticated;

-- RLS policies updated!