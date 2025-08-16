# Quick Setup Guide

## 🚀 Your Website is Now Running!

The website should now be visible at: **http://localhost:5173**

## 📋 Next Steps - Set Up Supabase Database

### 1. Go to Supabase Dashboard
- Visit: https://supabase.com/dashboard
- Sign in to your account
- Open your project: `hqvvswhqyazfbdmsfplz`

### 2. Set Up Database Tables
- Go to **SQL Editor** in the left sidebar
- Copy and paste the entire content from `setup-supabase.sql`
- Click **Run** to execute the SQL

### 3. Verify Setup
- Go to **Table Editor** in the left sidebar
- You should see these tables:
  - `website_content`
  - `users`
  - `contest_submissions`
  - `admin_sessions`

### 4. Test the Website
- Refresh your browser at http://localhost:5173
- The yellow "Offline Mode" banner should disappear
- Click the settings icon (bottom-right) to access admin panel
- Admin password: `TestingVala2025`

## 🔧 Admin Panel Features

Once connected to Supabase, you can:
- ✅ Edit contest details
- ✅ Update hero section
- ✅ Manage previous winners
- ✅ Change about section
- ✅ Update contact information
- ✅ All changes save in real-time

## 🎨 Customization

### Change Admin Password
Edit `src/components/AdminPanel.jsx` line 25:
```javascript
const OWNER_PASSWORD = 'YourNewPassword123!';
```

### Update Logo/Branding
- Edit `src/components/Logo.jsx`
- Update colors in `tailwind.config.js`

## 🚀 Deployment

### Deploy to Vercel
1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production
```
VITE_SUPABASE_URL=https://hqvvswhqyazfbdmsfplz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxdnZzd2hxeWF6ZmJkbXNmcGx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMzIwMTUsImV4cCI6MjA3MDkwODAxNX0.99uzuk8iHqCaC5Arv9VzZM1ky2driiZ8zBYDhuz2TNI
```

## 🆘 Troubleshooting

### Website not loading?
- Check browser console for errors
- Ensure Supabase tables are created
- Verify environment variables are set

### Admin panel not working?
- Check if Supabase is connected
- Verify admin password is correct
- Check browser console for errors

### Database connection issues?
- Verify Supabase project is active
- Check API keys are correct
- Ensure tables exist in database

## 📞 Support

If you need help:
1. Check the browser console for errors
2. Verify Supabase setup is complete
3. Try refreshing the page
4. Check the README.md for detailed instructions

---

**🎉 Your TestingVala website is ready to go!**
