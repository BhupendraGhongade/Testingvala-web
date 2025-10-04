-- ============================================================================
-- FIX FORUM_POSTS RLS POLICIES - Allow authenticated users to create posts
-- ============================================================================

-- Step 1: Drop all existing conflicting policies
DROP POLICY IF EXISTS "public_read_posts" ON forum_posts;
DROP POLICY IF EXISTS "simple_public_read" ON forum_posts;
DROP POLICY IF EXISTS "admin_full_access" ON forum_posts;
DROP POLICY IF EXISTS "simple_admin_access" ON forum_posts;
DROP POLICY IF EXISTS "universal_read_access" ON forum_posts;
DROP POLICY IF EXISTS "anonymous_read_posts" ON forum_posts;
DROP POLICY IF EXISTS "authenticated_read_posts" ON forum_posts;
DROP POLICY IF EXISTS "authenticated_users_can_post" ON forum_posts;
DROP POLICY IF EXISTS "users_edit_own_posts" ON forum_posts;
DROP POLICY IF EXISTS "users_delete_own_posts" ON forum_posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON forum_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON forum_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON forum_posts;
DROP POLICY IF EXISTS "Admins can manage all posts" ON forum_posts;
DROP POLICY IF EXISTS "Active forum posts are viewable by everyone" ON forum_posts;

-- Step 2: Ensure RLS is enabled
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

-- Step 3: Create comprehensive RLS policies

-- Allow everyone to read active posts
CREATE POLICY "forum_posts_select_policy" ON forum_posts
  FOR SELECT 
  USING (status = 'active');

-- Allow authenticated users to insert posts
CREATE POLICY "forum_posts_insert_policy" ON forum_posts
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.role() = 'authenticated'
  );

-- Allow users to update their own posts
CREATE POLICY "forum_posts_update_policy" ON forum_posts
  FOR UPDATE 
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Allow users to delete their own posts
CREATE POLICY "forum_posts_delete_policy" ON forum_posts
  FOR DELETE 
  USING (auth.uid()::text = user_id);

-- Step 4: Create admin override policies (if user_profiles table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    -- Admin can do everything
    EXECUTE 'CREATE POLICY "forum_posts_admin_all_policy" ON forum_posts
      FOR ALL 
      USING (
        EXISTS (
          SELECT 1 FROM user_profiles 
          WHERE id = auth.uid() AND is_admin = true
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM user_profiles 
          WHERE id = auth.uid() AND is_admin = true
        )
      )';
  END IF;
END $$;

-- Step 5: Ensure required columns exist with proper defaults
ALTER TABLE forum_posts 
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true;

-- Update any NULL values
UPDATE forum_posts 
SET 
  status = 'active' 
WHERE status IS NULL;

UPDATE forum_posts 
SET 
  is_approved = true 
WHERE is_approved IS NULL;

-- Step 6: Verify the setup
SELECT 
  'RLS policies created successfully' as status,
  COUNT(*) as total_posts,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_posts
FROM forum_posts;

-- Step 7: Test policy by checking what an authenticated user can see
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'forum_posts'
ORDER BY policyname;