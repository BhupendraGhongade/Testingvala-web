-- Complete Resume Management System Database Schema
-- This creates a comprehensive resume management system with drafts, versions, sharing, and analytics

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Resume Templates Table
CREATE TABLE IF NOT EXISTS resume_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL,
  category VARCHAR(50) DEFAULT 'professional',
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  preview_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User Resumes Table (Main resume storage)
CREATE TABLE IF NOT EXISTS user_resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID, -- Can be null for anonymous users
  user_email VARCHAR(255), -- For identification when user_id is null
  title VARCHAR(200) NOT NULL DEFAULT 'My Resume',
  resume_data JSONB NOT NULL,
  template_id UUID REFERENCES resume_templates(id),
  status VARCHAR(20) DEFAULT 'draft', -- draft, published, archived
  is_public BOOLEAN DEFAULT false,
  public_slug VARCHAR(100) UNIQUE,
  metadata JSONB DEFAULT '{}', -- Additional metadata like completion percentage, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Resume Versions Table (Version history)
CREATE TABLE IF NOT EXISTS resume_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID REFERENCES user_resumes(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  resume_data JSONB NOT NULL,
  template_id UUID REFERENCES resume_templates(id),
  change_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255) -- user email or identifier
);

-- 4. Resume Shares Table (Sharing and collaboration)
CREATE TABLE IF NOT EXISTS resume_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID REFERENCES user_resumes(id) ON DELETE CASCADE,
  shared_by VARCHAR(255) NOT NULL,
  shared_with VARCHAR(255), -- email or null for public
  share_type VARCHAR(20) DEFAULT 'view', -- view, edit, comment
  access_token VARCHAR(100) UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Resume Analytics Table (Usage tracking)
