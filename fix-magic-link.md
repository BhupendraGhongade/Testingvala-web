# Fix Magic Link Email Issue - ZeptoMail Integration

## Problem
Magic link emails are failing with error: `{"code":"unexpected_failure","message":"Error sending magic link email"}`

## Root Cause
Supabase is not configured to use your ZeptoMail SMTP settings.

## Solution Steps

### Step 1: Configure Supabase SMTP Settings

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/qxsardezvxsquvejvsso
2. Navigate to **Authentication** → **Settings** → **SMTP Settings**
3. Enable custom SMTP and configure:

```
SMTP Host: smtp.zeptomail.com
SMTP Port: 587
SMTP User: emailapikey
SMTP Pass: PHtE6r0EQL3t2jIn9kMJs/LpF5WnMt58+OhlfgQR5oZFD/dQGk1Wr40tkGKyrx8tUvVBR6HOy9pos7Oftr3RcWflZmgZDmqyqK3sx/VYSPOZsbq6x00Yslgcf0LdXITrcdRq3C3Rv93bNA==
Sender Name: TestingVala
Sender Email: info@testingvala.com
```

### Step 2: Test Email Service (Optional)

Start your email service to test if ZeptoMail credentials work:

```bash
cd email-service
npm start
```

Then test with curl:
```bash
curl -X POST http://localhost:3001/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test-email@example.com"}'
```

### Step 3: Verify Domain Authentication

1. In ZeptoMail dashboard, ensure `testingvala.com` domain is verified
2. Check SPF, DKIM, and DMARC records are properly configured

### Step 4: Update Supabase Auth Settings

1. In Supabase Dashboard → Authentication → Settings
2. Set **Site URL**: `https://testingvala.com` (or your production URL)
3. Add **Redirect URLs**: 
   - `https://testingvala.com/auth/callback`
   - `http://localhost:5173/auth/callback` (for development)

### Step 5: Test Magic Link

1. Try signing in with magic link
2. Check if email arrives from `info@testingvala.com`
3. Verify the link works and redirects properly

## Alternative: Use Supabase Built-in Email

If ZeptoMail continues to have issues, you can temporarily use Gmail:

1. Create an App Password for `info@testingvala.com`
2. Configure in Supabase SMTP:
   - Host: `smtp.gmail.com`
   - Port: `587`
   - User: `info@testingvala.com`
   - Pass: `[Gmail App Password]`

## Troubleshooting

- **Still getting errors?** Check Supabase logs in Dashboard → Logs
- **Emails not arriving?** Check spam folder and domain verification
- **Wrong sender?** Ensure SMTP settings are saved and enabled in Supabase