# QUICK FIX - Update Email Template

## The Issue
Your webhook system in `supabase-webhook.sql` is overriding Supabase email templates.

## SOLUTION 1: Remove Webhook System (Recommended)

Run this in Supabase SQL Editor:

```sql
-- Remove the webhook trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS send_magic_link_webhook();
```

Then:
1. Go to Supabase → Authentication → Settings → SMTP Settings
2. Configure ZeptoMail SMTP:
   - Host: smtp.zeptomail.in
   - Port: 587
   - Username: emailapikey
   - Password: [Your ZeptoMail password from .env]
   - Sender: info@testingvala.com

3. Now your email templates in dashboard will work!

## SOLUTION 2: Update Webhook Server Template

Update `email-service/server.js` line 25-35 with your new template HTML.

## Test After Fix
1. Clear browser cache
2. Try magic link with NEW email address
3. Check if new template appears