CREATE TABLE IF NOT EXISTS resume_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID REFERENCES user_resumes(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- view, download, edit, share, etc.
  user_agent TEXT,
  ip_address INET,
  referrer TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Resume Comments Table (Feedback and collaboration)
CREATE TABLE IF NOT EXISTS resume_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID REFERENCES user_resumes(id) ON DELETE CASCADE,
  commenter_email VARCHAR(255) NOT NULL,
  commenter_name VARCHAR(100),
  comment_text TEXT NOT NULL,
  section_reference VARCHAR(100), -- Which section the comment refers to
  is_resolved BOOLEAN DEFAULT false,
  parent_comment_id UUID REFERENCES resume_comments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Resume Export History Table (Track downloads and exports)
CREATE TABLE IF NOT EXISTS resume_exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID REFERENCES user_resumes(id) ON DELETE CASCADE,
  export_format VARCHAR(20) NOT NULL, -- pdf, docx, html, json
  export_settings JSONB DEFAULT '{}',
  file_size INTEGER,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default templates
INSERT INTO resume_templates (name, description, template_data, category, preview_image_url) VALUES
('Modern Professional', 'Enterprise-grade design with SF Pro typography, used by Fortune 500 companies', 
 '{"id": "modern", "fonts": ["SF Pro Display"], "colors": {"primary": "#1a365d", "secondary": "#2c5282"}, "layout": "single-column"}', 
 'professional', '/templates/modern-preview.jpg'),
 
('Executive Premium', 'Sophisticated serif layout inspired by McKinsey & Goldman Sachs standards', 
 '{"id": "executive", "fonts": ["Minion Pro"], "colors": {"primary": "#2d3748", "accent": "#d69e2e"}, "layout": "two-column"}', 
 'executive', '/templates/executive-preview.jpg'),
 
('ATS Optimized', 'Clean Arial formatting for 99% ATS compatibility across all systems', 
 '{"id": "ats", "fonts": ["Arial"], "colors": {"primary": "#000000", "secondary": "#333333"}, "layout": "simple"}', 
 'ats-friendly', '/templates/ats-preview.jpg'),
 
('Creative Tech', 'Modern gradient design inspired by leading tech companies like Apple & Google', 
 '{"id": "creative", "fonts": ["Avenir Next"], "colors": {"primary": "#553c9a", "secondary": "#7c3aed"}, "layout": "creative"}', 
 'creative', '/templates/creative-preview.jpg');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_resumes_user_email ON user_resumes(user_email);
CREATE INDEX IF NOT EXISTS idx_user_resumes_status ON user_resumes(status);
CREATE INDEX IF NOT EXISTS idx_user_resumes_updated_at ON user_resumes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_resumes_public_slug ON user_resumes(public_slug) WHERE public_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_resume_versions_resume_id ON resume_versions(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_shares_resume_id ON resume_shares(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_shares_access_token ON resume_shares(access_token);
CREATE INDEX IF NOT EXISTS idx_resume_analytics_resume_id ON resume_analytics(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_analytics_event_type ON resume_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_resume_comments_resume_id ON resume_comments(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_exports_resume_id ON resume_exports(resume_id);

-- Row Level Security (RLS) Policies
ALTER TABLE resume_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_exports ENABLE ROW LEVEL SECURITY;

-- Templates are public for reading
CREATE POLICY "Templates are publicly readable" ON resume_templates
  FOR SELECT USING (is_active = true);

-- Users can read their own resumes or public ones
CREATE POLICY "Users can read own resumes" ON user_resumes
  FOR SELECT USING (
    user_email = current_setting('request.jwt.claims', true)::json->>'email' 
    OR is_public = true
  );

-- Users can create resumes
CREATE POLICY "Users can create resumes" ON user_resumes
  FOR INSERT WITH CHECK (
    user_email = current_setting('request.jwt.claims', true)::json->>'email'
    OR user_email IS NOT NULL
  );

-- Users can update their own resumes
CREATE POLICY "Users can update own resumes" ON user_resumes
  FOR UPDATE USING (
    user_email = current_setting('request.jwt.claims', true)::json->>'email'
  );

-- Users can delete their own resumes
CREATE POLICY "Users can delete own resumes" ON user_resumes
  FOR DELETE USING (
    user_email = current_setting('request.jwt.claims', true)::json->>'email'
  );

-- Version history policies
CREATE POLICY "Users can read own resume versions" ON resume_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_resumes 
      WHERE user_resumes.id = resume_versions.resume_id 
      AND user_resumes.user_email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

CREATE POLICY "Users can create resume versions" ON resume_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_resumes 
      WHERE user_resumes.id = resume_versions.resume_id 
      AND user_resumes.user_email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Share policies
CREATE POLICY "Users can manage their resume shares" ON resume_shares
  FOR ALL USING (
    shared_by = current_setting('request.jwt.claims', true)::json->>'email'
    OR shared_with = current_setting('request.jwt.claims', true)::json->>'email'
  );

-- Analytics policies (insert only for tracking)
CREATE POLICY "Anyone can insert analytics" ON resume_analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can read own resume analytics" ON resume_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_resumes 
      WHERE user_resumes.id = resume_analytics.resume_id 
      AND user_resumes.user_email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Comments policies
CREATE POLICY "Users can read resume comments" ON resume_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_resumes 
      WHERE user_resumes.id = resume_comments.resume_id 
      AND (user_resumes.user_email = current_setting('request.jwt.claims', true)::json->>'email'
           OR user_resumes.is_public = true)
    )
  );

CREATE POLICY "Users can create comments" ON resume_comments
  FOR INSERT WITH CHECK (
    commenter_email = current_setting('request.jwt.claims', true)::json->>'email'
  );

-- Export history policies
CREATE POLICY "Users can manage own resume exports" ON resume_exports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_resumes 
      WHERE user_resumes.id = resume_exports.resume_id 
      AND user_resumes.user_email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Functions for common operations
CREATE OR REPLACE FUNCTION create_resume_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-create version when resume is updated
  INSERT INTO resume_versions (resume_id, version_number, resume_data, template_id, created_by)
  SELECT 
    NEW.id,
    COALESCE((SELECT MAX(version_number) FROM resume_versions WHERE resume_id = NEW.id), 0) + 1,
    NEW.resume_data,
    NEW.template_id,
    NEW.user_email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create versions
CREATE TRIGGER create_resume_version_trigger
  AFTER UPDATE ON user_resumes
  FOR EACH ROW
  WHEN (OLD.resume_data IS DISTINCT FROM NEW.resume_data)
  EXECUTE FUNCTION create_resume_version();

-- Function to generate public slug
CREATE OR REPLACE FUNCTION generate_public_slug(resume_title TEXT, user_email TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from title and user
  base_slug := lower(regexp_replace(
    regexp_replace(resume_title || '-' || split_part(user_email, '@', 1), '[^a-zA-Z0-9\s]', '', 'g'),
    '\s+', '-', 'g'
  ));
  
  final_slug := base_slug;
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM user_resumes WHERE public_slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to update last accessed timestamp
CREATE OR REPLACE FUNCTION update_last_accessed()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_accessed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last accessed
CREATE TRIGGER update_last_accessed_trigger
  BEFORE UPDATE ON user_resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_last_accessed();

-- Function to clean up old drafts (can be called periodically)
CREATE OR REPLACE FUNCTION cleanup_old_drafts(days_old INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM user_resumes 
  WHERE status = 'draft' 
    AND updated_at < NOW() - INTERVAL '1 day' * days_old
    AND (resume_data->>'personal'->>'name' IS NULL OR resume_data->>'personal'->>'name' = '');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create a view for resume statistics
CREATE OR REPLACE VIEW resume_stats AS
SELECT 
  r.id,
  r.title,
  r.status,
  r.created_at,
  r.updated_at,
  r.last_accessed_at,
  COUNT(DISTINCT rv.id) as version_count,
  COUNT(DISTINCT rs.id) as share_count,
  COUNT(DISTINCT ra.id) FILTER (WHERE ra.event_type = 'view') as view_count,
  COUNT(DISTINCT ra.id) FILTER (WHERE ra.event_type = 'download') as download_count,
  COUNT(DISTINCT rc.id) as comment_count
FROM user_resumes r
LEFT JOIN resume_versions rv ON r.id = rv.resume_id
LEFT JOIN resume_shares rs ON r.id = rs.resume_id AND rs.is_active = true
LEFT JOIN resume_analytics ra ON r.id = ra.resume_id
LEFT JOIN resume_comments rc ON r.id = rc.resume_id
GROUP BY r.id, r.title, r.status, r.created_at, r.updated_at, r.last_accessed_at;

COMMENT ON TABLE resume_templates IS 'Stores resume template definitions and metadata';
COMMENT ON TABLE user_resumes IS 'Main table for storing user resumes with full data';
COMMENT ON TABLE resume_versions IS 'Version history for resume changes';
COMMENT ON TABLE resume_shares IS 'Sharing and collaboration settings for resumes';
COMMENT ON TABLE resume_analytics IS 'Analytics and usage tracking for resumes';
COMMENT ON TABLE resume_comments IS 'Comments and feedback on resumes';
COMMENT ON TABLE resume_exports IS 'History of resume exports and downloads';