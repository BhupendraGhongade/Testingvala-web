# Magic Link Email Not Arriving - Solutions

## ✅ What's Working
- ZeptoMail SMTP connection: ✅
- Test email delivery: ✅ 
- Supabase auth API: ✅

## 🔧 Issues to Fix

### Fix 1: Verify SMTP is Enabled in Supabase
1. Go to: https://supabase.com/dashboard/project/qxsardezvxsquvejvsso/settings/auth
2. Scroll to "SMTP Settings"
3. **Make sure "Enable custom SMTP" toggle is ON**
4. Verify all fields are filled:
   ```
   Host: smtp.zeptomail.in
   Port: 587
   Username: emailapikey
   Password: PHtE6r0EQL3t2jIn9kMJs/LpF5WnMt58+OhlfgQR5oZFD/dQGk1Wr40tkGKyrx8tUvVBR6HOy9pos7Oftr3RcWflZmgZDmqyqK3sx/VYSPOZsbq6x00Yslgcf0LdXITrcdRq3C3Rv93bNA==
   Sender name: TestingVala
   Sender email: info@testingvala.com
   ```
5. Click "Save" and wait 30 seconds

### Fix 2: Check Email Templates
1. Go to: Authentication → Settings → Email Templates
2. Click on "Magic Link" template
3. **Reset to default template** if customized
4. Or use this template:
   ```
   Subject: Sign in to {{ .SiteName }}
   
   <h2>Sign in to {{ .SiteName }}</h2>
   <p>Follow this link to sign in:</p>
   <p><a href="{{ .ConfirmationURL }}">Sign in</a></p>
   ```

### Fix 3: Domain Verification in ZeptoMail
1. In ZeptoMail dashboard, go to "Domains"
2. Ensure `testingvala.com` shows as "Verified"
3. If not verified, add these DNS records:
   - SPF: `v=spf1 include:zeptomail.com ~all`
   - DKIM: (provided by ZeptoMail)

### Fix 4: Check Site URL
1. Go to: Authentication → Settings → General
2. Set Site URL to: `http://localhost:5173` (for development)
3. Add Redirect URLs:
   - `http://localhost:5173/auth/callback`
   - `https://testingvala.com/auth/callback`

### Fix 5: Test with Different Email
Try magic link with:
- Gmail account
- Different email provider
- Check spam/junk folders

## 🚨 Emergency Fix: Use Gmail SMTP

If ZeptoMail continues to fail, temporarily use Gmail:

1. **Get Gmail App Password:**
   - Google Account → Security → 2-Step Verification → App passwords
   - Generate password for "TestingVala"

2. **Update Supabase SMTP:**
   ```
   Host: smtp.gmail.com
   Port: 587
   Username: info@testingvala.com
   Password: [Gmail App Password]
   Sender: TestingVala <info@testingvala.com>
   ```

## 🔍 Debug Steps

1. **Check Supabase Logs:**
   - Dashboard → Logs → Filter by "auth"
   - Look for SMTP errors

2. **Test Magic Link:**
   - Try with your own email
   - Check browser console for errors
   - Wait 2 minutes between attempts

3. **Verify Email Delivery:**
   - Check inbox AND spam folder
   - Try different email providers

## ⚡ Quick Test
Run this in browser console on your website:
```javascript
// Test magic link
supabase.auth.signInWithOtp({
  email: 'your-email@gmail.com',
  options: { emailRedirectTo: window.location.origin + '/auth/callback' }
}).then(console.log).catch(console.error);
```

## 📞 Next Steps
1. Verify SMTP toggle is ON in Supabase
2. Reset email template to default
3. Test with Gmail account
4. Check Supabase logs for errors