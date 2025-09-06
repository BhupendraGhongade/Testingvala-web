-- Quick Forum Setup - Minimal tables to fix the immediate error
-- Run this in Supabase SQL Editor

-- 1. Forum Categories Table (the one causing the error)
CREATE TABLE IF NOT EXISTS forum_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    slug VARCHAR(100) UNIQUE,
    color VARCHAR(7) DEFAULT '#0057B7',
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    email TEXT,
    bio TEXT,
    avatar_url TEXT,
    qa_expertise_level VARCHAR(20) DEFAULT 'beginner',
    company VARCHAR(100),
    location VARCHAR(100),
    website TEXT,
    reputation_points INTEGER DEFAULT 0,
    total_posts INTEGER DEFAULT 0,
    total_replies INTEGER DEFAULT 0,
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Forum Posts Table
CREATE TABLE IF NOT EXISTS forum_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category_id UUID REFERENCES forum_categories(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    image_url TEXT,
    likes_count INTEGER DEFAULT 0,
    dislikes_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert basic forum categories
INSERT INTO forum_categories (name, description, slug, color, icon, sort_order) VALUES
('General QA Discussion', 'General discussions about QA practices', 'general-qa', '#0057B7', 'message-circle', 1),
('Test Automation', 'Test automation discussions', 'test-automation', '#FF6600', 'zap', 2),
('Manual Testing', 'Manual testing techniques', 'manual-testing', '#10B981', 'hand', 3)
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

-- Basic policies
CREATE POLICY "Public read access to forum categories" ON forum_categories FOR SELECT USING (true);
CREATE POLICY "Public read access to forum posts" ON forum_posts FOR SELECT USING (status = 'active');
CREATE POLICY "Authenticated users can create posts" ON forum_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated; 