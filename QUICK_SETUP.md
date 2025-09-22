# ⚡ QUICK SETUP GUIDE

## 🤖 Automated Steps
```bash
./auto-setup.sh
```
This handles: code deployment, testing endpoints

## 👆 Manual Steps (5 minutes total)

### 1. Supabase (3 minutes)
1. Open: https://supabase.com/dashboard/projects
2. Click your project
3. Go to **SQL Editor**
4. Copy entire content from `production-supabase-config.sql`
5. Paste and click **RUN**
6. Go to **Authentication** → **Settings**
7. Turn **OFF**: "Enable email confirmations"
8. Go to **Authentication** → **URL Configuration**
9. Set **Site URL**: `https://testingvala.com`
10. Add **Redirect URL**: `https://testingvala.com/auth/verify`

### 2. ZeptoMail (2 minutes)
1. Open: https://www.zoho.com/zeptomail/
2. Login to your account
3. Go to **Settings** → **Sandbox**
4. Turn **OFF** sandbox mode
5. Go to **Domain** → **Verification**
6. Ensure `testingvala.com` is **verified**

## ✅ Test
Go to https://testingvala.com and try login!

---
**Why manual?** Supabase and ZeptoMail don't provide APIs for these dashboard settings.