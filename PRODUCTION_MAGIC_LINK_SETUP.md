# Production Magic Link Authentication Setup

## Overview
This guide will help you deploy a fully working Magic Link authentication system using:
- **Supabase** for token generation and user management
- **ZeptoMail** for reliable email delivery
- **Vercel** for serverless API hosting

## Step 1: Supabase Setup

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned
3. Go to Settings > API to get your credentials

### 1.2 Run Database Setup
1. Go to SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `supabase-auth-config.sql`
3. Click "Run" to execute the setup script
4. Verify tables were created in Table Editor

### 1.3 Configure Authentication
1. Go to Authentication > Settings
2. Set these configurations:
   ```
   Enable email confirmations: OFF (we handle this manually)
   Enable email change confirmations: OFF
   Enable phone confirmations: OFF
   ```

## Step 2: ZeptoMail Setup

### 2.1 Create ZeptoMail Account
1. Sign up at [zeptomail.zoho.com](https://www.zoho.com/zeptomail/)
2. Verify your account via email
3. Choose the free plan (10,000 emails/month)

### 2.2 Domain Verification
1. Add your domain: `testingvala.com`
2. Add these DNS records to your domain provider:

```dns
# SPF Record
Type: TXT
Name: @
Value: v=spf1 include:zeptomail.zoho.com ~all

# DKIM Record  
Type: CNAME
Name: zeptomail._domainkey
Value: zeptomail.zoho.com

# DMARC Record
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@testingvala.com

# Domain Verification
Type: TXT
Name: @
Value: zoho-verification=zeptomail.your_verification_code_here
```

### 2.3 Get API Credentials
1. Go to Settings > API Keys in ZeptoMail dashboard
2. Create a new API key
3. Copy the API key (format: `Zoho-enczapikey ...`)

## Step 3: Environment Variables

### 3.1 Local Development (.env)
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# ZeptoMail Configuration
ZEPTO_API_KEY=Zoho-enczapikey_your_api_key_here
ZEPTO_FROM_EMAIL=info@testingvala.com
ZEPTO_FROM_NAME=TestingVala

# Environment
NODE_ENV=development
```

### 3.2 Vercel Production Environment
1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add these variables:

```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
ZEPTO_API_KEY = Zoho-enczapikey_your_api_key_here
ZEPTO_FROM_EMAIL = info@testingvala.com
ZEPTO_FROM_NAME = TestingVala
NODE_ENV = production
```

## Step 4: Code Deployment

### 4.1 Update API Endpoint
Replace your current magic link API with the enhanced version:
```bash
# Rename current file as backup
mv api/send-magic-link.js api/send-magic-link-backup.js

# Use the enhanced version
mv api/send-magic-link-enhanced.js api/send-magic-link.js
```

### 4.2 Deploy to Vercel
```bash
# Install dependencies
npm install @supabase/supabase-js

# Deploy to Vercel
vercel --prod
```

## Step 5: Testing & Verification

### 5.1 Run Test Suite
```bash
# Install test dependencies
npm install node-fetch

# Set test environment variables
export TEST_EMAIL=your-test-email@gmail.com
export TEST_BASE_URL=https://your-app.vercel.app

# Run comprehensive tests
node test-magic-link-system.js
```

### 5.2 Manual Testing
1. **Test Magic Link Generation**:
   ```bash
   curl -X POST https://your-app.vercel.app/api/send-magic-link \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","deviceId":"test123"}'
   ```

2. **Check Email Delivery**:
   - Check your inbox (and spam folder)
   - Verify email formatting and branding
   - Test magic link click functionality

3. **Test Token Verification**:
   - Click the magic link from email
   - Verify successful authentication
   - Check browser console for any errors

## Step 6: Production Monitoring

### 6.1 Supabase Monitoring
1. Monitor database usage in Supabase dashboard
2. Check API usage and rate limits
3. Review authentication logs

### 6.2 ZeptoMail Monitoring
1. Monitor email delivery rates
2. Check bounce and spam rates
3. Review sending reputation

### 6.3 Vercel Monitoring
1. Monitor function execution times
2. Check error rates and logs
3. Monitor bandwidth usage

## Step 7: Security Considerations

### 7.1 Rate Limiting
- Current: 5 requests per hour per email/device
- Adjust `MAX_REQUESTS` in API code if needed
- Consider implementing IP-based rate limiting

### 7.2 Token Security
- Tokens expire after 24 hours
- Tokens are single-use only
- Tokens are cryptographically secure (64 hex characters)

### 7.3 Email Security
- SPF, DKIM, DMARC configured
- HTTPS-only magic links
- No sensitive data in email content

## Step 8: Troubleshooting

### Common Issues

**1. "Email service not configured" error**
- Check ZEPTO_API_KEY environment variable
- Verify API key format starts with "Zoho-enczapikey"

**2. "Token generation failed" error**
- Check Supabase connection
- Verify SQL functions were created
- Check database permissions

**3. Emails not being delivered**
- Verify domain DNS records
- Check ZeptoMail domain verification status
- Review ZeptoMail sending logs

**4. Magic links not working**
- Check token format (should be 64 hex characters)
- Verify token hasn't expired
- Check browser console for JavaScript errors

### Debug Commands

```bash
# Test Supabase connection
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
supabase.from('magic_link_tokens').select('count').then(console.log);
"

# Test ZeptoMail API
curl -X POST https://api.zeptomail.in/v1.1/email \
  -H "Authorization: $ZEPTO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":{"address":"info@testingvala.com"},"to":[{"email_address":{"address":"test@example.com"}}],"subject":"Test","htmlbody":"<p>Test</p>"}'
```

## Step 9: Performance Optimization

### 9.1 Database Optimization
- Index on email and token fields (already included)
- Regular cleanup of expired tokens
- Connection pooling for high traffic

### 9.2 Email Optimization
- Template caching
- Batch sending for multiple users
- A/B testing for email content

### 9.3 API Optimization
- Response caching where appropriate
- Compression for large responses
- CDN for static assets

## Success Criteria

✅ **Environment Setup**: All environment variables configured  
✅ **Database Setup**: Supabase tables and functions created  
✅ **Email Setup**: ZeptoMail domain verified and API working  
✅ **API Testing**: Magic link generation and verification working  
✅ **Email Delivery**: Real emails being delivered to inbox  
✅ **Authentication Flow**: Complete user authentication working  
✅ **Error Handling**: Graceful error handling and user feedback  
✅ **Security**: Rate limiting and token security implemented  

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Run the test suite for detailed diagnostics
3. Review Vercel function logs
4. Check Supabase and ZeptoMail dashboards for errors

Your Magic Link authentication system is now ready for production! 🚀