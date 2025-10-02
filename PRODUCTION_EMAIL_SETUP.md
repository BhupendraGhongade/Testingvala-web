# Production Email Setup Guide

## 1. Supabase Dashboard Configuration

### Go to: Dashboard → Authentication → Settings

**Email Templates:**
- Enable "Magic Link" template
- Customize subject: "Sign in to TestingVala"
- Set redirect URL: `https://your-domain.vercel.app/auth/callback`

**SMTP Settings:**
```
Enable custom SMTP: ON
SMTP Host: smtp.zeptomail.in
SMTP Port: 587
SMTP Username: emailapikey
SMTP Password: YOUR_ZEPTO_API_KEY
Sender Email: noreply@testingvala.com
Sender Name: TestingVala
```

## 2. ZeptoMail Setup

1. Go to ZeptoMail dashboard
2. Get your API key from Settings
3. Verify your domain (testingvala.com)
4. Add SPF/DKIM records to DNS

## 3. Vercel Environment Variables

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 4. Test Production Emails

```javascript
// Test in browser console
import { supabase } from './lib/supabase';
await supabase.auth.signInWithOtp({ email: 'your-email@domain.com' });
```

## 5. Debugging Steps

1. Check Supabase logs: Dashboard → Logs
2. Verify SMTP connection in Supabase
3. Check ZeptoMail delivery logs
4. Test with different email providers (Gmail, Outlook)
5. Check spam folders

## 6. Free Tier Limits

- Supabase: 50,000 monthly active users
- ZeptoMail: 10,000 emails/month
- Vercel: Unlimited static deployments