-- Create a test post to verify visibility

-- First, ensure RLS is disabled
ALTER TABLE forum_posts DISABLE ROW LEVEL SECURITY;

-- Create a simple test post
INSERT INTO forum_posts (
  id,
  title, 
  content,
  author_name,
  status,
  is_approved,
  created_at,
  category_id
) VALUES (
  gen_random_uuid(),
  'Test Post for Unverified Users',
  'This is a test post to check if unverified users can see forum posts. If you can see this, the fix is working!',
  'test_user',
  'active',
  true,
  NOW(),
  'general'
) ON CONFLICT DO NOTHING;

-- Verify the post was created
SELECT 'Test post created' as status, COUNT(*) as count 
FROM forum_posts 
WHERE title = 'Test Post for Unverified Users';