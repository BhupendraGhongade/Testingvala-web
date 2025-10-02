-- Enhanced Resume Builder Schema for QA/IT Professionals
-- Adds support for new sections: Publications, Open Source, Professional Memberships, Portfolio, Patents

-- Update the resume_data JSONB structure to include new sections
-- This is a migration to add new fields to existing resume system

-- Add new columns to user_resumes table for better organization
ALTER TABLE user_resumes ADD COLUMN IF NOT EXISTS sections_enabled JSONB DEFAULT '{
  "publications": false,
  "openSource": false,
  "memberships": false,
  "portfolio": false,
  "patents": false,
  "achievements": true,
  "languages": false,
  "volunteer": false
}';

-- Create a function to validate resume data structure
CREATE OR REPLACE FUNCTION validate_resume_data(data JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Validate that required sections exist
  RETURN (
    data ? 'personal' AND
    data ? 'summary' AND
    data ? 'technicalSkills' AND
    data ? 'experience' AND
    data ? 'education'
  );
END;
$$ LANGUAGE plpgsql;

-- Add constraint to ensure valid resume data
ALTER TABLE user_resumes ADD CONSTRAINT valid_resume_data 
  CHECK (validate_resume_data(resume_data));

-- Create indexes for new searchable fields
CREATE INDEX IF NOT EXISTS idx_user_resumes_sections_enabled ON user_resumes USING GIN (sections_enabled);
CREATE INDEX IF NOT EXISTS idx_user_resumes_resume_data ON user_resumes USING GIN (resume_data);

-- Function to get resume completion percentage
CREATE OR REPLACE FUNCTION calculate_resume_completion(data JSONB, sections JSONB)
RETURNS INTEGER AS $$
DECLARE
  total_sections INTEGER := 0;
  completed_sections INTEGER := 0;
BEGIN
  -- Core sections (always counted)
  total_sections := 5; -- personal, summary, skills, experience, education
  
  -- Check core sections
  IF data->'personal'->>'name' IS NOT NULL AND data->'personal'->>'name' != '' THEN
    completed_sections := completed_sections + 1;
  END IF;
  
  IF data->>'summary' IS NOT NULL AND data->>'summary' != '' THEN
    completed_sections := completed_sections + 1;
  END IF;
  
  IF jsonb_array_length(COALESCE(data->'technicalSkills'->'testing', '[]'::jsonb)) > 0 THEN
    completed_sections := completed_sections + 1;
  END IF;
  
  IF jsonb_array_length(COALESCE(data->'experience', '[]'::jsonb)) > 0 THEN
    completed_sections := completed_sections + 1;
  END IF;
  
  IF jsonb_array_length(COALESCE(data->'education', '[]'::jsonb)) > 0 THEN
    completed_sections := completed_sections + 1;
  END IF;
  
  -- Optional sections
  IF (sections->>'publications')::boolean = true THEN
    total_sections := total_sections + 1;
    IF jsonb_array_length(COALESCE(data->'publications', '[]'::jsonb)) > 0 THEN
      completed_sections := completed_sections + 1;
    END IF;
  END IF;
  
  IF (sections->>'openSource')::boolean = true THEN
    total_sections := total_sections + 1;
    IF jsonb_array_length(COALESCE(data->'openSource', '[]'::jsonb)) > 0 THEN
      completed_sections := completed_sections + 1;
    END IF;
  END IF;
  
  IF (sections->>'memberships')::boolean = true THEN
    total_sections := total_sections + 1;
    IF jsonb_array_length(COALESCE(data->'memberships', '[]'::jsonb)) > 0 THEN
      completed_sections := completed_sections + 1;
    END IF;
  END IF;
  
  IF (sections->>'portfolio')::boolean = true THEN
    total_sections := total_sections + 1;
    IF jsonb_array_length(COALESCE(data->'portfolio', '[]'::jsonb)) > 0 THEN
      completed_sections := completed_sections + 1;
    END IF;
  END IF;
  
  IF (sections->>'patents')::boolean = true THEN
    total_sections := total_sections + 1;
    IF jsonb_array_length(COALESCE(data->'patents', '[]'::jsonb)) > 0 THEN
      completed_sections := completed_sections + 1;
    END IF;
  END IF;
  
  RETURN ROUND((completed_sections::FLOAT / total_sections::FLOAT) * 100);
END;
$$ LANGUAGE plpgsql;

-- Update metadata with completion percentage trigger
CREATE OR REPLACE FUNCTION update_resume_metadata()
RETURNS TRIGGER AS $$
BEGIN
  NEW.metadata = jsonb_set(
    COALESCE(NEW.metadata, '{}'::jsonb),
    '{completion_percentage}',
    to_jsonb(calculate_resume_completion(NEW.resume_data, NEW.sections_enabled))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for metadata updates
DROP TRIGGER IF EXISTS update_resume_metadata_trigger ON user_resumes;
CREATE TRIGGER update_resume_metadata_trigger
  BEFORE INSERT OR UPDATE ON user_resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_resume_metadata();

-- Sample enhanced resume data structure (for reference)
INSERT INTO user_resumes (user_email, title, resume_data, sections_enabled) VALUES (
  'sample@testingvala.com',
  'Enhanced QA Resume Sample',
  '{
    "personal": {
      "name": "John Doe",
      "jobTitle": "Senior QA Engineer",
      "email": "john.doe@email.com",
      "phone": "+1 (555) 123-4567",
      "location": "San Francisco, CA",
      "linkedin": "https://linkedin.com/in/johndoe",
      "github": "https://github.com/johndoe",
      "portfolio": "https://johndoe.dev"
    },
    "summary": "Results-driven Senior QA Engineer with 8+ years of experience in manual and automated testing across web, mobile, and API platforms. Proven track record of implementing comprehensive testing strategies that reduced production bugs by 85% and improved release velocity by 40%.",
    "coreCompetencies": [
      "Test Strategy & Planning",
      "Quality Assurance Leadership",
      "Cross-functional Collaboration",
      "Process Improvement",
      "Risk Assessment",
      "Agile/Scrum Methodologies"
    ],
    "technicalSkills": {
      "testing": ["Manual Testing", "API Testing", "Performance Testing", "Security Testing"],
      "automation": ["Selenium WebDriver", "Playwright", "Cypress", "TestComplete"],
      "programming": ["Java", "Python", "JavaScript", "TypeScript"],
      "databases": ["MySQL", "PostgreSQL", "MongoDB"],
      "tools": ["JIRA", "TestRail", "Jenkins", "Docker", "Git"]
    },
    "experience": [
      {
        "company": "TechCorp Inc.",
        "role": "Senior QA Engineer",
        "duration": "2020 - Present",
        "location": "San Francisco, CA",
        "achievements": [
          "Led QA team of 5 engineers, implementing automated testing that reduced manual testing time by 60%",
          "Designed and executed comprehensive test strategies for 3 major product releases"
        ]
      }
    ],
    "projects": [
      {
        "title": "E-commerce Platform Testing Framework",
        "description": "Built comprehensive testing framework for high-traffic e-commerce platform",
        "technologies": "Selenium, Java, TestNG, Jenkins",
        "impact": "Reduced regression testing time from 2 weeks to 2 days"
      }
    ],
    "achievements": [
      {
        "title": "Quality Excellence Award",
        "organization": "TechCorp Inc.",
        "year": "2023",
        "description": "Recognized for implementing zero-defect release process"
      }
    ],
    "certifications": [
      {
        "name": "ISTQB Advanced Level Test Manager",
        "organization": "ISTQB",
        "year": "2022",
        "credentialId": "ISTQB-ATM-2022-001"
      }
    ],
    "education": [
      {
        "degree": "Bachelor of Science in Computer Science",
        "university": "University of California, Berkeley",
        "year": "2016",
        "gpa": "3.8/4.0"
      }
    ],
    "publications": [
      {
        "title": "Modern API Testing Strategies for Microservices",
        "publication": "Testing Magazine",
        "date": "2023-09",
        "url": "https://testingmag.com/api-testing-strategies",
        "type": "Article"
      }
    ],
    "openSource": [
      {
        "project": "TestUtils Library",
        "description": "Open-source testing utilities for web applications",
        "role": "Maintainer",
        "technologies": "JavaScript, Node.js",
        "url": "https://github.com/johndoe/testutils",
        "stars": 245
      }
    ],
    "memberships": [
      {
        "organization": "ISTQB (International Software Testing Qualifications Board)",
        "role": "Certified Member",
        "since": "2020",
        "level": "Advanced"
      }
    ],
    "portfolio": [
      {
        "title": "QA Process Optimization Case Study",
        "description": "Complete transformation of testing processes at Fortune 500 company",
        "url": "https://johndoe.dev/case-studies/qa-optimization",
        "type": "Case Study",
        "technologies": "Process Design, Automation, Metrics"
      }
    ],
    "patents": [
      {
        "title": "Automated Test Case Generation System",
        "patentNumber": "US10,123,456",
        "status": "Granted",
        "date": "2023-03-15",
        "description": "AI-powered system for generating comprehensive test cases from user stories"
      }
    ],
    "languages": [
      {
        "language": "English",
        "proficiency": "Native"
      },
      {
        "language": "Spanish",
        "proficiency": "Professional"
      }
    ],
    "volunteer": [
      {
        "organization": "Code for Good",
        "role": "QA Volunteer",
        "duration": "2021 - Present",
        "description": "Provide testing expertise for non-profit technology projects"
      }
    ]
  }',
  '{
    "publications": true,
    "openSource": true,
    "memberships": true,
    "portfolio": true,
    "patents": false,
    "achievements": true,
    "languages": true,
    "volunteer": true
  }'
) ON CONFLICT DO NOTHING;

COMMENT ON COLUMN user_resumes.sections_enabled IS 'JSONB object tracking which optional sections are enabled for this resume';
COMMENT ON FUNCTION calculate_resume_completion IS 'Calculates completion percentage based on filled sections';
COMMENT ON FUNCTION validate_resume_data IS 'Validates that resume data contains required sections';