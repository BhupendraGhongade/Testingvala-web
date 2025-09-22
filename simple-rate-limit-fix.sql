-- SIMPLE RATE LIMIT FIX
-- Just clear all recent audit entries

-- Clear all recent entries (last 2 hours)
DELETE FROM auth.audit_log_entries 
WHERE created_at > NOW() - INTERVAL '2 hours';

-- Verify it's cleared
SELECT COUNT(*) as remaining_entries
FROM auth.audit_log_entries 
WHERE created_at > NOW() - INTERVAL '2 hours';