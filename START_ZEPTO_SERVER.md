# START ZEPTO EMAIL SERVER

## Step 1: Install Dependencies
```bash
npm install express nodemailer cors
```

## Step 2: Start ZeptoMail Server
```bash
node zepto-server.js
```

You should see:
```
🚀 ZeptoMail server running on http://localhost:3002
📧 Ready to send emails via ZeptoMail (no Supabase rate limits)
```

## Step 3: Start Your React App
In another terminal:
```bash
npm run dev
```

## Step 4: Test
- Go to http://localhost:5173
- Try the auth modal
- Emails will be sent via ZeptoMail directly (no Supabase rate limits)

## What's Changed:
- ✅ Supabase auth completely removed
- ✅ Direct ZeptoMail SMTP integration
- ✅ Your enterprise email template included
- ✅ No rate limits (100 emails/day from ZeptoMail)
- ✅ Custom token verification system

## Verification Flow:
1. User enters email → ZeptoMail sends magic link
2. User clicks link → Token verified
3. User logged in (stored in localStorage)

No Supabase involved at all!