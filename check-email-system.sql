-- Check all email-related triggers and functions
SELECT 
  'TRIGGERS' as type,
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name ILIKE '%email%' OR trigger_name ILIKE '%auth%' OR trigger_name ILIKE '%user%';

-- Check functions
SELECT 
  'FUNCTIONS' as type,
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_name ILIKE '%email%' OR routine_name ILIKE '%magic%' OR routine_name ILIKE '%webhook%';

-- Check auth hooks
SELECT 
  'AUTH_HOOKS' as type,
  hook_table_id,
  hook_name,
  created_at
FROM supabase_functions.hooks 
WHERE hook_name ILIKE '%email%' OR hook_name ILIKE '%auth%';

-- Check if webhook function exists
SELECT 
  'WEBHOOK_CHECK' as type,
  proname as function_name,
  prosrc as function_body
FROM pg_proc 
WHERE proname ILIKE '%webhook%' OR proname ILIKE '%magic%';