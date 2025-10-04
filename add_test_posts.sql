-- Add test forum posts with proper category references
INSERT INTO forum_posts (title, content, category_id, author_name, experience_years, status, likes_count, replies_count) 
SELECT 
  'Welcome to TestingVala Community!',
  'This is our first community post. Welcome to all QA professionals! Share your experiences, ask questions, and help each other grow in the testing field.',
  c.id,
  'TestingVala Admin',
  '10+ years',
  'active',
  15,
  8
FROM forum_categories c WHERE c.slug = 'general-discussion' LIMIT 1;

INSERT INTO forum_posts (title, content, category_id, author_name, experience_years, status, likes_count, replies_count) 
SELECT 
  'Best Practices for Manual Testing',
  'Here are some essential manual testing practices that every QA should follow:\n\n1. Always understand requirements thoroughly\n2. Create detailed test cases\n3. Document bugs clearly\n4. Test from user perspective\n5. Perform exploratory testing\n\nWhat are your favorite manual testing techniques?',
  c.id,
  'Sarah Johnson',
  '5 years',
  'active',
  23,
  12
FROM forum_categories c WHERE c.slug = 'manual-testing' LIMIT 1;

INSERT INTO forum_posts (title, content, category_id, author_name, experience_years, status, likes_count, replies_count) 
SELECT 
  'Selenium vs Cypress: Which to Choose?',
  'I''m starting a new automation project and need to decide between Selenium and Cypress. Here''s what I''ve found so far:\n\n**Selenium:**\n- Multi-browser support\n- Multiple language bindings\n- Large community\n\n**Cypress:**\n- Faster execution\n- Better debugging\n- Modern architecture\n\nWhat''s your experience with these tools?',
  c.id,
  'Mike Chen',
  '3 years',
  'active',
  31,
  18
FROM forum_categories c WHERE c.slug = 'automation-testing' LIMIT 1;

INSERT INTO forum_posts (title, content, category_id, author_name, experience_years, status, likes_count, replies_count) 
SELECT 
  'API Testing with Postman - Tips & Tricks',
  'Sharing some advanced Postman techniques I''ve learned:\n\n🔧 **Environment Variables**: Use them for different environments\n📝 **Pre-request Scripts**: Set up dynamic data\n✅ **Tests Tab**: Automate response validation\n🔄 **Collection Runner**: Execute tests in sequence\n📊 **Newman**: Run collections from command line\n\nAnyone else have favorite Postman features?',
  c.id,
  'Alex Rodriguez',
  '4 years',
  'active',
  19,
  7
FROM forum_categories c WHERE c.slug = 'api-testing' LIMIT 1;

INSERT INTO forum_posts (title, content, category_id, author_name, experience_years, status, likes_count, replies_count) 
SELECT 
  'Common QA Interview Questions 2025',
  'Preparing for QA interviews? Here are the most common questions I''ve encountered:\n\n**Technical Questions:**\n- Difference between verification and validation\n- Types of testing (functional, non-functional)\n- Bug life cycle\n- Test case design techniques\n\n**Scenario-based Questions:**\n- How would you test a login page?\n- Priority vs Severity of bugs\n- Testing without requirements\n\n**Automation Questions:**\n- When to automate vs manual testing\n- Framework design principles\n\nGood luck with your interviews! 🍀',
  c.id,
  'Emma Wilson',
  '6 years',
  'active',
  45,
  22
FROM forum_categories c WHERE c.slug = 'interview-preparation' LIMIT 1;

INSERT INTO forum_posts (title, content, category_id, author_name, experience_years, status, likes_count, replies_count) 
SELECT 
  'Mobile Testing Challenges in 2025',
  'Mobile testing has evolved significantly. Here are the current challenges:\n\n📱 **Device Fragmentation**: So many devices, OS versions\n🔋 **Battery Testing**: Apps should be power-efficient\n📶 **Network Conditions**: 3G, 4G, 5G, WiFi variations\n🔄 **App Updates**: Continuous deployment challenges\n🛡️ **Security**: Mobile-specific vulnerabilities\n\nWhat mobile testing challenges are you facing?',
  c.id,
  'David Park',
  '7 years',
  'active',
  28,
  14
FROM forum_categories c WHERE c.slug = 'mobile-testing' LIMIT 1;

-- Add a few more posts to different categories
INSERT INTO forum_posts (title, content, category_id, author_name, experience_years, status, likes_count, replies_count) 
SELECT 
  'Career Growth Path for QA Engineers',
  'Wondering about career progression in QA? Here''s a typical path:\n\n👶 **Junior QA** → Manual testing, learning basics\n🧑‍💼 **QA Engineer** → Automation, API testing\n👨‍💼 **Senior QA** → Framework design, mentoring\n🎯 **QA Lead** → Team management, strategy\n🏢 **QA Manager** → Multiple teams, processes\n\nSpecialization options:\n- Test Automation Engineer\n- Performance Test Engineer\n- Security Test Engineer\n- QA Architect\n\nWhat''s your career goal?',
  c.id,
  'Lisa Thompson',
  '8 years',
  'active',
  52,
  29
FROM forum_categories c WHERE c.slug = 'career-guidance' LIMIT 1;

INSERT INTO forum_posts (title, content, category_id, author_name, experience_years, status, likes_count, replies_count) 
SELECT 
  'Performance Testing Tools Comparison',
  'Comparing popular performance testing tools:\n\n**JMeter** 🆓\n- Free and open source\n- GUI and command line\n- Good for web applications\n\n**LoadRunner** 💰\n- Enterprise-grade\n- Extensive protocol support\n- Expensive licensing\n\n**K6** ⚡\n- Modern, developer-friendly\n- JavaScript-based\n- Cloud and on-premise\n\n**Gatling** 🚀\n- High performance\n- Scala-based\n- Great reporting\n\nWhich tool do you prefer and why?',
  c.id,
  'James Kumar',
  '9 years',
  'active',
  37,
  16
FROM forum_categories c WHERE c.slug = 'performance-load-testing' LIMIT 1;