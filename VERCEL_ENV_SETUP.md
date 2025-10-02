# 🚀 VERCEL ENVIRONMENT VARIABLES SETUP

## 📋 COPY THESE TO VERCEL DASHBOARD

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

### **PRODUCTION ENVIRONMENT**
Add these exact variables:

```
VITE_SUPABASE_URL=https://qxsardezvxsquvejvsso.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4c2FyZGV6dnhzcXV2ZWp2c3NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NDc2OTMsImV4cCI6MjA3MTAyMzY5M30.ZQhcxebPR4kvAAwCIJr7WlugVwoZivTDN9ID3p_aC04
VITE_APP_ENV=production
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4c2FyZGV6dnhzcXV2ZWp2c3NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTQ0NzY5MywiZXhwIjoyMDcxMDIzNjkzfQ.fWpQKMLUQ-U1zrxKCtNrMD1BtEvLy3HJxVoeGlK_HnQ
ZEPTO_API_KEY=Zoho-enczapikey PHtE6r0LEeHu3jUs9RcF5fW5Ecb1Yd9/9eM0fVUWuYcQXPBVHE1d/d15ljezo08vVqYXEvGdy9losbrOseqDdDu7NWdEVWqyqK3sx/VYSPOZsbq6x00ZslgYdUPVVoXpdtBp1iTWvtiX
ZEPTO_FROM_EMAIL=info@testingvala.com
ZEPTO_FROM_NAME=TestingVala
```

## 🔧 HOW TO ADD THEM

### Step 1: Open Vercel
1. Go to https://vercel.com
2. Login to your account
3. Find your **TestingVala** project
4. Click on it

### Step 2: Add Environment Variables
1. Click **Settings** (in the top menu)
2. Click **Environment Variables** (in the left sidebar)
3. For each variable above:
   - Click **Add New**
   - **Name**: Copy the part before `=` (like `VITE_SUPABASE_URL`)
   - **Value**: Copy the part after `=` (like `https://qxsardezvxsquvejvsso.supabase.co`)
   - **Environment**: Select **Production**
   - Click **Save**

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Wait for it to finish

## ✅ VERIFICATION

After adding all variables:
1. Go to your live website: https://testingvala.com
2. Try to login with your email
3. Check if you receive the magic link email
4. Click the link to verify it works

## 🆘 TROUBLESHOOTING

**If magic links don't work:**
- Make sure all 7 variables are added exactly as shown
- Check that ZeptoMail sandbox mode is OFF
- Verify domain is confirmed in ZeptoMail
- Try redeploying the project

**Need help?** Email: info@testingvala.com