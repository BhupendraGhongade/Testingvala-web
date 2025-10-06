# Supabase + ZeptoMail Magic Link Setup

## 1. Configure Supabase Auth Settings

Go to your Supabase Dashboard → Authentication → Settings:

### Email Templates
- Enable "Confirm signup" template
- Enable "Magic Link" template
- Set redirect URL: `https://your-domain.vercel.app/auth/callback`

### SMTP Settings
```
SMTP Host: smtp.zeptomail.in
SMTP Port: 587
SMTP User: emailapikey
SMTP Pass: YOUR_ZEPTO_API_KEY
From Email: noreply@testingvala.com
From Name: TestingVala
```

## 2. Environment Variables

Add to Vercel environment variables:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 3. Test Email Delivery

Use Supabase client instead of custom API:
```javascript
await supabase.auth.signInWithOtp({ email: 'user@example.com' })
```