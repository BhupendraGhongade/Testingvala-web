# 🔧 NON-TECHNICAL SETUP GUIDE

## 📋 PART 1: SUPABASE SETUP (5 minutes)

### Step 1: Open Supabase
1. Go to: https://supabase.com
2. Click **"Sign In"** (top right)
3. Enter your login details
4. You'll see a list of projects - click on your **TestingVala project**

### Step 2: Run Database Setup
1. Look for **"SQL Editor"** in the left menu (looks like `</>`)
2. Click **"SQL Editor"**
3. You'll see a big text box
4. Open the file `production-supabase-config.sql` on your computer
5. **Copy ALL the text** from that file (Ctrl+A, then Ctrl+C)
6. **Paste it** into the big text box in Supabase (Ctrl+V)
7. Click the **"RUN"** button (usually blue)
8. Wait for it to say **"Success"** or show green checkmarks

### Step 3: Turn Off Email Confirmations
1. In the left menu, find **"Authentication"**
2. Click **"Authentication"**
3. Click **"Settings"** (under Authentication)
4. Look for **"Enable email confirmations"**
5. **Turn it OFF** (toggle switch should be gray/off)
6. Look for **"Enable email change confirmations"**
7. **Turn it OFF** too

### Step 4: Set Website URLs
1. Still in Authentication, click **"URL Configuration"**
2. Find **"Site URL"** field
3. Type: `https://testingvala.com`
4. Find **"Redirect URLs"** section
5. Click **"Add URL"**
6. Type: `https://testingvala.com/auth/verify`
7. Click **"Save"** or **"Update"**

---

## 📧 PART 2: ZEPTOMAIL SETUP (3 minutes)

### Step 1: Open ZeptoMail
1. Go to: https://www.zoho.com/zeptomail/
2. Click **"Login"** (top right)
3. Enter your ZeptoMail login details
4. You'll see your ZeptoMail dashboard

### Step 2: Turn Off Sandbox Mode
1. Look for **"Settings"** in the menu (gear icon ⚙️)
2. Click **"Settings"**
3. Find **"Sandbox"** or **"Test Mode"**
4. You'll see a toggle switch that says **"Sandbox Mode"**
5. **Turn it OFF** (switch should be gray/off)
6. It might ask "Are you sure?" - click **"Yes"** or **"Confirm"**

### Step 3: Verify Domain
1. In Settings, look for **"Domains"** or **"Domain Verification"**
2. Click **"Domains"**
3. You should see `testingvala.com` in the list
4. If it shows **"Verified"** ✅ - you're done!
5. If it shows **"Pending"** or **"Not Verified"**:
   - Click on `testingvala.com`
   - Follow the instructions to add DNS records
   - Contact your domain provider (where you bought testingvala.com)

---

## 🧪 PART 3: TEST EVERYTHING (2 minutes)

### Step 1: Test Your Website
1. Go to: https://testingvala.com
2. Look for **"Login"** or **"Sign Up"** button
3. Click it
4. Enter your email address
5. Click **"Send Magic Link"** or similar button

### Step 2: Check Your Email
1. Open your email inbox
2. Look for email from **TestingVala**
3. It should have social media icons and look professional
4. Click the **"Verify My Account"** button in the email

### Step 3: Confirm Login
1. It should take you back to testingvala.com
2. You should see a success message
3. You should be logged in to the website

---

## 🆘 IF SOMETHING GOES WRONG

### Email Not Received?
- Check spam/junk folder
- Make sure ZeptoMail sandbox is OFF
- Make sure domain is verified

### Magic Link Doesn't Work?
- Make sure you ran the SQL in Supabase
- Check that redirect URLs are set correctly
- Try again with a fresh email

### Still Having Issues?
- Email: info@testingvala.com
- Include: "Production Setup Help"
- Describe what step failed

---

## ✅ SUCCESS CHECKLIST

- [ ] Supabase SQL ran successfully
- [ ] Email confirmations turned OFF
- [ ] Site URL set to https://testingvala.com
- [ ] Redirect URL added
- [ ] ZeptoMail sandbox turned OFF
- [ ] Domain verified in ZeptoMail
- [ ] Test email received and worked
- [ ] Successfully logged into website

**🎉 Once all boxes are checked, your magic link system is working!**