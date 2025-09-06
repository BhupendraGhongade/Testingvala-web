-- Forum System Setup for TestingVala
-- This creates all necessary tables for the community forum system

-- 1. Forum Categories Table
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

-- 2. User Profiles Table (extends auth.users)
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

-- 4. Forum Replies Table
CREATE TABLE IF NOT EXISTS forum_replies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
    likes_count INTEGER DEFAULT 0,
    dislikes_count INTEGER DEFAULT 0,
    is_solution BOOLEAN DEFAULT false,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Post Votes Table
CREATE TABLE IF NOT EXISTS post_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- 6. Reply Votes Table
CREATE TABLE IF NOT EXISTS reply_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(reply_id, user_id)
);

-- 7. User Reputation History Table
CREATE TABLE IF NOT EXISTS user_reputation_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    points_change INTEGER NOT NULL,
    description TEXT,
    related_post_id UUID REFERENCES forum_posts(id) ON DELETE SET NULL,
    related_reply_id UUID REFERENCES forum_replies(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Forum Tags Table
CREATE TABLE IF NOT EXISTS forum_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#FF6600',
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Post Tags Junction Table
CREATE TABLE IF NOT EXISTS post_tags (
    post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES forum_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- 10. User Followers Table
CREATE TABLE IF NOT EXISTS user_followers (
    follower_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_posts_category_id ON forum_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_user_id ON forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON forum_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_forum_posts_status ON forum_posts(status);
CREATE INDEX IF NOT EXISTS idx_forum_replies_post_id ON forum_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_user_id ON forum_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_post_votes_post_id ON post_votes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_votes_user_id ON post_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_reputation ON user_profiles(reputation_points);

-- Enable Row Level Security (RLS)
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reply_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reputation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_followers ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Forum Categories: Public read, Admin write
CREATE POLICY "Public read access to forum categories" ON forum_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin full access to forum categories" ON forum_categories
    FOR ALL USING (auth.role() = 'authenticated');

-- User Profiles: Public read, Own profile write
CREATE POLICY "Public read access to user profiles" ON user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Forum Posts: Public read, Authenticated users can create/update own posts
CREATE POLICY "Public read access to forum posts" ON forum_posts
    FOR SELECT USING (status = 'active');

CREATE POLICY "Authenticated users can create posts" ON forum_posts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own posts" ON forum_posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON forum_posts
    FOR DELETE USING (auth.uid() = user_id);

-- Forum Replies: Public read, Authenticated users can create/update own replies
CREATE POLICY "Public read access to forum replies" ON forum_replies
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create replies" ON forum_replies
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own replies" ON forum_replies
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own replies" ON forum_replies
    FOR DELETE USING (auth.uid() = user_id);

-- Post Votes: Users can manage own votes
CREATE POLICY "Users can manage own post votes" ON post_votes
    FOR ALL USING (auth.uid() = user_id);

-- Reply Votes: Users can manage own votes
CREATE POLICY "Users can manage own reply votes" ON reply_votes
    FOR ALL USING (auth.uid() = user_id);

-- User Reputation History: Users can read own history
CREATE POLICY "Users can read own reputation history" ON user_reputation_history
    FOR SELECT USING (auth.uid() = user_id);

-- Forum Tags: Public read, Admin write
CREATE POLICY "Public read access to forum tags" ON forum_tags
    FOR SELECT USING (true);

CREATE POLICY "Admin full access to forum tags" ON forum_tags
    FOR ALL USING (auth.role() = 'authenticated');

-- Post Tags: Public read, Admin write
CREATE POLICY "Public read access to post tags" ON post_tags
    FOR SELECT USING (true);

CREATE POLICY "Admin full access to post tags" ON post_tags
    FOR ALL USING (auth.role() = 'authenticated');

-- User Followers: Users can manage own follows
CREATE POLICY "Users can manage own follows" ON user_followers
    FOR ALL USING (auth.uid() = follower_id);

-- Create functions for automatic updates

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to update post reply count
CREATE OR REPLACE FUNCTION update_post_reply_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE forum_posts SET replies_count = replies_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE forum_posts SET replies_count = replies_count - 1 WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Function to update user post count
CREATE OR REPLACE FUNCTION update_user_post_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE user_profiles SET total_posts = total_posts + 1 WHERE id = NEW.user_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE user_profiles SET total_posts = total_posts - 1 WHERE id = OLD.user_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Function to update user reply count
CREATE OR REPLACE FUNCTION update_user_reply_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE user_profiles SET total_replies = total_replies + 1 WHERE id = NEW.user_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE user_profiles SET total_replies = total_replies - 1 WHERE id = OLD.user_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_forum_categories_updated_at 
    BEFORE UPDATE ON forum_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_posts_updated_at 
    BEFORE UPDATE ON forum_posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_replies_updated_at 
    BEFORE UPDATE ON forum_replies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_post_reply_count_trigger
    AFTER INSERT OR DELETE ON forum_replies
    FOR EACH ROW EXECUTE FUNCTION update_post_reply_count();

CREATE TRIGGER update_user_post_count_trigger
    AFTER INSERT OR DELETE ON forum_posts
    FOR EACH ROW EXECUTE FUNCTION update_user_post_count();

CREATE TRIGGER update_user_reply_count_trigger
    AFTER INSERT OR DELETE ON forum_replies
    FOR EACH ROW EXECUTE FUNCTION update_user_reply_count();

-- Insert initial forum categories
INSERT INTO forum_categories (name, description, slug, color, icon, sort_order) VALUES
('General QA Discussion', 'General discussions about QA practices, methodologies, and industry trends', 'general-qa', '#0057B7', 'message-circle', 1),
('Test Automation', 'Discussions about test automation frameworks, tools, and best practices', 'test-automation', '#FF6600', 'zap', 2),
('Manual Testing', 'Manual testing techniques, strategies, and real-world scenarios', 'manual-testing', '#10B981', 'hand', 3),
('Performance Testing', 'Performance testing, load testing, and optimization discussions', 'performance-testing', '#8B5CF6', 'trending-up', 4),
('Security Testing', 'Security testing methodologies, tools, and vulnerability assessment', 'security-testing', '#EF4444', 'shield', 5),
('Mobile Testing', 'Mobile app testing strategies, tools, and device testing', 'mobile-testing', '#06B6D4', 'smartphone', 6),
('API Testing', 'API testing tools, strategies, and REST/SOAP testing', 'api-testing', '#F59E0B', 'link', 7),
('Career & Interview', 'QA career advice, interview preparation, and professional development', 'career-interview', '#EC4899', 'briefcase', 8)
ON CONFLICT (name) DO NOTHING;

-- Insert sample forum tags
INSERT INTO forum_tags (name, description, color, usage_count) VALUES
('selenium', 'Selenium WebDriver automation framework', '#FF6600', 0),
('cypress', 'Cypress end-to-end testing framework', '#00D4AA', 0),
('playwright', 'Playwright cross-browser automation', '#2E8B57', 0),
('junit', 'JUnit testing framework for Java', '#DC143C', 0),
('pytest', 'PyTest framework for Python', '#FFD700', 0),
('jmeter', 'Apache JMeter for performance testing', '#FF4500', 0),
('postman', 'Postman for API testing', '#FF6C37', 0),
('git', 'Git version control system', '#F05032', 0),
('ci-cd', 'Continuous Integration and Deployment', '#00D4FF', 0),
('agile', 'Agile development methodologies', '#FF69B4', 0)
ON CONFLICT (name) DO NOTHING;

-- Create storage bucket for forum images
-- Note: This needs to be done manually in Supabase dashboard
-- Go to Storage > Create bucket: 'forum-images' (public)

-- Insert sample user profiles (for testing)
-- Note: These will be created automatically when users sign up
-- You can add test users here if needed

COMMENT ON TABLE forum_categories IS 'Forum categories for organizing discussions';
COMMENT ON TABLE user_profiles IS 'Extended user profiles with QA-specific information';
COMMENT ON TABLE forum_posts IS 'Main forum posts/discussions';
COMMENT ON TABLE forum_replies IS 'Replies to forum posts';
COMMENT ON TABLE post_votes IS 'User votes on forum posts (upvote/downvote)';
COMMENT ON TABLE reply_votes IS 'User votes on forum replies (upvote/downvote)';
COMMENT ON TABLE user_reputation_history IS 'History of reputation point changes';
COMMENT ON TABLE forum_tags IS 'Tags for categorizing forum posts';
COMMENT ON TABLE post_tags IS 'Junction table linking posts and tags';
COMMENT ON TABLE user_followers IS 'User following relationships';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
