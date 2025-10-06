-- Check existing categories
SELECT name, slug FROM forum_categories ORDER BY name;

-- Insert only missing categories
INSERT INTO forum_categories (name, slug) 
SELECT * FROM (VALUES
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
) AS new_categories(name, slug)
WHERE NOT EXISTS (
  SELECT 1 FROM forum_categories 
  WHERE forum_categories.name = new_categories.name 
  OR forum_categories.slug = new_categories.slug
);