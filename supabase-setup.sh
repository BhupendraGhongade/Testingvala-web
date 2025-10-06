#!/bin/bash
# Supabase Project Setup & Initialization Script
# This script sets up your Supabase project with proper Admin/User separation

echo "🚀 Setting up Supabase automation for TestingVala..."

# 1. Install Supabase CLI if not installed
if ! command -v supabase &> /dev/null; then
    echo "📦 Installing Supabase CLI..."
    npm install -g supabase
fi

# 2. Initialize Supabase in project
echo "🔧 Initializing Supabase project..."
supabase init

# 3. Link to production project
echo "🔗 Linking to production project..."
echo "Please enter your Supabase project reference ID (from your dashboard URL):"
read -p "Project ID: " PROJECT_ID
supabase link --project-ref $PROJECT_ID

# 4. Generate base migration for existing tables
echo "📋 Creating base migration for existing data..."
supabase db diff --use-migra -f initial_schema

# 5. Create admin/user separation migration
cat > supabase/migrations/$(date +%Y%m%d%H%M%S)_admin_user_separation.sql << 'EOF'
-- Admin/User Table Separation Migration
-- This ensures clean separation between admin and user data

-- Create admin schema for admin-only tables
CREATE SCHEMA IF NOT EXISTS admin;

-- Move admin-related tables to admin schema (if they exist)
DO $$
BEGIN
    -- Move admin_sessions to admin schema
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_sessions') THEN
        ALTER TABLE public.admin_sessions SET SCHEMA admin;
    END IF;
    
    -- Move payment_config to admin schema  
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payment_config') THEN
        ALTER TABLE public.payment_config SET SCHEMA admin;
    END IF;
END $$;

-- Ensure proper RLS policies
ALTER TABLE IF EXISTS admin.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin.payment_config ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies
CREATE POLICY "Admin only access" ON admin.admin_sessions FOR ALL USING (false);
CREATE POLICY "Admin only payment config" ON admin.payment_config FOR ALL USING (false);

-- User tables remain in public schema with proper RLS
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contest_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.forum_posts ENABLE ROW LEVEL SECURITY;

-- User can only access their own data
CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);
EOF

echo "✅ Setup complete! Next steps:"
echo "1. Run: npm run db:local to test locally"
echo "2. Run: npm run db:deploy to deploy to production"