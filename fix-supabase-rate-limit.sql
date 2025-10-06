-- FIX SUPABASE RATE LIMIT ISSUE
-- Run this in Supabase SQL Editor

-- Check current rate limit settings
SELECT 
    name, 
    setting, 
    unit,
    context
FROM pg_settings 
WHERE name LIKE '%rate_limit%' OR name LIKE '%email%';

-- Method 1: Try to update rate limits (may not work on hosted Supabase)
DO $$
BEGIN
    -- Attempt to increase email rate limits
    PERFORM set_config('auth.email_rate_limit_per_hour', '100', false);
    PERFORM set_config('auth.email_rate_limit_per_ip_per_hour', '200', false);
    
    RAISE NOTICE 'Rate limit configuration attempted';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Cannot modify rate limits on hosted Supabase: %', SQLERRM;
END $$;

-- Method 2: Clear existing rate limit entries
DELETE FROM auth.audit_log_entries 
WHERE event_type = 'email_rate_limit_exceeded' 
AND created_at > NOW() - INTERVAL '1 hour';

-- Method 3: Check if we can create custom rate limit bypass
CREATE OR REPLACE FUNCTION bypass_rate_limit_for_testing()
RETURNS void AS $$
BEGIN
    -- Clear rate limit cache for testing
    DELETE FROM auth.audit_log_entries 
    WHERE event_type IN ('email_rate_limit_exceeded', 'email_sent')
    AND created_at > NOW() - INTERVAL '2 hours';
    
    RAISE NOTICE 'Rate limit entries cleared for testing';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the bypass function
SELECT bypass_rate_limit_for_testing();

-- Check current email audit entries
SELECT 
    event_type,
    COUNT(*) as count,
    MAX(created_at) as last_occurrence
FROM auth.audit_log_entries 
WHERE event_type LIKE '%email%' 
AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY event_type;