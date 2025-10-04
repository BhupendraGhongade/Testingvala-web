-- ============================================================================
-- SIMPLE FORUM RLS FIX - Minimal changes to allow post creation
-- ============================================================================

-- Option 1: Quick fix - Allow all authenticated users to insert
CREATE POLICY IF NOT EXISTS "allow_authenticated_insert" ON forum_posts
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Option 2: If above fails, try this more permissive approach
CREATE POLICY IF NOT EXISTS "allow_all_authenticated_operations" ON forum_posts
  FOR ALL 
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Verify current policies
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'forum_posts';