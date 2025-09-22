-- Update contest_submissions table to add winner fields
-- Run this in your Supabase SQL Editor

-- Add winner fields to existing contest_submissions table
ALTER TABLE contest_submissions 
ADD COLUMN IF NOT EXISTS winner_rank INTEGER CHECK (winner_rank IN (1, 2, 3)),
ADD COLUMN IF NOT EXISTS winner_announcement_timestamp TIMESTAMP WITH TIME ZONE;

-- Create index for winner queries
CREATE INDEX IF NOT EXISTS idx_contest_submissions_winner_rank ON contest_submissions(winner_rank) WHERE winner_rank IS NOT NULL;

-- Update existing submissions to sync with website_content winners (optional)
-- This will help maintain consistency if you have existing winner data

-- Function to sync winners from website_content to contest_submissions
CREATE OR REPLACE FUNCTION sync_winners_to_submissions()
RETURNS void AS $$
DECLARE
    winner_data jsonb;
    winner_record jsonb;
    winner_name text;
    winner_rank integer;
BEGIN
    -- Get winners from website_content
    SELECT content->'winners' INTO winner_data
    FROM website_content 
    WHERE id = 1;
    
    -- Clear existing winner ranks
    UPDATE contest_submissions SET winner_rank = NULL, winner_announcement_timestamp = NULL;
    
    -- Loop through winners and update submissions
    FOR winner_rank IN 1..3 LOOP
        SELECT winner_data->((winner_rank-1)::text) INTO winner_record;
        
        IF winner_record IS NOT NULL THEN
            winner_name := winner_record->>'name';
            
            -- Try to match by name and update the submission
            UPDATE contest_submissions 
            SET 
                winner_rank = winner_rank,
                winner_announcement_timestamp = NOW()
            WHERE LOWER(name) = LOWER(winner_name)
            AND winner_rank IS NULL  -- Only update if not already a winner
            LIMIT 1;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Uncomment the line below if you want to sync existing winners
-- SELECT sync_winners_to_submissions();

-- Create a view for easy winner queries
CREATE OR REPLACE VIEW contest_winners AS
SELECT 
    id,
    name,
    email,
    company,
    role,
    contest_title,
    technique_title,
    technique_description,
    impact_benefits,
    submission_text,
    submission_file_url,
    winner_rank,
    winner_announcement_timestamp,
    created_at
FROM contest_submissions
WHERE winner_rank IS NOT NULL
ORDER BY winner_rank ASC, winner_announcement_timestamp DESC;

-- Grant access to the view
GRANT SELECT ON contest_winners TO authenticated;
GRANT SELECT ON contest_winners TO anon;

-- Update complete!