-- Insert all 20 categories for QA forum
INSERT INTO forum_categories (name, slug, description, color, icon, is_active) VALUES
  ('General Discussion', 'general-discussion', 'General QA discussions and questions', '#0057B7', 'message-square', true),
  ('Manual Testing', 'manual-testing', 'Manual testing techniques and strategies', '#10B981', 'clipboard', true),
  ('Automation Testing', 'automation-testing', 'Test automation frameworks and tools', '#FF6600', 'zap', true),
  ('API Testing', 'api-testing', 'API testing tools and methodologies', '#8B5CF6', 'code', true),
  ('Performance & Load Testing', 'performance-load-testing', 'Load testing and performance optimization', '#EF4444', 'trending-up', true),
  ('Security Testing', 'security-testing', 'Security testing and vulnerability assessment', '#DC2626', 'shield', true),
  ('Mobile Testing', 'mobile-testing', 'Mobile app testing strategies', '#059669', 'smartphone', true),
  ('Interview Preparation', 'interview-preparation', 'QA interview questions and preparation tips', '#7C3AED', 'briefcase', true),
  ('Certifications & Courses', 'certifications-courses', 'QA certifications and learning resources', '#0891B2', 'book-open', true),
  ('Career Guidance', 'career-guidance', 'Career advice and growth in QA', '#F59E0B', 'trending-up', true),
  ('Freshers & Beginners', 'freshers-beginners', 'Resources for QA beginners', '#22C55E', 'user-plus', true),
  ('Test Management Tools', 'test-management-tools', 'Test management and tracking tools', '#6366F1', 'settings', true),
  ('CI/CD & DevOps', 'cicd-devops', 'Continuous integration and DevOps practices', '#8B5CF6', 'git-branch', true),
  ('Bug Tracking', 'bug-tracking', 'Bug reporting and tracking systems', '#DC2626', 'bug', true),
  ('AI in Testing', 'ai-in-testing', 'AI and ML applications in testing', '#7C3AED', 'cpu', true),
  ('Job Openings & Referrals', 'job-openings-referrals', 'Job opportunities and referrals', '#059669', 'briefcase', true),
  ('Testing Contests & Challenges', 'testing-contests-challenges', 'QA contests and coding challenges', '#F59E0B', 'trophy', true),
  ('Best Practices & Processes', 'best-practices-processes', 'QA best practices and methodologies', '#0891B2', 'check-circle', true),
  ('Community Helpdesk', 'community-helpdesk', 'Get help from the community', '#10B981', 'help-circle', true),
  ('Events & Meetups', 'events-meetups', 'QA events, webinars, and meetups', '#F59E0B', 'calendar', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  icon = EXCLUDED.icon,
  is_active = EXCLUDED.is_active;

-- Verify insertion
SELECT COUNT(*) as total_categories FROM forum_categories WHERE is_active = true;