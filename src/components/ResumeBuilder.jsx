import React, { useState } from 'react';
import { FileText, User, Target, Zap, Briefcase, FolderOpen, Award, GraduationCap, Globe, Heart, Download, X, ChevronRight, ChevronLeft, Eye, Shield, Plus, Trash2, CheckCircle2, Crown, Star, TrendingUp, Code, Settings, BookOpen, GitBranch, Users, ExternalLink, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { calculateResumeCompleteness } from '../lib/supabase';


const ResumeBuilder = ({ isOpen, onClose }) => {
  // Error boundary state
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Error handler
  const handleError = (error, context = 'Unknown') => {
    console.error(`ResumeBuilder Error (${context}):`, error);
    setErrorMessage(`${context}: ${error.message || error}`);
    setHasError(true);
    toast.error(`Error in ${context}. Please try again.`);
  };
  
  // Reset error state when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setHasError(false);
      setErrorMessage('');
    } else {
      // Clean up any empty drafts when closing
      try {
        const savedData = localStorage.getItem('testingvala_resume_draft');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          if (!hasSignificantData(parsed.formData)) {
            localStorage.removeItem('testingvala_resume_draft');
          }
        }
      } catch (error) {
        localStorage.removeItem('testingvala_resume_draft');
      }
    }
  }, [isOpen]);
  
  // Error boundary UI
  if (hasError) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-4">The resume builder encountered an error:</p>
          <div className="bg-gray-100 p-3 rounded-lg text-sm text-gray-700 mb-4 text-left">
            {errorMessage}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setHasError(false);
                setErrorMessage('');
              }}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
  const [userRole, setUserRole] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  
  const [formData, setFormData] = useState({
    personal: {
      name: '',
      jobTitle: 'QA Engineer',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      portfolio: ''
    },
    summary: '',
    competencies: [''],
    technicalSkills: {
      testing: [],
      automation: [],
      programming: [],
      databases: []
    },
    tools: {
      testManagement: [],
      automation: [],
      cicd: [],
      monitoring: []
    },
    experience: [{ company: '', role: '', duration: '', location: '', achievements: [''] }],
    projects: [{ title: '', description: '', technologies: '', impact: '', duration: '' }],
    achievements: [''],
    certifications: [{ name: '', organization: '', year: '', credentialId: '' }],
    education: [{ degree: '', university: '', location: '', year: '', gpa: '' }],
    awards: [{ title: '', organization: '', year: '', description: '' }],
    languages: [{ name: '', proficiency: '' }],
    volunteer: [{ organization: '', role: '', duration: '', description: '' }],
    publications: [{ title: '', type: '', platform: '', date: '', url: '', description: '' }],
    openSource: [{ project: '', role: '', technologies: '', url: '', description: '', contributions: '' }],
    memberships: [{ organization: '', role: '', year: '', certificationId: '', description: '' }],
    portfolio: [{ title: '', category: '', url: '', description: '', technologies: '' }],
    patents: [{ title: '', patentNumber: '', date: '', description: '', status: '' }]
  });

  const [collapsedSections, setCollapsedSections] = useState({
    publications: false,
    openSource: false,
    memberships: false,
    portfolio: false,
    patents: false
  });
  const [showPreview, setShowPreview] = useState(false);

  const steps = [
    { id: 'personal', title: 'Personal Info', icon: User },
    { id: 'summary', title: 'Professional Summary', icon: Target },
    { id: 'competencies', title: 'Core Competencies', icon: Star },
    { id: 'technicalSkills', title: 'Technical Skills', icon: Code },
    { id: 'tools', title: 'Tools & Technologies', icon: Settings },
    { id: 'experience', title: 'Work Experience', icon: Briefcase },
    { id: 'projects', title: 'Projects', icon: FolderOpen },
    { id: 'achievements', title: 'Achievements & Impact', icon: TrendingUp },
    { id: 'certifications', title: 'Certifications', icon: Award },
    { id: 'education', title: 'Education', icon: GraduationCap },
    { id: 'awards', title: 'Awards & Recognition', icon: Crown },
    { id: 'languages', title: 'Languages', icon: Globe },
    { id: 'volunteer', title: 'Volunteer Work', icon: Heart },
    { id: 'publications', title: 'Publications & Talks', icon: BookOpen },
    { id: 'openSource', title: 'Open Source Contributions', icon: GitBranch },
    { id: 'memberships', title: 'Professional Memberships', icon: Users },
    { id: 'portfolio', title: 'Portfolio & Case Studies', icon: ExternalLink },
    { id: 'patents', title: 'Patents & Innovations', icon: Lightbulb },
    { id: 'finalize', title: 'Download Resume', icon: Download }
  ];

  const templates = [
    { id: 'modern', name: 'Modern Professional', description: 'Enterprise-grade design with SF Pro typography, used by Fortune 500 companies' },
    { id: 'executive', name: 'Executive Premium', description: 'Sophisticated serif layout inspired by McKinsey & Goldman Sachs standards' },
    { id: 'ats', name: 'ATS Optimized', description: 'Clean Arial formatting for 99% ATS compatibility across all systems' },
    { id: 'creative', name: 'Creative Tech', description: 'Modern gradient design inspired by leading tech companies like Apple & Google' }
  ];

  const validQARoles = [
    'QA Engineer', 'Software Tester', 'Test Automation Engineer', 'SDET',
    'Quality Assurance Engineer', 'Automation Tester', 'Manual Tester', 'QA Analyst',
    'Test Engineer', 'Quality Engineer', 'Testing Specialist', 'QA Lead', 'QA Manager'
  ];

  const skillCategories = {
    testing: ['Manual Testing', 'Functional Testing', 'Regression Testing', 'Integration Testing', 'System Testing', 'User Acceptance Testing', 'Exploratory Testing', 'Black Box Testing', 'White Box Testing', 'API Testing', 'Performance Testing', 'Security Testing', 'Mobile Testing', 'Cross-browser Testing'],
    automation: ['Selenium WebDriver', 'Playwright', 'Cypress', 'TestComplete', 'Appium', 'Robot Framework', 'Katalon Studio', 'WebDriverIO', 'Puppeteer', 'TestCafe', 'Protractor'],
    programming: ['Java', 'Python', 'JavaScript', 'C#', 'TypeScript', 'SQL', 'HTML/CSS', 'Bash/Shell', 'PowerShell', 'Groovy'],
    databases: ['MySQL', 'PostgreSQL', 'MongoDB', 'Oracle', 'SQL Server', 'Redis', 'Cassandra', 'DynamoDB']
  };

  const toolCategories = {
    testManagement: ['JIRA', 'TestRail', 'Zephyr', 'qTest', 'PractiTest', 'TestLink', 'Azure Test Plans'],
    automation: ['Jenkins', 'GitLab CI', 'GitHub Actions', 'Azure DevOps', 'TeamCity', 'Bamboo', 'CircleCI'],
    cicd: ['Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Terraform', 'Ansible'],
    monitoring: ['Grafana', 'Prometheus', 'New Relic', 'Datadog', 'Splunk', 'ELK Stack']
  };

  const proficiencyLevels = ['Basic', 'Conversational', 'Fluent', 'Native'];

  const [validationErrors, setValidationErrors] = useState({});

  const validateField = (field, value, section = null) => {
    const errors = { ...validationErrors };
    const key = section ? `${section}.${field}` : field;
    
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      errors[key] = 'This field is required';
    } else {
      delete errors[key];
    }
    
    setValidationErrors(errors);
    return !errors[key];
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const errors = { ...validationErrors };
    
    if (email && typeof email === 'string' && !emailRegex.test(email.trim())) {
      errors['personal.email'] = 'Please enter a valid email address';
    } else {
      delete errors['personal.email'];
    }
    
    setValidationErrors(errors);
    return !errors['personal.email'];
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{7,15}$/;
    const errors = { ...validationErrors };
    
    if (phone && typeof phone === 'string' && !phoneRegex.test(phone.replace(/\s/g, ''))) {
      errors['personal.phone'] = 'Please enter a valid phone number';
    } else {
      delete errors['personal.phone'];
    }
    
    setValidationErrors(errors);
    return !errors['personal.phone'];
  };

  const handleRoleValidation = () => {
    try {
      if (!userRole || !userRole.trim()) {
        toast.error('Please enter your job role');
        return;
      }

      const normalizedUserRole = userRole.toLowerCase().trim();
      const isValidRole = validQARoles.some(role => {
        const normalizedRole = role.toLowerCase();
        return normalizedUserRole.includes(normalizedRole) ||
               normalizedRole.includes(normalizedUserRole) ||
               normalizedUserRole.replace(/\s+/g, '').includes(normalizedRole.replace(/\s+/g, '')) ||
               normalizedRole.replace(/\s+/g, '').includes(normalizedUserRole.replace(/\s+/g, ''));
      });

      if (isValidRole) {
        setIsValidated(true);
        setFormData(prev => ({
          ...prev,
          personal: { 
            ...prev.personal, 
            jobTitle: userRole.trim()
          }
        }));
        toast.success('✅ Role validated! Welcome to the QA Resume Builder');
      } else {
        toast.error('🚫 This exclusive builder is designed for QA/Test Engineers only. For other IT roles, please try our AI-powered Resume Builder for comprehensive support!');
      }
    } catch (error) {
      console.error('Role validation error:', error);
      toast.error('Validation failed. Please try again.');
    }
  };

  const addItem = (section, item = {}) => {
    try {
      const currentItems = formData[section];
      if (!Array.isArray(currentItems)) {
        console.error(`Section ${section} is not an array:`, currentItems);
        return;
      }
      
      if (currentItems.length >= 10) {
        toast.error('Maximum 10 items allowed per section');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        [section]: [...(prev[section] || []), item]
      }));
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item. Please try again.');
    }
  };

  const removeItem = (section, index) => {
    try {
      const currentItems = formData[section];
      if (!Array.isArray(currentItems)) {
        console.error(`Section ${section} is not an array:`, currentItems);
        return;
      }
      
      if (index < 0 || index >= currentItems.length) {
        console.error(`Invalid index ${index} for section ${section}`);
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        [section]: (prev[section] || []).filter((_, i) => i !== index)
      }));
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item. Please try again.');
    }
  };

  const updateItem = (section, index, field, value) => {
    try {
      const currentItems = formData[section];
      if (!Array.isArray(currentItems)) {
        console.error(`Section ${section} is not an array:`, currentItems);
        return;
      }
      
      if (index < 0 || index >= currentItems.length) {
        console.error(`Invalid index ${index} for section ${section}`);
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        [section]: (prev[section] || []).map((item, i) => 
          i === index ? { ...item, [field]: value } : item
        )
      }));
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item. Please try again.');
    }
  };

  const toggleSkill = (category, skill) => {
    try {
      if (!skill || typeof skill !== 'string') {
        console.error('Invalid skill:', skill);
        return;
      }
      
      setFormData(prev => {
        const currentSkills = prev.technicalSkills?.[category] || [];
        if (!Array.isArray(currentSkills)) {
          console.error(`Skills category ${category} is not an array:`, currentSkills);
          return prev;
        }
        
        return {
          ...prev,
          technicalSkills: {
            ...prev.technicalSkills,
            [category]: currentSkills.includes(skill)
              ? currentSkills.filter(s => s !== skill)
              : [...currentSkills, skill]
          }
        };
      });
    } catch (error) {
      console.error('Error toggling skill:', error);
      toast.error('Failed to update skill. Please try again.');
    }
  };

  const toggleTool = (category, tool) => {
    try {
      if (!tool || typeof tool !== 'string') {
        console.error('Invalid tool:', tool);
        return;
      }
      
      setFormData(prev => {
        const currentTools = prev.tools?.[category] || [];
        if (!Array.isArray(currentTools)) {
          console.error(`Tools category ${category} is not an array:`, currentTools);
          return prev;
        }
        
        return {
          ...prev,
          tools: {
            ...prev.tools,
            [category]: currentTools.includes(tool)
              ? currentTools.filter(t => t !== tool)
              : [...currentTools, tool]
          }
        };
      });
    } catch (error) {
      console.error('Error toggling tool:', error);
      toast.error('Failed to update tool. Please try again.');
    }
  };

  const downloadResume = async () => {
    try {
      // Final validation
      if (!formData.personal?.name || !formData.personal?.email) {
        toast.error('Please complete required fields (Name and Email)');
        setCurrentStep(0);
        return;
      }
      
      // Generate HTML content for the resume
      const resumeHTML = generateResumeHTML();
      
      if (!resumeHTML) {
        toast.error('Failed to generate resume. Please try again.');
        return;
      }
      
      // Save resume to database before download
      try {
        const { createResume, trackResumeExport } = await import('../lib/supabase');
        const resumeData = {
          title: `${formData.personal.name} - ${formData.personal.jobTitle}`,
          resume_data: formData,
          template_id: selectedTemplate,
          user_email: formData.personal.email,
          status: 'published',
          metadata: {
            completeness: calculateResumeCompleteness(formData),
            downloadedAt: new Date().toISOString()
          }
        };
        
        const savedResume = await createResume(resumeData);
        await trackResumeExport(savedResume.id, 'html', { template: selectedTemplate });
        
        // Clean up draft after successful save
        localStorage.removeItem('testingvala_resume_draft');
      } catch (saveError) {
        console.warn('Failed to save resume to database:', saveError);
        // Continue with download even if save fails
      }
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Please allow popups to download your resume.');
        return;
      }
      
      printWindow.document.write(resumeHTML);
      printWindow.document.close();
      
      // Add local download tracking as fallback
      try {
        const downloadData = {
          timestamp: new Date().toISOString(),
          template: selectedTemplate,
          userEmail: formData.personal.email,
          completeness: calculateResumeCompleteness(formData)
        };
        
        localStorage.setItem('testingvala_resume_download', JSON.stringify(downloadData));
      } catch (error) {
        console.error('Failed to save download tracking:', error);
      }
      
      // Trigger print dialog
      setTimeout(() => {
        try {
          printWindow.print();
        } catch (error) {
          console.error('Print failed:', error);
        }
      }, 500);
      
      toast.success('🎉 Your world-class QA resume is ready! Saved to your account and ready for download.');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download resume. Please try again.');
    }
  };

  const generateResumeHTML = () => {
    const template = templates.find(t => t.id === selectedTemplate);
    
    const getTemplateStyles = () => {
      switch (selectedTemplate) {
        case 'modern':
          return `
            :root {
              --primary-color: #1a365d;
              --secondary-color: #2c5282;
              --accent-color: #3182ce;
              --text-primary: #1a202c;
              --text-secondary: #4a5568;
              --text-muted: #718096;
              --border-color: #e2e8f0;
              --bg-accent: #f7fafc;
            }
            body { 
              font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
              font-size: 10.5pt;
              line-height: 1.4;
              color: var(--text-primary);
              font-feature-settings: 'kern' 1, 'liga' 1, 'calt' 1;
            }
            .header { 
              background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
              color: white;
              padding: 32pt 28pt;
              margin-bottom: 24pt;
              position: relative;
            }
            .header::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              height: 3pt;
              background: linear-gradient(90deg, #3182ce 0%, #63b3ed 100%);
            }
            .name { 
              font-size: 28pt;
              font-weight: 700;
              letter-spacing: -0.5pt;
              line-height: 1.1;
              margin-bottom: 6pt;
            }
            .title { 
              font-size: 14pt;
              font-weight: 500;
              opacity: 0.95;
              letter-spacing: 0.25pt;
            }
            .contact { 
              font-size: 9.5pt;
              margin-top: 16pt;
              opacity: 0.9;
            }
            .section-title { 
              color: var(--primary-color);
              font-size: 11pt;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1pt;
              border-bottom: 2pt solid var(--primary-color);
              padding-bottom: 4pt;
              margin: 20pt 0 12pt 0;
            }
          `;
        case 'executive':
          return `
            :root {
              --primary-color: #2d3748;
              --secondary-color: #4a5568;
              --accent-color: #d69e2e;
              --text-primary: #1a202c;
              --text-secondary: #4a5568;
              --text-muted: #718096;
              --border-color: #e2e8f0;
              --bg-accent: #fefefe;
            }
            body { 
              font-family: 'Minion Pro', 'Adobe Garamond Pro', 'Times New Roman', serif;
              font-size: 11pt;
              line-height: 1.45;
              color: var(--text-primary);
            }
            .header { 
              border-left: 6pt solid var(--accent-color);
              padding: 28pt 0 28pt 32pt;
              margin-bottom: 32pt;
              background: linear-gradient(to right, rgba(214, 158, 46, 0.03) 0%, transparent 100%);
            }
            .name { 
              font-size: 32pt;
              font-weight: 400;
              color: var(--primary-color);
              line-height: 1.1;
              letter-spacing: -0.5pt;
              margin-bottom: 8pt;
            }
            .title { 
              font-size: 16pt;
              color: var(--accent-color);
              font-weight: 500;
              font-style: italic;
              letter-spacing: 0.25pt;
            }
            .contact { 
              font-size: 10pt;
              margin-top: 20pt;
              color: var(--text-secondary);
            }
            .section-title { 
              color: var(--primary-color);
              font-size: 10pt;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1.5pt;
              border-bottom: 1.5pt solid var(--accent-color);
              padding-bottom: 6pt;
              margin: 24pt 0 16pt 0;
            }
          `;
        case 'ats':
          return `
            :root {
              --primary-color: #000000;
              --secondary-color: #333333;
              --accent-color: #555555;
              --text-primary: #000000;
              --text-secondary: #333333;
              --text-muted: #666666;
              --border-color: #cccccc;
              --bg-accent: #ffffff;
            }
            body { 
              font-family: 'Arial', 'Helvetica', sans-serif;
              font-size: 11pt;
              line-height: 1.4;
              color: var(--text-primary);
            }
            .header { 
              border-bottom: 2pt solid var(--primary-color);
              padding-bottom: 16pt;
              margin-bottom: 20pt;
            }
            .name { 
              font-size: 20pt;
              font-weight: bold;
              color: var(--primary-color);
              margin-bottom: 4pt;
            }
            .title { 
              font-size: 12pt;
              color: var(--secondary-color);
              font-weight: bold;
            }
            .contact { 
              font-size: 10pt;
              margin-top: 12pt;
              color: var(--text-secondary);
            }
            .section-title { 
              color: var(--primary-color);
              font-size: 10pt;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.5pt;
              border-bottom: 1pt solid var(--primary-color);
              padding-bottom: 3pt;
              margin: 16pt 0 10pt 0;
            }
          `;
        case 'creative':
          return `
            :root {
              --primary-color: #553c9a;
              --secondary-color: #7c3aed;
              --accent-color: #a855f7;
              --text-primary: #1f2937;
              --text-secondary: #4b5563;
              --text-muted: #6b7280;
              --border-color: #e5e7eb;
              --bg-accent: #faf5ff;
            }
            body { 
              font-family: 'Avenir Next', 'Helvetica Neue', 'Segoe UI', sans-serif;
              font-size: 10.5pt;
              line-height: 1.4;
              color: var(--text-primary);
              font-feature-settings: 'kern' 1, 'liga' 1;
            }
            .header { 
              background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 50%, var(--accent-color) 100%);
              color: white;
              padding: 36pt 32pt;
              margin-bottom: 28pt;
              position: relative;
              border-radius: 8pt;
            }
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              right: 0;
              width: 120pt;
              height: 120pt;
              background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
              border-radius: 50%;
            }
            .name { 
              font-size: 30pt;
              font-weight: 600;
              letter-spacing: -0.75pt;
              line-height: 1.1;
              margin-bottom: 8pt;
            }
            .title { 
              font-size: 15pt;
              font-weight: 400;
              opacity: 0.95;
              letter-spacing: 0.5pt;
            }
            .contact { 
              font-size: 10pt;
              margin-top: 18pt;
              opacity: 0.9;
            }
            .section-title { 
              background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              font-size: 11pt;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1pt;
              margin: 22pt 0 14pt 0;
              position: relative;
            }
            .section-title::after {
              content: '';
              position: absolute;
              bottom: -4pt;
              left: 0;
              width: 40pt;
              height: 2pt;
              background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
            }
          `;
        default:
          return '';
      }
    };
    
    const escapeHtml = (text) => {
      if (!text) return '';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };
    
    const safeName = escapeHtml(formData.personal?.name || 'Professional Resume');
    const safeJobTitle = escapeHtml(formData.personal?.jobTitle || 'Professional');
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${safeName} - ${safeJobTitle}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        ${getTemplateStyles()}
        
        body {
          background: white;
          margin: 0;
          padding: 0;
        }
        
        .resume {
          max-width: 8.5in;
          margin: 0 auto;
          padding: 0.75in;
          background: white;
          min-height: 11in;
          box-sizing: border-box;
        }
        
        .contact {
          display: flex;
          flex-wrap: wrap;
          gap: 16pt;
        }
        
        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        
        .section {
          margin-bottom: 18pt;
          page-break-inside: avoid;
        }
        
        .content {
          line-height: 1.45;
        }
        
        .item {
          margin-bottom: 14pt;
          page-break-inside: avoid;
        }
        
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 4pt;
        }
        
        .item-title {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 11pt;
          line-height: 1.3;
        }
        
        .item-subtitle {
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 10pt;
          font-style: italic;
        }
        
        .item-details {
          color: var(--text-muted);
          font-size: 9pt;
          margin-bottom: 6pt;
        }
        
        .achievement {
          margin-left: 12pt;
          position: relative;
          margin-bottom: 3pt;
          font-size: 10pt;
          line-height: 1.4;
        }
        
        .achievement:before {
          content: '•';
          position: absolute;
          left: -10pt;
          color: var(--accent-color);
          font-weight: bold;
          font-size: 12pt;
        }
        
        .skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180pt, 1fr));
          gap: 14pt;
        }
        
        .skill-category {
          margin-bottom: 10pt;
        }
        
        .skill-category-title {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 6pt;
          font-size: 9.5pt;
        }
        
        .skills {
          display: flex;
          flex-wrap: wrap;
          gap: 4pt;
        }
        
        .skill {
          background: var(--bg-accent);
          color: var(--text-primary);
          padding: 3pt 8pt;
          border-radius: 12pt;
          font-size: 8.5pt;
          font-weight: 500;
          border: 0.5pt solid var(--border-color);
        }
        
        .two-column {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24pt;
        }
        
        .impact-highlight {
          color: var(--accent-color);
          font-weight: 600;
          font-size: 10pt;
          margin-top: 4pt;
        }
        
        .footer {
          text-align: center;
          margin-top: 28pt;
          padding-top: 14pt;
          border-top: 0.5pt solid var(--border-color);
          font-size: 8pt;
          color: var(--text-muted);
        }
        
        /* Print Styles */
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          body {
            margin: 0;
            padding: 0;
          }
          
          .resume {
            margin: 0;
            padding: 0.5in;
            box-shadow: none;
            max-width: none;
            width: 100%;
          }
          
          .section {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .item {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .header {
            page-break-after: avoid;
          }
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          .resume {
            padding: 16pt;
          }
          
          .two-column {
            grid-template-columns: 1fr;
            gap: 16pt;
          }
          
          .item-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .skills-grid {
            grid-template-columns: 1fr;
          }
        }
        
        /* Editable Styles */
        [contenteditable="true"] {
          outline: none;
          transition: all 0.2s ease;
        }
        
        [contenteditable="true"]:hover {
          background-color: rgba(59, 130, 246, 0.05);
          border-radius: 0.25rem;
        }
        
        [contenteditable="true"]:focus {
          background-color: rgba(59, 130, 246, 0.1);
          border-radius: 0.25rem;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
      </style>
    </head>
    <body>
      <div class="resume">
        <!-- Header -->
        <div class="header">
          <div class="name" contenteditable="true">${escapeHtml(formData.personal?.name || 'Your Name')}</div>
          <div class="title" contenteditable="true">${escapeHtml(formData.personal?.jobTitle || 'Professional')}</div>
          <div class="contact">
            ${formData.personal?.email ? `<div class="contact-item" contenteditable="true">✉ ${escapeHtml(formData.personal.email)}</div>` : ''}
            ${formData.personal?.phone ? `<div class="contact-item" contenteditable="true">📞 ${escapeHtml(formData.personal.phone)}</div>` : ''}
            ${formData.personal?.location ? `<div class="contact-item" contenteditable="true">📍 ${escapeHtml(formData.personal.location)}</div>` : ''}
            ${formData.personal?.linkedin ? `<div class="contact-item" contenteditable="true">💼 ${escapeHtml(formData.personal.linkedin)}</div>` : ''}
            ${formData.personal?.github ? `<div class="contact-item" contenteditable="true">🔗 ${escapeHtml(formData.personal.github)}</div>` : ''}
          </div>
        </div>

        ${formData.summary ? `
        <div class="section">
          <div class="section-title">Professional Summary</div>
          <div class="content" contenteditable="true">${escapeHtml(formData.summary)}</div>
        </div>` : ''}

        ${Array.isArray(formData.competencies) && formData.competencies.some(c => c && c.trim()) ? `
        <div class="section">
          <div class="section-title">Core Competencies</div>
          <div class="content">
            <div class="skills">
              ${formData.competencies.filter(c => c && c.trim()).map(comp => `<span class="skill" contenteditable="true">${escapeHtml(comp)}</span>`).join('')}
            </div>
          </div>
        </div>` : ''}

        ${Object.values(formData.technicalSkills).some(arr => arr.length > 0) ? `
        <div class="section">
          <div class="section-title">Technical Skills</div>
          <div class="content">
            <div class="skills-grid">
              ${Object.entries(formData.technicalSkills).map(([category, skills]) => 
                skills.length > 0 ? `
                <div class="skill-category">
                  <div class="skill-category-title">${category === 'testing' ? 'Testing Methodologies' : category === 'automation' ? 'Automation Frameworks' : category === 'programming' ? 'Programming Languages' : 'Database Technologies'}</div>
                  <div class="skills">
                    ${skills.map(skill => `<span class="skill" contenteditable="true">${skill}</span>`).join('')}
                  </div>
                </div>` : ''
              ).join('')}
            </div>
          </div>
        </div>` : ''}

        ${Object.values(formData.tools).some(arr => arr.length > 0) ? `
        <div class="section">
          <div class="section-title">Tools & Technologies</div>
          <div class="content">
            <div class="skills-grid">
              ${Object.entries(formData.tools).map(([category, tools]) => 
                tools.length > 0 ? `
                <div class="skill-category">
                  <div class="skill-category-title">${category === 'testManagement' ? 'Test Management' : category === 'automation' ? 'CI/CD & Automation' : category === 'cicd' ? 'Cloud & Infrastructure' : 'Monitoring & Analytics'}</div>
                  <div class="skills">
                    ${tools.map(tool => `<span class="skill" contenteditable="true">${tool}</span>`).join('')}
                  </div>
                </div>` : ''
              ).join('')}
            </div>
          </div>
        </div>` : ''}

        ${formData.experience.some(exp => exp.company) ? `
        <div class="section">
          <div class="section-title">Professional Experience</div>
          <div class="content">
            ${formData.experience.map(exp => 
              exp.company ? `
              <div class="item">
                <div class="item-header">
                  <div>
                    <div class="item-title" contenteditable="true">${exp.role}</div>
                    <div class="item-subtitle" contenteditable="true">${exp.company}</div>
                  </div>
                  <div class="item-details" contenteditable="true">${exp.duration}${exp.location ? ' • ' + exp.location : ''}</div>
                </div>
                ${exp.achievements.filter(a => a.trim()).map(achievement => 
                  `<div class="achievement" contenteditable="true">${achievement}</div>`
                ).join('')}
              </div>` : ''
            ).join('')}
          </div>
        </div>` : ''}

        ${formData.projects.some(proj => proj.title) ? `
        <div class="section">
          <div class="section-title">Key Projects</div>
          <div class="content">
            ${formData.projects.map(proj => 
              proj.title ? `
              <div class="item">
                <div class="item-header">
                  <div class="item-title" contenteditable="true">${proj.title}</div>
                  <div class="item-details" contenteditable="true">${proj.duration || ''}</div>
                </div>
                ${proj.description ? `<div contenteditable="true">${proj.description}</div>` : ''}
                ${proj.technologies ? `<div class="item-details" contenteditable="true"><strong>Technologies:</strong> ${proj.technologies}</div>` : ''}
                ${proj.impact ? `<div class="impact-highlight" contenteditable="true">Impact: ${proj.impact}</div>` : ''}
              </div>` : ''
            ).join('')}
          </div>
        </div>` : ''}

        ${formData.achievements.some(a => a.trim()) ? `
        <div class="section">
          <div class="section-title">Key Achievements</div>
          <div class="content">
            ${formData.achievements.filter(a => a.trim()).map(achievement => 
              `<div class="achievement" contenteditable="true">${achievement}</div>`
            ).join('')}
          </div>
        </div>` : ''}

        <div class="two-column">
          <div>
            ${formData.certifications.some(cert => cert.name) ? `
            <div class="section">
              <div class="section-title">Certifications</div>
              <div class="content">
                ${formData.certifications.map(cert => 
                  cert.name ? `
                  <div class="item">
                    <div class="item-title" contenteditable="true">${cert.name}</div>
                    <div class="item-details" contenteditable="true">${cert.organization}${cert.year ? ' • ' + cert.year : ''}${cert.credentialId ? ' • ID: ' + cert.credentialId : ''}</div>
                  </div>` : ''
                ).join('')}
              </div>
            </div>` : ''}

            ${formData.education.some(edu => edu.degree) ? `
            <div class="section">
              <div class="section-title">Education</div>
              <div class="content">
                ${formData.education.map(edu => 
                  edu.degree ? `
                  <div class="item">
                    <div class="item-title" contenteditable="true">${edu.degree}</div>
                    <div class="item-subtitle" contenteditable="true">${edu.university}</div>
                    <div class="item-details" contenteditable="true">${edu.location}${edu.year ? ' • ' + edu.year : ''}${edu.gpa ? ' • GPA: ' + edu.gpa : ''}</div>
                  </div>` : ''
                ).join('')}
              </div>
            </div>` : ''}
          </div>

          <div>
            ${formData.languages.some(lang => lang.name) ? `
            <div class="section">
              <div class="section-title">Languages</div>
              <div class="content">
                <div class="skills">
                  ${formData.languages.map(lang => 
                    lang.name ? `<span class="skill" contenteditable="true">${lang.name}${lang.proficiency ? ' (' + lang.proficiency + ')' : ''}</span>` : ''
                  ).join('')}
                </div>
              </div>
            </div>` : ''}

            ${formData.awards.some(award => award.title) ? `
            <div class="section">
              <div class="section-title">Awards & Recognition</div>
              <div class="content">
                ${formData.awards.map(award => 
                  award.title ? `
                  <div class="item">
                    <div class="item-title" contenteditable="true">${award.title}</div>
                    <div class="item-details" contenteditable="true">${award.organization}${award.year ? ' • ' + award.year : ''}</div>
                    ${award.description ? `<div contenteditable="true">${award.description}</div>` : ''}
                  </div>` : ''
                ).join('')}
              </div>
            </div>` : ''}

            ${formData.memberships.some(mem => mem.organization) ? `
            <div class="section">
              <div class="section-title">Professional Memberships</div>
              <div class="content">
                ${formData.memberships.map(mem => 
                  mem.organization ? `
                  <div class="item">
                    <div class="item-title" contenteditable="true">${mem.organization}</div>
                    <div class="item-details" contenteditable="true">${mem.role}${mem.year ? ' • ' + mem.year : ''}</div>
                  </div>` : ''
                ).join('')}
              </div>
            </div>` : ''}
          </div>
        </div>

        ${formData.publications.some(pub => pub.title) ? `
        <div class="section">
          <div class="section-title">Publications & Speaking</div>
          <div class="content">
            ${formData.publications.map(pub => 
              pub.title ? `
              <div class="item">
                <div class="item-title" contenteditable="true">${pub.title}</div>
                <div class="item-details" contenteditable="true">${pub.type}${pub.platform ? ' • ' + pub.platform : ''}${pub.date ? ' • ' + pub.date : ''}</div>
                ${pub.url ? `<div class="item-details" contenteditable="true">🔗 ${pub.url}</div>` : ''}
                ${pub.description ? `<div contenteditable="true">${pub.description}</div>` : ''}
              </div>` : ''
            ).join('')}
          </div>
        </div>` : ''}

        ${formData.openSource.some(os => os.project) ? `
        <div class="section">
          <div class="section-title">Open Source Contributions</div>
          <div class="content">
            ${formData.openSource.map(os => 
              os.project ? `
              <div class="item">
                <div class="item-title" contenteditable="true">${os.project}</div>
                <div class="item-details" contenteditable="true">${os.role}${os.technologies ? ' • ' + os.technologies : ''}</div>
                ${os.url ? `<div class="item-details" contenteditable="true">🔗 ${os.url}</div>` : ''}
                ${os.contributions ? `<div contenteditable="true">${os.contributions}</div>` : ''}
              </div>` : ''
            ).join('')}
          </div>
        </div>` : ''}

        <!-- Footer -->
        <div class="footer">
          <div>Generated by TestingVala Resume Builder • Template: ${template?.name || 'Modern Professional'}</div>
          <div style="margin-top: 0.25rem; font-size: 0.6875rem;">💡 This resume is fully editable - click on any text to modify it directly</div>
        </div>
      </div>
      
      <script>
        // Enhanced client-side management
        document.addEventListener('DOMContentLoaded', function() {
          let resumeData = {};
          let saveTimeout;
          let changeCount = 0;
          
          // Initialize resume data
          function initializeResumeData() {
            const elements = document.querySelectorAll('[contenteditable="true"]');
            elements.forEach(el => {
              const id = el.dataset.field || el.className.split(' ')[0];
              resumeData[id] = el.textContent;
            });
          }
          
          // Auto-save functionality with visual feedback
          function autoSave() {
            localStorage.setItem('testingvala_resume_' + Date.now(), JSON.stringify(resumeData));
            showSaveIndicator();
          }
          
          function showSaveIndicator() {
            let indicator = document.getElementById('save-indicator');
            if (!indicator) {
              indicator = document.createElement('div');
              indicator.id = 'save-indicator';
              indicator.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 8px 16px; border-radius: 6px; font-size: 12px; z-index: 10000; transition: all 0.3s ease;';
              document.body.appendChild(indicator);
            }
            indicator.textContent = '✓ Auto-saved';
            indicator.style.opacity = '1';
            setTimeout(() => {
              indicator.style.opacity = '0';
            }, 2000);
          }
          
          // Enhanced input handling
          document.addEventListener('input', function(e) {
            if (e.target.contentEditable === 'true') {
              const id = e.target.dataset.field || e.target.className.split(' ')[0];
              resumeData[id] = e.target.textContent;
              changeCount++;
              
              clearTimeout(saveTimeout);
              saveTimeout = setTimeout(autoSave, 1500);
              
              // Update character count for long fields
              updateCharacterCount(e.target);
            }
          });
          
          // Character count for text areas
          function updateCharacterCount(element) {
            if (element.textContent.length > 500) {
              let counter = element.nextElementSibling;
              if (!counter || !counter.classList.contains('char-counter')) {
                counter = document.createElement('div');
                counter.className = 'char-counter';
                counter.style.cssText = 'font-size: 11px; color: #6b7280; text-align: right; margin-top: 4px;';
                element.parentNode.insertBefore(counter, element.nextSibling);
              }
              counter.textContent = element.textContent.length + ' characters';
            }
          }
          
          // Prevent line breaks in single-line fields
          document.querySelectorAll('.name, .title, .item-title, .item-subtitle, .item-details, .skill').forEach(el => {
            el.addEventListener('keydown', function(e) {
              if (e.key === 'Enter') {
                e.preventDefault();
                this.blur();
              }
            });
          });
          
          // Enhanced visual feedback
          document.querySelectorAll('[contenteditable="true"]').forEach(el => {
            el.addEventListener('focus', function() {
              this.dataset.originalText = this.textContent;
              this.style.outline = '2px solid rgba(59, 130, 246, 0.3)';
            });
            
            el.addEventListener('blur', function() {
              this.style.outline = 'none';
              if (this.textContent !== this.dataset.originalText) {
                this.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
                this.style.transition = 'background-color 0.3s ease';
                setTimeout(() => {
                  this.style.backgroundColor = '';
                }, 1500);
              }
            });
          });
          
          // Export functionality
          function exportResume() {
            const resumeHtml = document.documentElement.outerHTML;
            const blob = new Blob([resumeHtml], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'resume_' + new Date().toISOString().split('T')[0] + '.html';
            a.click();
            URL.revokeObjectURL(url);
          }
          
          // Add export button
          const exportBtn = document.createElement('button');
          exportBtn.textContent = '💾 Export HTML';
          exportBtn.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: #3b82f6; color: white; padding: 12px 20px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); z-index: 10000;';
          exportBtn.onclick = exportResume;
          document.body.appendChild(exportBtn);
          
          // Initialize
          initializeResumeData();
          
          // Add keyboard shortcuts
          document.addEventListener('keydown', function(e) {
            if (e.ctrlKey || e.metaKey) {
              if (e.key === 's') {
                e.preventDefault();
                autoSave();
              } else if (e.key === 'e') {
                e.preventDefault();
                exportResume();
              }
            }
          });
        });
      </script>
    </body>
    </html>
    `;
  };

  const toggleSection = (sectionId) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const validateCurrentStep = () => {
    const currentStepId = steps[currentStep]?.id;
    
    try {
      switch (currentStepId) {
        case 'personal':
          if (!formData.personal?.name || !formData.personal.name.trim()) {
            toast.error('Name is required');
            return false;
          }
          if (!formData.personal?.email || !formData.personal.email.trim()) {
            toast.error('Email is required');
            return false;
          }
          return validateEmail(formData.personal.email);
        
        case 'summary':
          if (!formData.summary || !formData.summary.trim()) {
            toast.error('Professional summary is recommended');
            return true; // Allow to proceed but warn
          }
          if (formData.summary.length < 50) {
            toast.error('Summary should be at least 50 characters');
            return false;
          }
          return true;
        
        case 'experience':
          const hasValidExp = formData.experience && Array.isArray(formData.experience) && 
            formData.experience.some(exp => exp && exp.company && exp.company.trim() && exp.role && exp.role.trim());
          if (!hasValidExp) {
            toast.error('At least one work experience is required');
            return false;
          }
          return true;
        
        default:
          return true;
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Validation failed. Please check your input.');
      return false;
    }
  };

  const hasSignificantData = (data) => {
    if (!data || typeof data !== 'object') return false;
    
    // Check for meaningful personal information (name OR email required)
    const hasPersonalInfo = (data.personal?.name?.trim() && data.personal.name.trim().length > 2) ||
                           (data.personal?.email?.trim() && data.personal.email.includes('@'));
    
    // Check for any substantial content (less strict requirements)
    const hasSummary = data.summary?.trim() && data.summary.trim().length > 50;
    
    // Check for work experience (company OR role required)
    const hasExperience = data.experience && Array.isArray(data.experience) && 
      data.experience.some(exp => 
        (exp.company?.trim() && exp.company.trim().length > 2) ||
        (exp.role?.trim() && exp.role.trim().length > 2)
      );
    
    // Check for skills (at least 1 skill)
    const hasSkills = data.technicalSkills && Object.values(data.technicalSkills).some(arr => 
      Array.isArray(arr) && arr.length >= 1
    );
    
    // Check for competencies (at least 1 meaningful competency)
    const hasCompetencies = data.competencies && Array.isArray(data.competencies) && 
      data.competencies.filter(comp => comp?.trim() && comp.trim().length > 3).length >= 1;
    
    // Require personal info AND at least ONE substantial section
    const substantialSections = [hasSummary, hasExperience, hasSkills, hasCompetencies].filter(Boolean).length;
    return hasPersonalInfo && substantialSections >= 1;
  };

  // Simplified auto-save functionality - localStorage only
  React.useEffect(() => {
    if (!isValidated) return;
    
    const timeoutId = setTimeout(() => {
      try {
        if (hasSignificantData(formData)) {
          // Save to localStorage with timestamp
          localStorage.setItem('testingvala_resume_draft', JSON.stringify({
            formData, 
            selectedTemplate, 
            currentStep, 
            timestamp: Date.now()
          }));
        } else {
          // Clean up if data is not significant
          localStorage.removeItem('testingvala_resume_draft');
        }
      } catch (error) {
        console.error('Auto-save error:', error);
      }
    }, 3000); // Debounce for 3 seconds
    
    return () => clearTimeout(timeoutId);
  }, [formData, selectedTemplate, currentStep, isValidated]);

  // Clear all drafts on mount - no popups
  React.useEffect(() => {
    localStorage.removeItem('testingvala_resume_draft');
  }, []);

  if (!isOpen) return null;
  
  // Wrap all operations in try-catch
  try {

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-2 sm:p-4 pt-20">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-[98vw] sm:max-w-[95vw] lg:max-w-6xl h-[85vh] sm:h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-3 sm:p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 sm:w-8 sm:h-8" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg lg:text-2xl font-bold flex items-center gap-1 sm:gap-2">
                  <span className="hidden sm:inline">World's #1 QA Resume Builder</span>
                  <span className="sm:hidden">Resume Builder</span>
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-300" />
                </h2>
                <p className="text-xs sm:text-sm text-blue-100">Professional • ATS-Optimized • Industry-Leading Quality</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>



        {/* QA Role Validation */}
        {!isValidated && builderType === 'static' && (
          <div className="p-4 sm:p-8 lg:p-12 text-center bg-gradient-to-br from-blue-50 to-white flex-1 overflow-y-auto">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-xl">
              <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">🚀 Welcome to QA Resume Builder</h3>
              <p className="text-base sm:text-lg text-gray-600 mb-1 sm:mb-2">Professional resume builder designed for QA professionals</p>
              <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">Join thousands of QA engineers who've built their careers with us</p>
              
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-4 sm:mb-8">
                <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Verify Your QA Role</h4>
                <input
                  type="text"
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  placeholder="e.g., QA Engineer, Software Tester, SDET, Automation Engineer"
                  className="w-full px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-2 border-blue-200 rounded-lg sm:rounded-xl text-sm sm:text-base lg:text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4 sm:mb-6"
                />

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setBuilderType('')}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base lg:text-lg hover:bg-gray-300 transition-all duration-300"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleRoleValidation}
                    disabled={!userRole.trim()}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base lg:text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 sm:gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                    Validate & Start
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
                {validQARoles.slice(0, 8).map(role => (
                  <div key={role} className="bg-blue-50 text-blue-700 px-2 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-center">
                    {role}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Builder Interface */}
        {isValidated && (
          <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
            {/* Left Sidebar */}
            <div className="w-full lg:w-80 bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-200 p-2 sm:p-3 overflow-y-auto flex-shrink-0">
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-2">Resume Sections</h3>
                <div className="text-xs text-gray-500">Step {currentStep + 1} of {steps.length}</div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1 sm:gap-2 lg:space-y-2 lg:block">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === index;
                  const isCompleted = currentStep > index;
                  
                  return (
                    <div
                      key={step.id}
                      className={`flex items-center gap-1 sm:gap-2 lg:gap-3 p-2 sm:p-3 rounded-lg lg:rounded-xl cursor-pointer transition-all ${
                        isActive 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : isCompleted
                          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={() => setCurrentStep(index)}
                    >
                      <div className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-md lg:rounded-lg flex items-center justify-center ${
                        isActive ? 'bg-white/20' : isCompleted ? 'bg-blue-100' : 'bg-gray-200'
                      }`}>
                        <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${isActive ? 'text-white' : isCompleted ? 'text-blue-600' : 'text-gray-500'}`} />
                      </div>
                      <span className="font-medium text-xs sm:text-sm lg:block hidden lg:inline">{step.title}</span>
                      {isCompleted && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full ml-auto" />}
                    </div>
                  );
                })}
              </div>

              {/* Template Selection */}
              <div className="mt-8">
                <h4 className="font-bold text-gray-900 mb-4">Choose Template</h4>
                <div className="space-y-3">
                  {templates.map(template => (
                    <div
                      key={template.id}
                      className={`p-4 rounded-xl cursor-pointer border-2 transition-all ${
                        selectedTemplate === template.id
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                      }`}
                      onClick={() => {
                        setSelectedTemplate(template.id);
                        toast.success(`✨ ${template.name} template selected`);
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold text-gray-900 text-sm">{template.name}</h5>
                        {selectedTemplate === template.id && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600">{template.description}</p>
                    </div>
                  ))}
                </div>
                
                {/* Template Customization */}
                <div className="mt-6 p-4 bg-gray-100 rounded-xl">
                  <h5 className="font-semibold text-gray-900 text-sm mb-3">Template Settings</h5>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Font Size</label>
                      <select className="w-full text-xs p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500">
                        <option value="small">Small (12px)</option>
                        <option value="medium" selected>Medium (14px)</option>
                        <option value="large">Large (16px)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Spacing</label>
                      <select className="w-full text-xs p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500">
                        <option value="compact">Compact</option>
                        <option value="normal" selected>Normal</option>
                        <option value="relaxed">Relaxed</option>
                      </select>
                    </div>
                    <button className="w-full bg-gray-600 text-white py-2 px-3 rounded-md text-xs font-medium hover:bg-gray-700 transition-colors">
                      Apply Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Form Area */}
            <div className="flex-1 p-3 sm:p-4 overflow-y-auto min-h-0">
              {/* Personal Info */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={formData.personal.name}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personal: { ...prev.personal, name: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Professional Title *</label>
                      <input
                        type="text"
                        value={formData.personal.jobTitle}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personal: { ...prev.personal, jobTitle: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Senior QA Engineer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                      <input
                        type="email"
                        value={formData.personal.email}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            personal: { ...prev.personal, email: value }
                          }));
                          validateEmail(value);
                        }}
                        onBlur={(e) => validateEmail(e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                          validationErrors['personal.email'] ? 'border-red-300 focus:border-red-500' : 'border-blue-200'
                        }`}
                        placeholder="john.doe@email.com"
                      />
                      {validationErrors['personal.email'] && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors['personal.email']}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.personal.phone}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personal: { ...prev.personal, phone: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        value={formData.personal.location}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personal: { ...prev.personal, location: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="San Francisco, CA"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">LinkedIn Profile</label>
                      <input
                        type="url"
                        value={formData.personal.linkedin}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personal: { ...prev.personal, linkedin: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="https://linkedin.com/in/johndoe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">GitHub Profile</label>
                      <input
                        type="url"
                        value={formData.personal.github}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personal: { ...prev.personal, github: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="https://github.com/johndoe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Portfolio Website</label>
                      <input
                        type="url"
                        value={formData.personal.portfolio}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personal: { ...prev.personal, portfolio: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="https://johndoe.dev"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Professional Summary */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">Professional Summary</h3>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Impact-Driven Career Summary</label>
                    <p className="text-sm text-gray-500 mb-3">Write a compelling summary highlighting your QA expertise, quantifiable achievements, and career impact (3-4 sentences)</p>
                    <textarea
                      value={formData.summary}
                      onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                      rows="6"
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Results-driven QA Engineer with 5+ years of experience in manual and automated testing. Led testing initiatives that reduced production bugs by 40% and improved release velocity by 60%. Expertise in test automation frameworks, CI/CD integration, and cross-functional collaboration. Proven track record of mentoring teams and implementing quality processes that scale with business growth."
                    />
                    <div className="text-right text-sm text-gray-500 mt-1">
                      {formData.summary.length} characters
                    </div>
                  </div>
                </div>
              )}

              {/* Core Competencies */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">Core Competencies / Areas of Expertise</h3>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Key Competencies</label>
                    <p className="text-sm text-gray-500 mb-4">Add your core areas of expertise (e.g., Test Strategy, Quality Assurance, Team Leadership)</p>
                    {formData.competencies.map((competency, index) => (
                      <div key={index} className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={competency}
                          onChange={(e) => {
                            const newCompetencies = [...formData.competencies];
                            newCompetencies[index] = e.target.value;
                            setFormData(prev => ({ ...prev, competencies: newCompetencies }));
                          }}
                          className="flex-1 px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Test Strategy & Planning"
                        />
                        {formData.competencies.length > 1 && (
                          <button
                            onClick={() => removeItem('competencies', index)}
                            className="text-red-500 hover:text-red-700 px-2"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addItem('competencies', '')}
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Competency
                    </button>
                  </div>
                </div>
              )}

              {/* Technical Skills */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">Technical Skills</h3>
                  {Object.entries(skillCategories).map(([category, skills]) => (
                    <div key={category} className="bg-white border-2 border-blue-100 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                        {category === 'testing' ? 'Testing Methodologies' : 
                         category === 'automation' ? 'Automation Frameworks' :
                         category === 'programming' ? 'Programming Languages' : 'Database Technologies'}
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                        {skills.map(skill => (
                          <label key={skill} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-blue-50">
                            <input
                              type="checkbox"
                              checked={formData.technicalSkills[category].includes(skill)}
                              onChange={() => toggleSkill(category, skill)}
                              className="w-5 h-5 rounded border-2 border-blue-300 text-blue-600"
                            />
                            <span className="text-sm font-medium text-gray-700">{skill}</span>
                          </label>
                        ))}
                      </div>
                      <div className="border-t pt-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Add Custom {category === 'testing' ? 'Testing' : category === 'automation' ? 'Automation' : category === 'programming' ? 'Programming' : 'Database'} Skill</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder={`e.g., ${category === 'testing' ? 'Usability Testing' : category === 'automation' ? 'Puppeteer' : category === 'programming' ? 'TypeScript' : 'Firebase'}`}
                            className="flex-1 px-3 py-2 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && e.target.value.trim()) {
                                const newSkill = e.target.value.trim();
                                if (!formData.technicalSkills[category].includes(newSkill)) {
                                  setFormData(prev => ({
                                    ...prev,
                                    technicalSkills: {
                                      ...prev.technicalSkills,
                                      [category]: [...prev.technicalSkills[category], newSkill]
                                    }
                                  }));
                                }
                                e.target.value = '';
                              }
                            }}
                          />
                          <button
                            onClick={(e) => {
                              const input = e.target.previousElementSibling;
                              if (input.value.trim()) {
                                const newSkill = input.value.trim();
                                if (!formData.technicalSkills[category].includes(newSkill)) {
                                  setFormData(prev => ({
                                    ...prev,
                                    technicalSkills: {
                                      ...prev.technicalSkills,
                                      [category]: [...prev.technicalSkills[category], newSkill]
                                    }
                                  }));
                                }
                                input.value = '';
                              }
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tools & Technologies */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">Tools & Technologies</h3>
                  {Object.entries(toolCategories).map(([category, tools]) => (
                    <div key={category} className="bg-white border-2 border-blue-100 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                        {category === 'testManagement' ? 'Test Management Tools' : 
                         category === 'automation' ? 'CI/CD & Automation' :
                         category === 'cicd' ? 'Cloud & Infrastructure' : 'Monitoring & Analytics'}
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                        {tools.map(tool => (
                          <label key={tool} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-blue-50">
                            <input
                              type="checkbox"
                              checked={formData.tools[category].includes(tool)}
                              onChange={() => toggleTool(category, tool)}
                              className="w-5 h-5 rounded border-2 border-blue-300 text-blue-600"
                            />
                            <span className="text-sm font-medium text-gray-700">{tool}</span>
                          </label>
                        ))}
                      </div>
                      <div className="border-t pt-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Add Custom {category === 'testManagement' ? 'Test Management' : category === 'automation' ? 'CI/CD' : category === 'cicd' ? 'Cloud/Infrastructure' : 'Monitoring'} Tool</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder={`e.g., ${category === 'testManagement' ? 'Xray' : category === 'automation' ? 'GitLab CI' : category === 'cicd' ? 'Terraform' : 'Dynatrace'}`}
                            className="flex-1 px-3 py-2 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && e.target.value.trim()) {
                                const newTool = e.target.value.trim();
                                if (!formData.tools[category].includes(newTool)) {
                                  setFormData(prev => ({
                                    ...prev,
                                    tools: {
                                      ...prev.tools,
                                      [category]: [...prev.tools[category], newTool]
                                    }
                                  }));
                                }
                                e.target.value = '';
                              }
                            }}
                          />
                          <button
                            onClick={(e) => {
                              const input = e.target.previousElementSibling;
                              if (input.value.trim()) {
                                const newTool = input.value.trim();
                                if (!formData.tools[category].includes(newTool)) {
                                  setFormData(prev => ({
                                    ...prev,
                                    tools: {
                                      ...prev.tools,
                                      [category]: [...prev.tools[category], newTool]
                                    }
                                  }));
                                }
                                input.value = '';
                              }
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Work Experience */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-900">Work Experience</h3>
                    <button
                      onClick={() => addItem('experience', { company: '', role: '', duration: '', location: '', achievements: [''] })}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Experience
                    </button>
                  </div>
                  
                  {formData.experience.map((exp, index) => (
                    <div key={index} className="bg-white border-2 border-blue-100 rounded-xl p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">Experience {index + 1}</h4>
                        {formData.experience.length > 1 && (
                          <button
                            onClick={() => removeItem('experience', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Company *</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => updateItem('experience', index, 'company', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Tech Solutions Inc."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title *</label>
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) => updateItem('experience', index, 'role', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Senior QA Engineer"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Duration *</label>
                          <input
                            type="text"
                            value={exp.duration}
                            onChange={(e) => updateItem('experience', index, 'duration', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Jan 2022 - Present"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                          <input
                            type="text"
                            value={exp.location}
                            onChange={(e) => updateItem('experience', index, 'location', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="San Francisco, CA"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Key Achievements & Impact</label>
                        {exp.achievements.map((achievement, achIndex) => (
                          <div key={achIndex} className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={achievement}
                              onChange={(e) => {
                                const newExp = [...formData.experience];
                                newExp[index].achievements[achIndex] = e.target.value;
                                setFormData(prev => ({ ...prev, experience: newExp }));
                              }}
                              className="flex-1 px-4 py-2 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Led automation testing initiatives reducing manual testing time by 60%"
                            />
                            {exp.achievements.length > 1 && (
                              <button
                                onClick={() => {
                                  const newExp = [...formData.experience];
                                  newExp[index].achievements = newExp[index].achievements.filter((_, i) => i !== achIndex);
                                  setFormData(prev => ({ ...prev, experience: newExp }));
                                }}
                                className="text-red-500 hover:text-red-700 px-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const newExp = [...formData.experience];
                            newExp[index].achievements.push('');
                            setFormData(prev => ({ ...prev, experience: newExp }));
                          }}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Add Achievement
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Projects */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-900">Projects</h3>
                    <button
                      onClick={() => addItem('projects', { title: '', description: '', technologies: '', impact: '', duration: '' })}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Project
                    </button>
                  </div>
                  
                  {formData.projects.map((project, index) => (
                    <div key={index} className="bg-white border-2 border-blue-100 rounded-xl p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">Project {index + 1}</h4>
                        {formData.projects.length > 1 && (
                          <button
                            onClick={() => removeItem('projects', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Project Title *</label>
                          <input
                            type="text"
                            value={project.title}
                            onChange={(e) => updateItem('projects', index, 'title', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="E-commerce Test Automation Framework"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                          <textarea
                            value={project.description}
                            onChange={(e) => updateItem('projects', index, 'description', e.target.value)}
                            rows="3"
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Developed comprehensive test automation framework for large-scale e-commerce platform"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Technologies Used</label>
                            <input
                              type="text"
                              value={project.technologies}
                              onChange={(e) => updateItem('projects', index, 'technologies', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Selenium, Java, TestNG, Jenkins, Docker"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
                            <input
                              type="text"
                              value={project.duration}
                              onChange={(e) => updateItem('projects', index, 'duration', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="3 months"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Business Impact & Results</label>
                          <input
                            type="text"
                            value={project.impact}
                            onChange={(e) => updateItem('projects', index, 'impact', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Reduced regression testing time by 70%, improved release velocity by 50%"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Achievements & Impact Metrics */}
              {currentStep === 7 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">Achievements & Impact Metrics</h3>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Key Achievements</label>
                    <p className="text-sm text-gray-500 mb-4">Add quantifiable achievements that demonstrate your impact (e.g., "Reduced production bugs by 40%")</p>
                    {formData.achievements.map((achievement, index) => (
                      <div key={index} className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={achievement}
                          onChange={(e) => {
                            const newAchievements = [...formData.achievements];
                            newAchievements[index] = e.target.value;
                            setFormData(prev => ({ ...prev, achievements: newAchievements }));
                          }}
                          className="flex-1 px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Reduced production bugs by 40% through implementation of robust testing processes"
                        />
                        {formData.achievements.length > 1 && (
                          <button
                            onClick={() => removeItem('achievements', index)}
                            className="text-red-500 hover:text-red-700 px-2"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addItem('achievements', '')}
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Achievement
                    </button>
                  </div>
                </div>
              )}

              {/* Certifications */}
              {currentStep === 8 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-900">Certifications</h3>
                    <button
                      onClick={() => addItem('certifications', { name: '', organization: '', year: '', credentialId: '' })}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Certification
                    </button>
                  </div>
                  
                  {formData.certifications.map((cert, index) => (
                    <div key={index} className="bg-white border-2 border-blue-100 rounded-xl p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">Certification {index + 1}</h4>
                        {formData.certifications.length > 1 && (
                          <button
                            onClick={() => removeItem('certifications', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Certification Name *</label>
                          <input
                            type="text"
                            value={cert.name}
                            onChange={(e) => updateItem('certifications', index, 'name', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="ISTQB Foundation Level"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Organization</label>
                          <input
                            type="text"
                            value={cert.organization}
                            onChange={(e) => updateItem('certifications', index, 'organization', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="ISTQB"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                          <input
                            type="text"
                            value={cert.year}
                            onChange={(e) => updateItem('certifications', index, 'year', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="2023"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Credential ID</label>
                          <input
                            type="text"
                            value={cert.credentialId}
                            onChange={(e) => updateItem('certifications', index, 'credentialId', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="ABC123456"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Education */}
              {currentStep === 9 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-900">Education</h3>
                    <button
                      onClick={() => addItem('education', { degree: '', university: '', location: '', year: '', gpa: '' })}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Education
                    </button>
                  </div>
                  
                  {formData.education.map((edu, index) => (
                    <div key={index} className="bg-white border-2 border-blue-100 rounded-xl p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">Education {index + 1}</h4>
                        {formData.education.length > 1 && (
                          <button
                            onClick={() => removeItem('education', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Degree *</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => updateItem('education', index, 'degree', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Bachelor of Computer Science"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">University *</label>
                          <input
                            type="text"
                            value={edu.university}
                            onChange={(e) => updateItem('education', index, 'university', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Stanford University"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                          <input
                            type="text"
                            value={edu.location}
                            onChange={(e) => updateItem('education', index, 'location', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Stanford, CA"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Graduation Year</label>
                          <input
                            type="text"
                            value={edu.year}
                            onChange={(e) => updateItem('education', index, 'year', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="2020"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">GPA (Optional)</label>
                          <input
                            type="text"
                            value={edu.gpa}
                            onChange={(e) => updateItem('education', index, 'gpa', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="3.8/4.0"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Awards & Recognition */}
              {currentStep === 10 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-900">Awards & Recognition</h3>
                    <button
                      onClick={() => addItem('awards', { title: '', organization: '', year: '', description: '' })}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Award
                    </button>
                  </div>
                  
                  {formData.awards.map((award, index) => (
                    <div key={index} className="bg-white border-2 border-blue-100 rounded-xl p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">Award {index + 1}</h4>
                        {formData.awards.length > 1 && (
                          <button
                            onClick={() => removeItem('awards', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Award Title *</label>
                          <input
                            type="text"
                            value={award.title}
                            onChange={(e) => updateItem('awards', index, 'title', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Employee of the Year"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Organization</label>
                          <input
                            type="text"
                            value={award.organization}
                            onChange={(e) => updateItem('awards', index, 'organization', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Tech Solutions Inc."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                          <input
                            type="text"
                            value={award.year}
                            onChange={(e) => updateItem('awards', index, 'year', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="2023"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                        <textarea
                          value={award.description}
                          onChange={(e) => updateItem('awards', index, 'description', e.target.value)}
                          rows="2"
                          className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Recognized for outstanding contribution to quality assurance and team leadership"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Languages */}
              {currentStep === 11 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-900">Languages</h3>
                    <button
                      onClick={() => addItem('languages', { name: '', proficiency: '' })}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Language
                    </button>
                  </div>
                  
                  {formData.languages.map((lang, index) => (
                    <div key={index} className="bg-white border-2 border-blue-100 rounded-xl p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">Language {index + 1}</h4>
                        {formData.languages.length > 1 && (
                          <button
                            onClick={() => removeItem('languages', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Language *</label>
                          <input
                            type="text"
                            value={lang.name}
                            onChange={(e) => updateItem('languages', index, 'name', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Spanish"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Proficiency Level</label>
                          <select
                            value={lang.proficiency}
                            onChange={(e) => updateItem('languages', index, 'proficiency', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select proficiency</option>
                            {proficiencyLevels.map(level => (
                              <option key={level} value={level}>{level}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Volunteer Work */}
              {currentStep === 12 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-900">Volunteer / Community Contributions</h3>
                    <button
                      onClick={() => addItem('volunteer', { organization: '', role: '', duration: '', description: '' })}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Volunteer Work
                    </button>
                  </div>
                  
                  {formData.volunteer.map((vol, index) => (
                    <div key={index} className="bg-white border-2 border-blue-100 rounded-xl p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">Volunteer Work {index + 1}</h4>
                        {formData.volunteer.length > 1 && (
                          <button
                            onClick={() => removeItem('volunteer', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Organization *</label>
                          <input
                            type="text"
                            value={vol.organization}
                            onChange={(e) => updateItem('volunteer', index, 'organization', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Local Food Bank"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                          <input
                            type="text"
                            value={vol.role}
                            onChange={(e) => updateItem('volunteer', index, 'role', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Volunteer Coordinator"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
                          <input
                            type="text"
                            value={vol.duration}
                            onChange={(e) => updateItem('volunteer', index, 'duration', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="2020 - Present"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                        <textarea
                          value={vol.description}
                          onChange={(e) => updateItem('volunteer', index, 'description', e.target.value)}
                          rows="3"
                          className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Organized food distribution events serving 500+ families monthly"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Publications & Talks */}
              {currentStep === 13 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-900">Publications, Blogs & Talks</h3>
                    <button
                      onClick={() => addItem('publications', { title: '', type: '', platform: '', date: '', url: '', description: '' })}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Publication
                    </button>
                  </div>
                  
                  {formData.publications.map((pub, index) => (
                    <div key={index} className="bg-white border-2 border-blue-100 rounded-xl p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">Publication {index + 1}</h4>
                        {formData.publications.length > 1 && (
                          <button
                            onClick={() => removeItem('publications', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                          <input
                            type="text"
                            value={pub.title}
                            onChange={(e) => updateItem('publications', index, 'title', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Advanced Test Automation Strategies"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                          <select
                            value={pub.type}
                            onChange={(e) => updateItem('publications', index, 'type', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select type</option>
                            <option value="Blog Post">Blog Post</option>
                            <option value="Conference Talk">Conference Talk</option>
                            <option value="Webinar">Webinar</option>
                            <option value="Article">Article</option>
                            <option value="White Paper">White Paper</option>
                            <option value="Podcast">Podcast</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Platform/Venue</label>
                          <input
                            type="text"
                            value={pub.platform}
                            onChange={(e) => updateItem('publications', index, 'platform', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Medium, QA Conference 2024, TestingVala"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                          <input
                            type="text"
                            value={pub.date}
                            onChange={(e) => updateItem('publications', index, 'date', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="March 2024"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">URL/Link</label>
                          <input
                            type="url"
                            value={pub.url}
                            onChange={(e) => updateItem('publications', index, 'url', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="https://medium.com/@yourname/article"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                        <textarea
                          value={pub.description}
                          onChange={(e) => updateItem('publications', index, 'description', e.target.value)}
                          rows="3"
                          className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Comprehensive guide on implementing test automation frameworks for enterprise applications"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Open Source Contributions */}
              {currentStep === 14 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-900">Open Source Contributions</h3>
                    <button
                      onClick={() => addItem('openSource', { project: '', role: '', technologies: '', url: '', description: '', contributions: '' })}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Contribution
                    </button>
                  </div>
                  
                  {formData.openSource.map((os, index) => (
                    <div key={index} className="bg-white border-2 border-blue-100 rounded-xl p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">Contribution {index + 1}</h4>
                        {formData.openSource.length > 1 && (
                          <button
                            onClick={() => removeItem('openSource', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Project Name *</label>
                          <input
                            type="text"
                            value={os.project}
                            onChange={(e) => updateItem('openSource', index, 'project', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Selenium WebDriver"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Your Role</label>
                          <input
                            type="text"
                            value={os.role}
                            onChange={(e) => updateItem('openSource', index, 'role', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Contributor, Maintainer, Core Developer"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Technologies</label>
                          <input
                            type="text"
                            value={os.technologies}
                            onChange={(e) => updateItem('openSource', index, 'technologies', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Java, Python, JavaScript"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Repository URL</label>
                          <input
                            type="url"
                            value={os.url}
                            onChange={(e) => updateItem('openSource', index, 'url', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="https://github.com/seleniumhq/selenium"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                          <textarea
                            value={os.description}
                            onChange={(e) => updateItem('openSource', index, 'description', e.target.value)}
                            rows="2"
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Brief description of the project and its purpose"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Your Contributions</label>
                          <textarea
                            value={os.contributions}
                            onChange={(e) => updateItem('openSource', index, 'contributions', e.target.value)}
                            rows="2"
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Fixed critical bugs, added new features, improved documentation"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Professional Memberships */}
              {currentStep === 15 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-900">Professional Memberships</h3>
                    <button
                      onClick={() => addItem('memberships', { organization: '', role: '', year: '', certificationId: '', description: '' })}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Membership
                    </button>
                  </div>
                  
                  {formData.memberships.map((mem, index) => (
                    <div key={index} className="bg-white border-2 border-blue-100 rounded-xl p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">Membership {index + 1}</h4>
                        {formData.memberships.length > 1 && (
                          <button
                            onClick={() => removeItem('memberships', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Organization *</label>
                          <input
                            type="text"
                            value={mem.organization}
                            onChange={(e) => updateItem('memberships', index, 'organization', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="ISTQB, Agile Alliance, PMI, IEEE"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Role/Level</label>
                          <input
                            type="text"
                            value={mem.role}
                            onChange={(e) => updateItem('memberships', index, 'role', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Member, Certified Professional, Board Member"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Year Joined</label>
                          <input
                            type="text"
                            value={mem.year}
                            onChange={(e) => updateItem('memberships', index, 'year', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="2023"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Certification/Member ID</label>
                          <input
                            type="text"
                            value={mem.certificationId}
                            onChange={(e) => updateItem('memberships', index, 'certificationId', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="ISTQB-FL-12345"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                        <textarea
                          value={mem.description}
                          onChange={(e) => updateItem('memberships', index, 'description', e.target.value)}
                          rows="2"
                          className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Active member contributing to testing standards and best practices"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Portfolio & Case Studies */}
              {currentStep === 16 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-900">Portfolio & Case Studies</h3>
                    <button
                      onClick={() => addItem('portfolio', { title: '', category: '', url: '', description: '', technologies: '' })}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Portfolio Item
                    </button>
                  </div>
                  
                  {formData.portfolio.map((port, index) => (
                    <div key={index} className="bg-white border-2 border-blue-100 rounded-xl p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">Portfolio Item {index + 1}</h4>
                        {formData.portfolio.length > 1 && (
                          <button
                            onClick={() => removeItem('portfolio', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                          <input
                            type="text"
                            value={port.title}
                            onChange={(e) => updateItem('portfolio', index, 'title', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="E-commerce Testing Case Study"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                          <select
                            value={port.category}
                            onChange={(e) => updateItem('portfolio', index, 'category', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select category</option>
                            <option value="Case Study">Case Study</option>
                            <option value="Test Framework">Test Framework</option>
                            <option value="Automation Project">Automation Project</option>
                            <option value="Performance Testing">Performance Testing</option>
                            <option value="Security Testing">Security Testing</option>
                            <option value="Mobile Testing">Mobile Testing</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">URL/Link</label>
                          <input
                            type="url"
                            value={port.url}
                            onChange={(e) => updateItem('portfolio', index, 'url', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="https://yourportfolio.com/case-study"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Technologies Used</label>
                          <input
                            type="text"
                            value={port.technologies}
                            onChange={(e) => updateItem('portfolio', index, 'technologies', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Selenium, Java, TestNG, Jenkins"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                        <textarea
                          value={port.description}
                          onChange={(e) => updateItem('portfolio', index, 'description', e.target.value)}
                          rows="3"
                          className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Comprehensive testing strategy for large-scale e-commerce platform resulting in 40% reduction in production bugs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Patents & Innovations */}
              {currentStep === 17 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-900">Patents & Innovations</h3>
                    <button
                      onClick={() => addItem('patents', { title: '', patentNumber: '', date: '', description: '', status: '' })}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Patent
                    </button>
                  </div>
                  
                  {formData.patents.map((patent, index) => (
                    <div key={index} className="bg-white border-2 border-blue-100 rounded-xl p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">Patent {index + 1}</h4>
                        {formData.patents.length > 1 && (
                          <button
                            onClick={() => removeItem('patents', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Patent Title *</label>
                          <input
                            type="text"
                            value={patent.title}
                            onChange={(e) => updateItem('patents', index, 'title', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Automated Test Case Generation System"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Patent Number</label>
                          <input
                            type="text"
                            value={patent.patentNumber}
                            onChange={(e) => updateItem('patents', index, 'patentNumber', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="US10,123,456 B2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Date Filed/Granted</label>
                          <input
                            type="text"
                            value={patent.date}
                            onChange={(e) => updateItem('patents', index, 'date', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="March 2024"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                          <select
                            value={patent.status}
                            onChange={(e) => updateItem('patents', index, 'status', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select status</option>
                            <option value="Granted">Granted</option>
                            <option value="Pending">Pending</option>
                            <option value="Filed">Filed</option>
                            <option value="Published">Published</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                        <textarea
                          value={patent.description}
                          onChange={(e) => updateItem('patents', index, 'description', e.target.value)}
                          rows="3"
                          className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Novel approach to automated test case generation using machine learning algorithms"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Download */}
              {currentStep === 18 && (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto">
                    <Download className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">World-Class Resume Ready!</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Your professional QA resume is ready for download. Industry-leading quality, ATS-optimized, and recruiter-friendly.
                  </p>
                  <div className="bg-blue-50 rounded-xl p-6 max-w-md mx-auto">
                    <h4 className="font-semibold text-blue-900 mb-2">Template: {templates.find(t => t.id === selectedTemplate)?.name}</h4>
                    <p className="text-sm text-blue-700">{templates.find(t => t.id === selectedTemplate)?.description}</p>
                  </div>
                  <button
                    onClick={downloadResume}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg flex items-center gap-3 mx-auto"
                  >
                    <Download className="w-6 h-6" />
                    Download Professional Resume
                  </button>
                </div>
              )}

              {/* Progress Bar */}
              <div className="mt-6 mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-blue-700 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>
                
                <div className="flex gap-3">
                  {currentStep < steps.length - 1 && (
                    <button
                      onClick={() => {
                        // Validate current step before proceeding
                        const canProceed = validateCurrentStep();
                        if (canProceed) {
                          setCurrentStep(currentStep + 1);
                          toast.success('✓ Section completed');
                        }
                      }}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all"
                    >
                      Next
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      const progress = ((currentStep + 1) / steps.length) * 100;
                      toast.success(`📊 Resume is ${Math.round(progress)}% complete`);
                    }}
                    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all text-sm font-medium"
                  >
                    📊 Check Progress
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Button */}
            <div className="hidden xl:block w-80 bg-gray-50 border-l border-gray-200 p-6 flex-shrink-0">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Professional Preview</h3>
                <p className="text-sm text-gray-600 mb-6">See how your resume will look with enterprise-grade formatting</p>
                <button
                  onClick={() => setShowPreview(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  Preview Resume
                </button>
                <div className="mt-6 p-4 bg-white rounded-lg border">
                  <h4 className="font-semibold text-gray-900 mb-2">Template: {templates.find(t => t.id === selectedTemplate)?.name}</h4>
                  <p className="text-xs text-gray-600">{templates.find(t => t.id === selectedTemplate)?.description}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Professional Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Professional Resume Preview</h3>
                    <p className="text-sm text-gray-600">Template: {templates.find(t => t.id === selectedTemplate)?.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <iframe
                  srcDoc={generateResumeHTML()}
                  className="w-full h-full border-0"
                  title="Resume Preview"
                />
              </div>
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    ✨ This preview shows your resume with enterprise-grade formatting
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowPreview(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Close Preview
                    </button>
                    <button
                      onClick={() => {
                        setShowPreview(false);
                        downloadResume();
                      }}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Resume
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        

        </div>
      </div>
    );
  } catch (error) {
    handleError(error, 'Component Render');
    return null;
  }
};

export default ResumeBuilder;