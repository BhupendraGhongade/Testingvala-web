-- CORRECT RATE LIMIT FIX
-- The audit_log_entries table has different column names

-- Check the actual table structure first
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'audit_log_entries' 
AND table_schema = 'auth';

-- Clear rate limit entries with correct column names
DELETE FROM auth.audit_log_entries 
WHERE payload->>'event_type' = 'email_rate_limit_exceeded' 
AND created_at > NOW() - INTERVAL '2 hours';

-- Also clear general email entries
DELETE FROM auth.audit_log_entries 
WHERE payload->>'event_type' LIKE '%email%'
AND created_at > NOW() - INTERVAL '2 hours';

-- Check what's left
SELECT 
    payload->>'event_type' as event_type,
    COUNT(*) as count,
    MAX(created_at) as last_time
FROM auth.audit_log_entries 
WHERE created_at > NOW() - INTERVAL '2 hours'
GROUP BY payload->>'event_type';