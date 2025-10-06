-- Fix Supabase function parameter error
DROP FUNCTION IF EXISTS verify_magic_link_token(text,text);
DROP FUNCTION IF EXISTS generate_magic_link_token(text);
DROP FUNCTION IF EXISTS cleanup_expired_magic_links();

-- Create magic link token generation function
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
    token_value := encode(gen_random_bytes(32), 'base64url');
    expires_at := NOW() + INTERVAL '24 hours';
    
    CREATE TABLE IF NOT EXISTS auth.magic_links (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    DELETE FROM auth.magic_links WHERE email = user_email;
    INSERT INTO auth.magic_links (email, token, expires_at)
    VALUES (user_email, token_value, expires_at);
    
    result := json_build_object(
        'success', true,
        'token', token_value,
        'expires_at', expires_at,
        'email', user_email
    );
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    result := json_build_object(
        'success', false,
        'error', SQLERRM,
        'email', user_email
    );
    RETURN result;
END;
$$;

-- Create token verification function
CREATE OR REPLACE FUNCTION verify_magic_link_token(token_value TEXT, user_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    token_record RECORD;
    result JSON;
BEGIN
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
    
    UPDATE auth.magic_links 
    SET used = TRUE
    WHERE id = token_record.id;
    
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION generate_magic_link_token(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION verify_magic_link_token(TEXT, TEXT) TO anon, authenticated, service_role;