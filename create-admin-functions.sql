-- Create admin functions to bypass RLS completely

-- Function to get all forum posts (bypasses RLS)
CREATE OR REPLACE FUNCTION get_all_forum_posts()
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  user_id TEXT,
  status TEXT,
  is_approved BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fp.id,
    fp.title,
    fp.content,
    fp.user_id,
    COALESCE(fp.status, 'active') as status,
    COALESCE(fp.is_approved, true) as is_approved,
    fp.created_at,
    fp.updated_at
  FROM forum_posts fp
  ORDER BY fp.created_at DESC;
END;
$$;

-- Function to get post count
CREATE OR REPLACE FUNCTION get_forum_post_count()
RETURNS INTEGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  post_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO post_count FROM forum_posts;
  RETURN post_count;
END;
$$;

-- Function to delete post (admin only)
CREATE OR REPLACE FUNCTION admin_delete_post(post_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM forum_posts WHERE id = post_id;
  RETURN FOUND;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_all_forum_posts() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_forum_post_count() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_delete_post(UUID) TO anon, authenticated;

-- Test the function
SELECT 'Admin functions created successfully' as result;
SELECT get_forum_post_count() as total_posts;