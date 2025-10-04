-- Create forum_categories table
CREATE TABLE IF NOT EXISTS forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO forum_categories (name, slug, description, is_active) VALUES
('Test Automation', 'automation', 'Discussions about test automation tools, frameworks, and best practices', true),
('Manual Testing', 'manual', 'Manual testing techniques, exploratory testing, and test case design', true),
('QA Career', 'career', 'Career advice, interview tips, and professional development for QA professionals', true),
('Testing Tools', 'tools', 'Reviews and discussions about testing tools and software', true),
('General Discussion', 'general', 'General QA topics and open discussions', true),
('API Testing', 'api', 'REST API testing, GraphQL testing, and API automation', true),
('Performance Testing', 'performance', 'Load testing, stress testing, and performance optimization', true),
('Security Testing', 'security', 'Security testing practices and vulnerability assessment', true)
ON CONFLICT (slug) DO NOTHING;