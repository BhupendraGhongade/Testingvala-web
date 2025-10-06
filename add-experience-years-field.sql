-- Add experience_years field to forum_posts table
ALTER TABLE forum_posts 
ADD COLUMN IF NOT EXISTS experience_years TEXT;

-- Add comment for documentation
COMMENT ON COLUMN forum_posts.experience_years IS 'User experience in years (e.g., "2 years", "5 years", "10+ years")';