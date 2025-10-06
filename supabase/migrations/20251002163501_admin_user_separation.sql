-- Admin/User Table Separation Migration
-- This ensures clean separation between admin and user data

-- Create admin schema for admin-only tables
CREATE SCHEMA IF NOT EXISTS admin;

-- Tables are already created in admin schema in first migration

-- Ensure proper RLS policies
ALTER TABLE IF EXISTS admin.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin.payment_config ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies (only if tables exist)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'admin' AND table_name = 'admin_sessions') THEN
        DROP POLICY IF EXISTS "Admin only access" ON admin.admin_sessions;
        CREATE POLICY "Admin only access" ON admin.admin_sessions FOR ALL USING (false);
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'admin' AND table_name = 'payment_config') THEN
        DROP POLICY IF EXISTS "Admin only payment config" ON admin.payment_config;
        CREATE POLICY "Admin only payment config" ON admin.payment_config FOR ALL USING (false);
    END IF;
END $$;

-- User tables remain in public schema with proper RLS
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contest_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.forum_posts ENABLE ROW LEVEL SECURITY;

-- User policies (only if tables exist)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        DROP POLICY IF EXISTS "Users can view own data" ON public.users;
        DROP POLICY IF EXISTS "Users can update own data" ON public.users;
        CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid() = id);
        CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;
