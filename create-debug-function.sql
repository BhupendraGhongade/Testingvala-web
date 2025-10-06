-- Create debug function for winners
-- Run this in your Supabase SQL Editor

-- Create a debug function to get winners data
CREATE OR REPLACE FUNCTION get_winners_debug()
RETURNS TABLE (
  debug_step text,
  result_data jsonb
) 
LANGUAGE plpgsql
AS $$
BEGIN
  -- Step 1: Check table exists and row count
  RETURN QUERY
  SELECT 
    'total_submissions'::text,
    jsonb_build_object('count', COUNT(*))
  FROM contest_submissions;
  
  -- Step 2: Check Bhupendra's submissions
  RETURN QUERY
  SELECT 
    'bhupendra_submissions'::text,
    jsonb_agg(
      jsonb_build_object(
        'id', id,
        'name', name,
        'email', email,
        'winner_rank', winner_rank,
        'status', status,
        'created_at', created_at,
        'updated_at', updated_at
      )
    )
  FROM contest_submissions 
  WHERE email = 'bghongade@york.ie';
  
  -- Step 3: Check all winners
  RETURN QUERY
  SELECT 
    'all_winners'::text,
    jsonb_agg(
      jsonb_build_object(
        'id', id,
        'name', name,
        'email', email,
        'winner_rank', winner_rank,
        'status', status,
        'technique_title', technique_title,
        'created_at', created_at,
        'updated_at', updated_at
      )
    )
  FROM contest_submissions 
  WHERE winner_rank IS NOT NULL;
  
  -- Step 4: Check winners by rank
  RETURN QUERY
  SELECT 
    'winners_by_rank'::text,
    jsonb_agg(
      jsonb_build_object(
        'winner_rank', winner_rank,
        'count', count
      )
    )
  FROM (
    SELECT winner_rank, COUNT(*) as count
    FROM contest_submissions 
    WHERE winner_rank IN (1, 2, 3)
    GROUP BY winner_rank
    ORDER BY winner_rank
  ) ranked_winners;
  
  -- Step 5: Check recent updates
  RETURN QUERY
  SELECT 
    'recent_updates'::text,
    COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', id,
        'name', name,
        'email', email,
        'winner_rank', winner_rank,
        'status', status,
        'updated_at', updated_at
      )
    ), '[]'::jsonb)
  FROM (
    SELECT id, name, email, winner_rank, status, updated_at
    FROM contest_submissions 
    WHERE updated_at > NOW() - INTERVAL '24 hours'
    ORDER BY updated_at DESC
  ) recent_data;
  
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_winners_debug() TO authenticated;
GRANT EXECUTE ON FUNCTION get_winners_debug() TO anon;

-- Test the function
SELECT * FROM get_winners_debug();