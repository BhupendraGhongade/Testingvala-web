-- PRODUCTION EMAIL SYSTEM FIX
-- Run this in Supabase SQL Editor to fix magic link issues

-- 1. Create magic link token generation function
CREATE OR REPLACE FUNCTION generate_magic_link_token(user_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    token_value TEXT;
    expires_at TIMESTAMP WITH TIME ZONE;
    result JSON;
BEGIN
    -- Generate secure token
    token_value := encode(gen_random_bytes(32), 'base64url');
    expires_at := NOW() + INTERVAL '24 hours';
    
    -- Store token in auth.magic_links table (create if not exists)
    CREATE TABLE IF NOT EXISTS auth.magic_links (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Insert new token (replace existing if any)
    DELETE FROM auth.magic_links WHERE email = user_email;
    
    INSERT INTO auth.magic_links (email, token, expires_at)
    VALUES (user_email, token_value, expires_at);
    
    -- Return success response
    result := json_build_object(
        'success', true,
        'token', token_value,
        'expires_at', expires_at,
        'email', user_email
    );
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    -- Return error response
    result := json_build_object(
        'success', false,
        'error', SQLERRM,
        'email', user_email
    );
    
    RETURN result;
END;
$$;

-- 2. Create token verification function
CREATE OR REPLACE FUNCTION verify_magic_link_token(token_value TEXT, user_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    token_record RECORD;
    result JSON;
BEGIN
    -- Find valid token
    SELECT * INTO token_record
    FROM auth.magic_links
    WHERE token = token_value 
    AND email = user_email
    AND expires_at > NOW()
    AND used = FALSE;
    
    IF NOT FOUND THEN
        result := json_build_object(
            'success', false,
            'error', 'Invalid or expired token'
        );
        RETURN result;
    END IF;
    
    -- Mark token as used
    UPDATE auth.magic_links 
    SET used = TRUE, updated_at = NOW()
    WHERE id = token_record.id;
    
    -- Return success
    result := json_build_object(
        'success', true,
        'email', user_email,
        'verified_at', NOW()
    );
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    result := json_build_object(
        'success', false,
        'error', SQLERRM
    );
    
    RETURN result;
END;
$$;

-- 3. Create cleanup function for expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_magic_links()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM auth.magic_links 
    WHERE expires_at < NOW() - INTERVAL '1 day';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- 4. Set up RLS policies for magic_links table
ALTER TABLE auth.magic_links ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage all tokens
CREATE POLICY "Service role can manage magic links" ON auth.magic_links
    FOR ALL USING (auth.role() = 'service_role');

-- 5. Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO anon, authenticated;
GRANT EXECUTE ON FUNCTION generate_magic_link_token(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION verify_magic_link_token(TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION cleanup_expired_magic_links() TO service_role;

-- 6. Create index for performance
CREATE INDEX IF NOT EXISTS idx_magic_links_token ON auth.magic_links(token);
CREATE INDEX IF NOT EXISTS idx_magic_links_email ON auth.magic_links(email);
CREATE INDEX IF NOT EXISTS idx_magic_links_expires ON auth.magic_links(expires_at);

-- 7. Test the functions
DO $$
DECLARE
    test_result JSON;
BEGIN
    -- Test token generation
    SELECT generate_magic_link_token('test@example.com') INTO test_result;
    
    IF (test_result->>'success')::BOOLEAN THEN
        RAISE NOTICE 'SUCCESS: Magic link token generation working';
        RAISE NOTICE 'Token: %', test_result->>'token';
    ELSE
        RAISE NOTICE 'ERROR: Token generation failed - %', test_result->>'error';
    END IF;
    
    -- Cleanup test data
    DELETE FROM auth.magic_links WHERE email = 'test@example.com';
END;
$$;

-- 8. Create scheduled cleanup (optional - run manually or via cron)
-- This will clean up expired tokens daily
-- You can set this up in Supabase Dashboard > Database > Cron Jobs
/*
SELECT cron.schedule(
    'cleanup-expired-magic-links',
    '0 2 * * *', -- Run at 2 AM daily
    'SELECT cleanup_expired_magic_links();'
);
*/

COMMIT;