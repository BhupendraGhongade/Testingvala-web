-- COMPLETE EMAIL SYSTEM FIX
-- Run this in Supabase SQL Editor

-- 1. Remove ALL existing email triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS send_magic_link_webhook();
DROP FUNCTION IF EXISTS handle_new_user();

-- 2. Check and remove any other auth-related triggers
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT trigger_name, event_object_table 
             FROM information_schema.triggers 
             WHERE event_object_table = 'users' 
             AND trigger_schema = 'auth'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || r.trigger_name || ' ON auth.users';
    END LOOP;
END $$;

-- 3. Ensure users table exists with proper structure
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    company TEXT,
    role TEXT,
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create simple user creation function (no email sending)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, is_verified, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN true ELSE false END,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        is_verified = CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN true ELSE false END,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create trigger for user creation (no email sending)
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view basic user info" ON public.users;

CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view basic user info" ON public.users
    FOR SELECT USING (auth.role() = 'authenticated');

-- 8. Verification check
SELECT 
    'CLEANUP_COMPLETE' as status,
    'Now configure SMTP in Supabase Dashboard' as next_step;