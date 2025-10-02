# Complete Setup Guide - ZeptoMail Integration

## IMMEDIATE STEPS TO COMPLETE:

### 1. Get ZeptoMail Credentials (5 minutes)
1. Go to https://www.zoho.com/zeptomail/
2. Sign up with your email
3. Verify your domain `testingvala.com`
4. Go to Mail Agents → SMTP
5. Create SMTP user, get credentials

### 2. Update Environment Variables
Edit `email-service/.env`:
```
SMTP_USER=your_actual_zeptomail_username
SMTP_PASS=your_actual_zeptomail_password
```

### 3. Test Email Service
```bash
cd email-service
node test-server.js
```

### 4. Test Email Sending
Open new terminal:
```bash
curl -X POST http://localhost:3001/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@gmail.com"}'
```

### 5. Setup Supabase Webhook
1. Go to Supabase Dashboard → SQL Editor
2. Run this SQL:
```sql
CREATE EXTENSION IF NOT EXISTS http;

CREATE OR REPLACE FUNCTION send_magic_link_webhook()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'http://localhost:3001/send-magic-link',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := json_build_object(
      'email', NEW.email,
      'magic_link', 'https://qxsardezvxsquvejvsso.supabase.co/auth/v1/verify?token=' || NEW.confirmation_token || '&type=signup&redirect_to=http://localhost:5173'
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION send_magic_link_webhook();
```

### 6. Disable Supabase Default Emails
1. Go to Authentication → Settings
2. Under Email Templates, disable "Enable email confirmations"

### 7. Test Complete Flow
1. Start email service: `node test-server.js`
2. Start your React app: `npm run dev`
3. Try signing up with new email
4. Check if magic link email arrives

## DNS Setup (For Production)
Add these DNS records to `testingvala.com`:
- SPF: `v=spf1 include:zeptomail.zoho.com ~all`
- DKIM: (Get from ZeptoMail dashboard)
- DMARC: `v=DMARC1; p=quarantine;`

## Production Deployment
Deploy email service to Railway/Render and update webhook URL in Supabase function.