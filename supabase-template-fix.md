# Supabase Template Cache Fix

## The function doesn't exist - try these instead:

### 1. Manual Cache Clear
1. Go to Supabase Dashboard
2. Settings → General → Reset Project Password
3. This forces a full auth refresh

### 2. Alternative SQL Commands
```sql
-- Clear auth audit logs (forces refresh)
DELETE FROM auth.audit_log_entries WHERE created_at < NOW() - INTERVAL '1 hour';

-- Or restart auth service
SELECT pg_reload_conf();
```

### 3. SMTP Settings Reset
1. Go to Authentication → Settings → SMTP Settings
2. Toggle "Enable custom SMTP" OFF
3. Save
4. Toggle it back ON
5. Save again
6. Then update email template

### 4. Project-Level Fix
If nothing works:
1. Export your database schema
2. Create new Supabase project
3. Import schema
4. Set up email templates in new project
5. Update your app's SUPABASE_URL

### 5. Contact Supabase Support
This might be a known caching issue. Contact them with:
- Project ID: qxsardezvxsquvejvsso
- Issue: Email templates not updating despite changes