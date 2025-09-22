# ZeptoMail Configuration Guide

## Step 1: ZeptoMail Account Setup

1. **Create ZeptoMail Account**
   - Go to https://www.zoho.com/zeptomail/
   - Sign up for free account (10,000 emails/month)
   - Verify your account

2. **Domain Verification**
   - Add your domain: `testingvala.com`
   - Add these DNS records to your domain:

   ```
   TXT Record:
   Name: @
   Value: zoho-verification=zeptomail.your_verification_code

   CNAME Record:
   Name: zeptomail._domainkey
   Value: zeptomail.zoho.com

   TXT Record:
   Name: _dmarc
   Value: v=DMARC1; p=none; rua=mailto:dmarc@testingvala.com
   ```

3. **Get API Credentials**
   - Go to Settings > API Keys
   - Create new API key
   - Copy the API key (starts with `Zoho-enczapikey`)

## Step 2: Environment Variables

Add to your `.env` file:

```env
# ZeptoMail Configuration
ZEPTO_API_KEY=your_zeptomail_api_key_here
ZEPTO_FROM_EMAIL=info@testingvala.com
ZEPTO_FROM_NAME=TestingVala

# Supabase Configuration (existing)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 3: Vercel Environment Variables

In your Vercel dashboard:
1. Go to Project Settings > Environment Variables
2. Add these variables:
   - `ZEPTO_API_KEY` = your_zeptomail_api_key
   - `ZEPTO_FROM_EMAIL` = info@testingvala.com
   - `ZEPTO_FROM_NAME` = TestingVala

## Step 4: DNS Configuration

Add these records to your domain DNS:

```
Type: TXT
Name: @
Value: v=spf1 include:zeptomail.zoho.com ~all

Type: CNAME  
Name: zeptomail._domainkey
Value: zeptomail.zoho.com

Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@testingvala.com
```

## Step 5: Template Setup

ZeptoMail templates will be created programmatically in the API code.

## Verification Steps

1. Domain verification in ZeptoMail dashboard should show ✅
2. SPF, DKIM, DMARC should all be verified
3. Test email sending through ZeptoMail dashboard
4. Check email deliverability with mail-tester.com