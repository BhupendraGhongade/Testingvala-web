-- EMERGENCY RLS FIX - Immediate solution for forum_posts insert error

-- Step 1: Drop ALL existing policies completely
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'forum_posts'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON forum_posts';
    END LOOP;
END $$;

-- Step 2: Create minimal working policies
CREATE POLICY "allow_all_reads" ON forum_posts FOR SELECT USING (true);

CREATE POLICY "allow_authenticated_inserts" ON forum_posts 
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "allow_own_updates" ON forum_posts 
FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "allow_own_deletes" ON forum_posts 
FOR DELETE USING (auth.uid()::text = user_id);

-- Step 3: Verify policies are active
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'forum_posts';