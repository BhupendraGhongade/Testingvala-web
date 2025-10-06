# SUPABASE SMTP CONFIGURATION

## Step 1: Run SQL Cleanup
Run `complete-email-fix.sql` in Supabase SQL Editor first.

## Step 2: Configure SMTP Settings
Go to Supabase Dashboard → Authentication → Settings → SMTP Settings

### ZeptoMail SMTP Configuration:
```
Enable custom SMTP: ✅ ON

SMTP Host: smtp.zeptomail.in
SMTP Port: 587
SMTP User: emailapikey
SMTP Pass: PHtE6r0IE7i/iDJ+oxED56e7Ec6lMN4nrL5gLwUVuY8XAqRRGU1Wr98pwWTiokx+AKFBQPPNwNo6se+bsOmGLG68PWlPCWqyqK3sx/VYSPOZsbq6x00Yt1UbckzVUYLtd9Zu1STUvdbSNA==

Sender Name: TestingVala
Sender Email: info@testingvala.com

Enable Confirmations: ✅ ON
Secure Email Change: ✅ ON
```

## Step 3: Test Email Template
1. Go to Authentication → Settings → Email Templates
2. Select "Magic Link"
3. Paste your new template
4. Save
5. Test with NEW email address

## Step 4: Verify Configuration
Test magic link with a fresh email address that hasn't been used before.