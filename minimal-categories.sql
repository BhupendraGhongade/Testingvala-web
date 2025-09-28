-- Minimal category setup - works with any table structure
INSERT INTO forum_categories (name, slug) VALUES
  ('General Discussion', 'general-discussion'),
  ('Manual Testing', 'manual-testing'),
  ('Automation Testing', 'automation-testing'),
  ('API Testing', 'api-testing'),
  ('Performance & Load Testing', 'performance-load-testing'),
  ('Security Testing', 'security-testing'),
  ('Mobile Testing', 'mobile-testing'),
  ('Interview Preparation', 'interview-preparation'),
  ('Certifications & Courses', 'certifications-courses'),
  ('Career Guidance', 'career-guidance'),
  ('Freshers & Beginners', 'freshers-beginners'),
  ('Test Management Tools', 'test-management-tools'),
  ('CI/CD & DevOps', 'cicd-devops'),
  ('Bug Tracking', 'bug-tracking'),
  ('AI in Testing', 'ai-in-testing'),
  ('Job Openings & Referrals', 'job-openings-referrals'),
  ('Testing Contests & Challenges', 'testing-contests-challenges'),
  ('Best Practices & Processes', 'best-practices-processes'),
  ('Community Helpdesk', 'community-helpdesk'),
  ('Events & Meetups', 'events-meetups')
ON CONFLICT (slug) DO NOTHING;