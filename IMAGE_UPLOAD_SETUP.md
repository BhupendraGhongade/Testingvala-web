# 🖼️ Image Upload Setup Guide

## ❌ **Current Issues Found**

1. **Missing `.env` file** - Your Supabase credentials are not configured
2. **Storage bucket not created** - The `event-images` bucket doesn't exist in Supabase
3. **Storage policies not configured** - RLS policies are missing for image uploads

## 🔧 **Step-by-Step Fix**

### **Step 1: Create Environment File**

Create a `.env` file in your project root (same level as `package.json`):

```bash
VITE_SUPABASE_URL=https://qxsardezvxsquvejvsso.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4c2FyZGV6dnhzcXV2ZWp2c3NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NDc2OTMsImV4cCI6MjA3MTAyMzY5M30.ZQhcxebPR4kvAAwCIJr7WlugVwoZivTDN9ID3p_aC04
```

### **Step 2: Create Storage Bucket in Supabase**

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `qxsardezvxsquvejvsso`
3. Go to **Storage** → **Buckets**
4. Click **Create a new bucket**
5. Set bucket name: `event-images`
6. Set bucket as **Public**
7. Click **Create bucket**

### **Step 3: Configure Storage Policies**

In your Supabase SQL Editor, run these commands:

```sql
-- Allow public read access to event images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'event-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'event-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to update their images
CREATE POLICY "Users can update own images" ON storage.objects FOR UPDATE USING (bucket_id = 'event-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete their images
CREATE POLICY "Users can delete own images" ON storage.objects FOR DELETE USING (bucket_id = 'event-images' AND auth.role() = 'authenticated');
```

### **Step 4: Test the Connection**

1. Restart your development server
2. Go to Admin Panel → Events tab
3. Click the **Test Connection** button
4. You should see: "✅ Supabase connection test passed!"

### **Step 5: Test Image Upload**

1. Try to create a new event with an image
2. Check the browser console for any errors
3. The image should upload successfully

## 🚨 **Common Error Messages & Solutions**

### **"Storage bucket not found"**
- Make sure you created the `event-images` bucket
- Check the bucket name spelling exactly

### **"Storage policy error"**
- Run the SQL policies from Step 3
- Make sure RLS is enabled on the storage.objects table

### **"Cannot access storage buckets"**
- Check your Supabase credentials in `.env`
- Verify the project URL and anon key are correct

### **"File too large"**
- Current limit is 10MB
- Reduce image size or compress the image

## 🔍 **Debugging Steps**

1. **Check Browser Console** - Look for error messages
2. **Verify Environment Variables** - Make sure `.env` file exists and has correct values
3. **Test Supabase Connection** - Use the test button in admin panel
4. **Check Storage Bucket** - Verify bucket exists in Supabase dashboard
5. **Check Storage Policies** - Run the SQL commands in Step 3

## 📱 **After Setup**

Once everything is working:
- ✅ Images will upload to Supabase Storage
- ✅ Images will be accessible via public URLs
- ✅ Image preview will work in the admin panel
- ✅ Images will display on the frontend

## 🆘 **Still Having Issues?**

If you're still experiencing problems:

1. Check the browser console for specific error messages
2. Verify all steps above are completed
3. Make sure your Supabase project is active and not paused
4. Check if you have the correct permissions in your Supabase project

---

**Note**: The code has been fixed to handle the `getPublicUrl` call correctly. The main issue was the missing environment configuration and storage setup.
