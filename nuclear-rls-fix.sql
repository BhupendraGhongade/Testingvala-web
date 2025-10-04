-- NUCLEAR OPTION - If all else fails, temporarily disable RLS for testing

-- Disable RLS temporarily
ALTER TABLE forum_posts DISABLE ROW LEVEL SECURITY;

-- Test insert (this should work now)
-- After confirming inserts work, re-enable with simple policy:

-- ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "simple_policy" ON forum_posts FOR ALL USING (true);