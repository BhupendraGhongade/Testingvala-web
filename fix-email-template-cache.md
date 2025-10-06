# Fix Supabase Email Template Cache Issue

## Problem
Updated email template in Supabase but still receiving old template emails.

## Solutions (Try in order)

### 1. Clear Browser Cache & Force Refresh
- Clear browser cache completely
- Hard refresh Supabase dashboard (Ctrl+Shift+R / Cmd+Shift+R)
- Try incognito/private browsing mode

### 2. Template Update Process
1. Go to Supabase Dashboard → Authentication → Settings → Email Templates
2. Select "Magic Link" template
3. **IMPORTANT**: Make a small change first (add a space), then save
4. Wait 2-3 minutes
5. Then paste your actual template and save again

### 3. Force Template Refresh
```sql
-- Run this in Supabase SQL Editor to force refresh
SELECT auth.refresh_email_templates();
```

### 4. Check Template Variables
Ensure you're using correct Supabase variables:
- `{{ .ConfirmationURL }}` (correct)
- NOT `{{.ConfirmationURL}}` (incorrect - missing spaces)

### 5. Test with Different Email
- Try with a completely new email address
- Old emails might be cached per user

### 6. Verify SMTP Settings
1. Go to Authentication → Settings → SMTP Settings
2. Ensure "Enable custom SMTP" is checked
3. Test email delivery

### 7. Template Size Limit
- Supabase has a template size limit (~64KB)
- Your current template might be too large
- Try with a smaller template first

## Quick Test Template
Use this minimal template to test if updates work:

```html
<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
<h1>TEST TEMPLATE - {{ .ConfirmationURL }}</h1>
<p>If you see this, template updates are working!</p>
<a href="{{ .ConfirmationURL }}">Verify</a>
</body>
</html>
```

## If Nothing Works
1. Create a new Supabase project (test)
2. Set up email templates there
3. Compare configurations