-- Disable Supabase SMTP and configure for token generation only
-- Run these commands in your Supabase SQL Editor

-- 1. Skip auth.config (handled in dashboard settings)
-- Go to Authentication > Settings in Supabase dashboard and:
-- - Enable email confirmations: OFF
-- - Enable email change confirmations: OFF

-- 2. Create custom auth functions for token generation
CREATE OR REPLACE FUNCTION generate_magic_link_token(user_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  token_data json;
  user_id uuid;
  token_hash text;
  expires_at timestamp with time zone;
BEGIN
  -- Generate secure token
  token_hash := encode(gen_random_bytes(32), 'hex');
  expires_at := now() + interval '24 hours';
  
  -- Get or create user
  SELECT id INTO user_id FROM auth.users WHERE email = user_email;
  
  IF user_id IS NULL THEN
    -- Create new user without email confirmation
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      user_email,
      crypt('', gen_salt('bf')),
      now(), -- Auto-confirm email
      now(),
      now(),
      token_hash,
      '',
      '',
      ''
    ) RETURNING id INTO user_id;
  ELSE
    -- Update existing user with new token
    UPDATE auth.users 
    SET 
      confirmation_token = token_hash,
      confirmation_sent_at = now(),
      updated_at = now()
    WHERE id = user_id;
  END IF;
  
  -- Store token in custom table for verification
  INSERT INTO magic_link_tokens (
    user_id,
    email,
    token_hash,
    expires_at,
    created_at
  ) VALUES (
    user_id,
    user_email,
    token_hash,
    expires_at,
    now()
  ) ON CONFLICT (email) DO UPDATE SET
    token_hash = EXCLUDED.token_hash,
    expires_at = EXCLUDED.expires_at,
    created_at = EXCLUDED.created_at,
    used_at = NULL;
  
  RETURN json_build_object(
    'token', token_hash,
    'expires_at', expires_at,
    'user_id', user_id,
    'email', user_email
  );
END;
$$;

-- 3. Create magic link tokens table
CREATE TABLE IF NOT EXISTS magic_link_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  token_hash text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  used_at timestamp with time zone,
  ip_address inet,
  user_agent text,
  UNIQUE(email)
);

-- 4. Create token verification function
CREATE OR REPLACE FUNCTION verify_magic_link_token(token text, user_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  token_record record;
  user_record record;
  jwt_token text;
BEGIN
  -- Find and validate token
  SELECT * INTO token_record 
  FROM magic_link_tokens 
  WHERE token_hash = token 
    AND email = user_email 
    AND expires_at > now() 
    AND used_at IS NULL;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid or expired token'
    );
  END IF;
  
  -- Mark token as used
  UPDATE magic_link_tokens 
  SET used_at = now() 
  WHERE id = token_record.id;
  
  -- Get user record
  SELECT * INTO user_record FROM auth.users WHERE id = token_record.user_id;
  
  -- Confirm user email if not already confirmed
  UPDATE auth.users 
  SET 
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now()
  WHERE id = token_record.user_id;
  
  -- Generate JWT token (simplified - in production use proper JWT)
  jwt_token := encode(
    json_build_object(
      'sub', user_record.id,
      'email', user_record.email,
      'iat', extract(epoch from now()),
      'exp', extract(epoch from now() + interval '30 days')
    )::text::bytea,
    'base64'
  );
  
  RETURN json_build_object(
    'success', true,
    'user', json_build_object(
      'id', user_record.id,
      'email', user_record.email,
      'email_confirmed_at', user_record.email_confirmed_at
    ),
    'access_token', jwt_token,
    'token_type', 'bearer',
    'expires_in', 2592000
  );
END;
$$;

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_magic_link_tokens_email ON magic_link_tokens(email);
CREATE INDEX IF NOT EXISTS idx_magic_link_tokens_token ON magic_link_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_magic_link_tokens_expires ON magic_link_tokens(expires_at);

-- 6. Enable RLS
ALTER TABLE magic_link_tokens ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies
CREATE POLICY "Users can view their own tokens" ON magic_link_tokens
  FOR SELECT USING (auth.email() = email);

-- 8. Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON magic_link_tokens TO anon, authenticated;
GRANT EXECUTE ON FUNCTION generate_magic_link_token(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION verify_magic_link_token(text, text) TO anon, authenticated;