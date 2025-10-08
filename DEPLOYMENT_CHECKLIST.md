# 🚀 Security Deployment Checklist

## 🚨 CRITICAL - Before Deployment

### 1. **Remove Hardcoded Secrets**
- [ ] Run: `grep -r "eyJ\|sk_\|pk_" --include="*.js" --include="*.jsx" src/`
- [ ] Verify no hardcoded credentials in: `test-supabase-auth.js`, `check_posts.js`
- [ ] All secrets moved to environment variables

### 2. **Rotate API Keys** (MANDATORY)
- [ ] Generate new Supabase anon key
- [ ] Generate new Supabase service role key  
- [ ] Generate new ZeptoMail API key
- [ ] Update all environment variables

## 📋 Environment Variables Setup

### Vercel Environment Variables
```bash
# Client-side (VITE_ prefix)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...new_anon_key
VITE_APP_ENV=production
VITE_MAX_REQUESTS=3
VITE_RATE_LIMIT_WINDOW=3600000
VITE_SESSION_DURATION=2592000000

# Server-side (NO VITE_ prefix)
SUPABASE_SERVICE_ROLE_KEY=eyJ...new_service_key
ZEPTO_API_KEY=your_new_zepto_key
ZEPTO_FROM_EMAIL=info@testingvala.com
ZEPTO_FROM_NAME=TestingVala
```

### Docker Environment Variables
```bash
# Add to docker-compose.yml or .env.docker
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=local_development_key
SUPABASE_SERVICE_ROLE_KEY=local_service_key
```

## 🧪 Pre-Deployment Testing

### Security Tests
- [ ] XSS Prevention: Test with `<script>alert('xss')</script>`
- [ ] CSRF Protection: Verify requests without tokens fail
- [ ] Input Validation: Test with malicious payloads
- [ ] Rate Limiting: Test magic link rate limits
- [ ] SQL Injection: Test with `'; DROP TABLE users; --`

### Performance Tests  
- [ ] React DevTools: Check for unnecessary re-renders
- [ ] Lighthouse: Performance score > 90
- [ ] Bundle size: Check for bloat

### Functional Tests
- [ ] User registration flow
- [ ] Magic link authentication  
- [ ] Post creation and editing
- [ ] Admin panel access
- [ ] Board functionality
- [ ] Email sending (ZeptoMail)

## 🔒 Security Headers Verification

### Check Response Headers
```bash
curl -I https://your-domain.com
```

Expected headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## 📊 Monitoring Setup

### Error Tracking
- [ ] Console errors monitored
- [ ] Failed authentication attempts logged
- [ ] Rate limit violations tracked
- [ ] CSRF failures recorded

### Performance Monitoring
- [ ] Core Web Vitals tracking
- [ ] API response times
- [ ] Database query performance
- [ ] Bundle size monitoring

## 🔄 Rollback Plan

### If Issues Occur:
1. **Immediate Rollback**
   ```bash
   git revert <commit-hash>
   vercel --prod
   ```

2. **Environment Cleanup**
   - Remove new environment variables
   - Restore previous API keys
   - Clear any cached data

3. **Database Rollback**
   - No destructive migrations applied
   - Data remains intact
   - RLS policies can be reverted

## ✅ Post-Deployment Verification

### Production Health Checks
- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] Magic link emails sent
- [ ] Admin panel accessible
- [ ] API endpoints respond correctly
- [ ] No console errors
- [ ] Security headers present

### Performance Verification
- [ ] Page load times < 3s
- [ ] No memory leaks
- [ ] Proper caching headers
- [ ] CDN functioning

## 🚨 Emergency Contacts

### If Critical Issues:
1. **Immediate**: Rollback deployment
2. **Rotate Keys**: If credentials compromised
3. **Monitor**: Check error logs and user reports
4. **Document**: Record incident for post-mortem

## 📝 Sign-off Required

- [ ] **Developer**: Code reviewed and tested
- [ ] **QA**: All test cases pass
- [ ] **Security**: Vulnerability scan clean
- [ ] **DevOps**: Environment configured
- [ ] **Product**: UI/UX regression tested

**Deployment Approved By**: ________________
**Date**: ________________
**Environment**: ________________