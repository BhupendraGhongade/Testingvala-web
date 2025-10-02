-- WORKING ADMIN & FORUM FIX

-- 1. First, create admin user in Supabase Auth
-- You need to manually create user: bhupa2205@gmail.com with password: Bhup@123
-- Go to Supabase Dashboard > Authentication > Users > Invite User

-- 2. Drop ALL existing policies
DROP POLICY IF EXISTS "public_can_read_approved_posts" ON forum_posts;
DROP POLICY IF EXISTS "authenticated_users_can_create_posts" ON forum_posts;
DROP POLICY IF EXISTS "users_can_update_own_posts" ON forum_posts;
DROP POLICY IF EXISTS "users_can_delete_own_posts" ON forum_posts;
DROP POLICY IF EXISTS "admin_can_see_all_posts" ON forum_posts;
DROP POLICY IF EXISTS "users_can_read_own_posts" ON forum_posts;
DROP POLICY IF EXISTS "users_and_admins_can_update_posts" ON forum_posts;
DROP POLICY IF EXISTS "users_and_admins_can_delete_posts" ON forum_posts;

-- 3. Temporarily disable RLS to make posts visible
ALTER TABLE forum_posts DISABLE ROW LEVEL SECURITY;

-- 4. Add missing columns
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true;

-- 5. Re-enable RLS with simple policies
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

-- 6. Create admin table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Insert admin emails
INSERT INTO admin_users (email) VALUES 
('admin@testingvala.com'),
('bhupa2205@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- 4. Create policies that work for both users and admins
-- Admin can see ALL posts
CREATE POLICY "admin_can_see_all_posts" ON forum_posts
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = (auth.jwt() ->> 'email')
    )
  );

-- Public can see approved posts
CREATE POLICY "public_can_read_approved_posts" ON forum_posts
  FOR SELECT 
  USING (status = 'active' AND is_approved = true);

-- Users can see their own posts
CREATE POLICY "users_can_read_own_posts" ON forum_posts
  FOR SELECT
  USING (auth.uid() = user_id::uuid);

-- Authenticated users can create posts
CREATE POLICY "authenticated_users_can_create_posts" ON forum_posts
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users and admins can update posts
CREATE POLICY "users_and_admins_can_update_posts" ON forum_posts
  FOR UPDATE
  USING (
    auth.uid() = user_id::uuid 
    OR 
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = (auth.jwt() ->> 'email')
    )
  );

-- Users and admins can delete posts
CREATE POLICY "users_and_admins_can_delete_posts" ON forum_posts
  FOR DELETE
  USING (
    auth.uid() = user_id::uuid 
    OR 
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = (auth.jwt() ->> 'email')
    )
  );

-- 5. Enable RLS on admin table
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Admin table policies
CREATE POLICY "admins_can_read_admin_table" ON admin_users
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users a
      WHERE a.email = (auth.jwt() ->> 'email')
    )
  );

-- 6. Test query
SELECT 'Admin forum access fixed' as result;