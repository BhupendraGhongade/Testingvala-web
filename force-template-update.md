# FORCE Supabase Email Template Update

## Immediate Steps (Do in exact order):

### 1. Clear ALL Cache
```bash
# Clear browser completely
- Close ALL browser tabs
- Clear browser cache & cookies
- Restart browser
```

### 2. Force Template Reset
1. Go to Supabase Dashboard → Authentication → Settings → Email Templates
2. Select "Magic Link" 
3. **DELETE ALL content** (make it completely empty)
4. Click Save
5. **Wait 5 minutes**
6. Go back and paste new template
7. Save again

### 3. Test Template Update
Use this MINIMAL test template first:

```html
<!DOCTYPE html>
<html><body>
<h1>NEW TEMPLATE TEST - {{ .ConfirmationURL }}</h1>
<a href="{{ .ConfirmationURL }}">VERIFY NOW</a>
</body></html>
```

### 4. Force Supabase Refresh
Run in Supabase SQL Editor:
```sql
-- Force refresh auth settings
SELECT auth.refresh_email_templates();

-- Clear any cached templates
DELETE FROM auth.email_templates WHERE template_type = 'magic_link';
```

### 5. Test with DIFFERENT Email
- Use completely new email address
- NOT the same email you tested before
- Check spam folder

### 6. If Still Old Template
Your Supabase project might have template caching issues:
1. Create NEW Supabase project (temporary)
2. Set up email template there
3. Test if it works
4. If yes, migrate back to main project