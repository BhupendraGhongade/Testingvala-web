# Magic Link Setup Guide for TestingVala

## Issue Fixed
- Magic link emails now send from `info@testingvala.com` instead of Supabase default
- Better error handling for magic link failures
- Proper auth callback handling

## Required Steps

### 1. Configure SMTP in Supabase Dashboard

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/qxsardezvxsquvejvsso
2. Navigate to **Authentication** → **Settings** → **SMTP Settings**
3. Enable custom SMTP and configure:

```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: info@testingvala.com
SMTP Pass: [Generate App Password from Google Account]
Sender Name: TestingVala Community
Sender Email: info@testingvala.com
```

### 2. Generate Gmail App Password

1. Go to Google Account Settings: https://myaccount.google.com/
2. Security → 2-Step Verification → App passwords
3. Generate password for "TestingVala SMTP"
4. Use this password in Supabase SMTP settings

### 3. Run Database Setup

Execute the SQL in `supabase-email-config.sql` in your Supabase SQL Editor.

### 4. Test Magic Link

1. Try signing in with magic link
2. Check email from `info@testingvala.com`
3. Verify auth callback works at `/auth/callback`

## Files Modified

- `src/components/AuthModal.jsx` - Better error handling
- `src/components/AuthCallback.jsx` - New auth callback handler
- `src/contexts/AuthContext.jsx` - Improved session management
- `src/App.jsx` - Added auth callback route
- `supabase-email-config.sql` - Database configuration

## Testing

1. Click "Send Magic Link" in auth modal
2. Should receive email from `info@testingvala.com`
3. Click link → redirects to `/auth/callback` → signs in successfully
4. No more "unexpected_failure" errors

## Troubleshooting

- **Still getting Supabase emails?** Check SMTP settings are saved and enabled
- **Gmail not working?** Ensure 2FA enabled and app password generated
- **Auth callback fails?** Check browser console for errors
- **Database errors?** Run the SQL setup script again