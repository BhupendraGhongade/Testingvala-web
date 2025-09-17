import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, User, Target, Star, Code, Settings, Briefcase, Award, GraduationCap, CheckCircle, Download, Eye, BookOpen, Users, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { saveDraft, loadDraft } from '../lib/supabase';

const QAResumeBuilderPage = ({ onBack, userEmail, existingResume }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [resumeId, setResumeId] = useState(existingResume?.id || null);
  const [formData, setFormData] = useState(existingResume?.resume_data || {
    personal: {
      name: '',
      jobTitle: 'QA Engineer',
      email: userEmail || '',
      phone: '',
      location: '',
      linkedin: '',
      github: ''
    },
    summary: '',
    coreCompetencies: [],
    technicalSkills: {
      testing: [],
      automation: [],
      programming: [],
      databases: [],
      tools: []
    },
    experience: [{ company: '', role: '', duration: '', location: '', achievements: [''] }],
    projects: [{ title: '', description: '', technologies: '', impact: '' }],
    achievements: [{ title: '', organization: '', year: '', description: '' }],
    certifications: [{ name: '', organization: '', year: '', credentialId: '' }],
    education: [{ degree: '', university: '', year: '', gpa: '' }],
    awards: [{ title: '', organization: '', year: '', description: '' }],
    publications: [{ title: '', publication: '', year: '', url: '' }],
    conferences: [{ name: '', role: '', year: '', location: '' }],
    affiliations: [{ organization: '', role: '', since: '', status: 'Active' }]
  });

  // Load existing resume or draft
  useEffect(() => {
    if (existingResume) {
      setLastSaved(new Date(existingResume.updated_at));
      if (existingResume.status === 'draft') {
        toast.success('Draft loaded successfully!');
      } else {
        toast.success('Resume loaded for editing!');
      }
    } else if (userEmail && !existingResume) {
      // Only load draft if no existing resume provided
      const loadSavedDraft = async () => {
        try {
          const draft = await loadDraft(userEmail);
          if (draft && draft.resume_data) {
            setFormData(draft.resume_data);
            setResumeId(draft.id);
            setLastSaved(new Date(draft.updated_at));
            toast.success('Draft loaded successfully!');
          }
        } catch (error) {
          console.error('Error loading draft:', error);
        }
      };
      loadSavedDraft();
    }
  }, [userEmail, existingResume]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!userEmail) return;
    
    const autoSave = async () => {
      try {
        setIsDraftSaving(true);
        if (resumeId) {
          const { updateResume } = await import('../lib/supabase');
          await updateResume(resumeId, { resume_data: formData });
        } else {
          const result = await saveDraft(userEmail, { resume_data: formData });
          if (result.id) setResumeId(result.id);
        }
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsDraftSaving(false);
      }
    };

    const interval = setInterval(autoSave, 30000);
    return () => clearInterval(interval);
  }, [formData, userEmail, resumeId]);

  const manualSaveDraft = async () => {
    if (!userEmail) {
      toast.error('Please provide email to save draft');
      return;
    }
    
    try {
      setIsDraftSaving(true);
      if (resumeId) {
        // Update existing resume
        const { updateResume } = await import('../lib/supabase');
        await updateResume(resumeId, { resume_data: formData });
      } else {
        // Create new draft
        const result = await saveDraft(userEmail, { resume_data: formData });
        if (result.id) setResumeId(result.id);
      }
      setLastSaved(new Date());
      toast.success('Resume saved successfully!');
    } catch (error) {
      console.error('Manual save failed:', error);
      toast.error('Failed to save resume');
    } finally {
      setIsDraftSaving(false);
    }
  };

  const steps = [
    { id: 'personal', title: 'Personal Info', icon: User },
    { id: 'summary', title: 'Summary', icon: Target },
    { id: 'competencies', title: 'Core Competencies', icon: Star },
    { id: 'skills', title: 'Technical Skills', icon: Code },
    { id: 'experience', title: 'Experience', icon: Briefcase },
    { id: 'projects', title: 'Projects', icon: Settings },
    { id: 'achievements', title: 'Achievements', icon: Award },
    { id: 'certifications', title: 'Certifications', icon: CheckCircle },
    { id: 'education', title: 'Education', icon: GraduationCap },
    { id: 'awards', title: 'Awards & Recognition', icon: Award },
    { id: 'publications', title: 'Publications', icon: BookOpen },
    { id: 'conferences', title: 'Conference Participation', icon: Users },
    { id: 'affiliations', title: 'Professional Affiliations', icon: Shield },
    { id: 'review', title: 'Review & Download', icon: Download }
  ];

  const skillCategories = {
    testing: ['Manual Testing', 'Functional Testing', 'Regression Testing', 'API Testing', 'Performance Testing', 'Security Testing', 'Usability Testing', 'Accessibility Testing'],
    automation: ['Selenium WebDriver', 'Playwright', 'Cypress', 'TestComplete', 'Appium', 'Robot Framework', 'Katalon Studio', 'Puppeteer'],
    programming: ['Java', 'Python', 'JavaScript', 'C#', 'TypeScript', 'SQL', 'Bash/Shell', 'PowerShell'],
    databases: ['MySQL', 'PostgreSQL', 'MongoDB', 'Oracle', 'SQL Server', 'Redis', 'Cassandra', 'DynamoDB'],
    tools: ['JIRA', 'TestRail', 'Zephyr', 'Jenkins', 'GitLab CI', 'Docker', 'Kubernetes', 'Postman', 'SoapUI', 'LoadRunner']
  };

  const coreCompetenciesOptions = [
    'Test Strategy & Planning', 'Quality Assurance Leadership', 'Cross-functional Collaboration',
    'Process Improvement', 'Risk Assessment', 'Agile/Scrum Methodologies', 'DevOps Integration',
    'Test Automation Strategy', 'Performance Optimization', 'Security Testing', 'Mobile Testing',
    'API Testing', 'Database Testing', 'CI/CD Pipeline Testing', 'Defect Management'
  ];

  const toggleSkill = (category, skill) => {
    setFormData(prev => ({
      ...prev,
      technicalSkills: {
        ...prev.technicalSkills,
        [category]: prev.technicalSkills[category].includes(skill)
          ? prev.technicalSkills[category].filter(s => s !== skill)
          : [...prev.technicalSkills[category], skill]
      }
    }));
  };

  const toggleCompetency = (competency) => {
    setFormData(prev => ({
      ...prev,
      coreCompetencies: prev.coreCompetencies.includes(competency)
        ? prev.coreCompetencies.filter(c => c !== competency)
        : [...prev.coreCompetencies, competency]
    }));
  };

  const removeItem = (section, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const addItem = (section, item) => {
    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], item]
    }));
  };

  const updateItem = (section, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const downloadResume = () => {
    const resumeHTML = generateResumeHTML();
    const blob = new Blob([resumeHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.personal.name || 'QA_Resume'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('🎉 Your professional QA resume has been downloaded!');
  };

  const generateResumeHTML = () => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${formData.personal.name || 'QA Resume'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 8.5in; margin: 0 auto; padding: 0.5in; background: white; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #2563eb; padding-bottom: 20px; }
    .name { font-size: 32px; font-weight: bold; color: #1e40af; margin-bottom: 8px; }
    .title { font-size: 20px; color: #3b82f6; margin-bottom: 12px; }
    .contact { font-size: 14px; color: #6b7280; line-height: 1.4; }
    .section { margin-bottom: 25px; }
    .section-title { font-size: 18px; font-weight: bold; color: #1e40af; text-transform: uppercase; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; margin-bottom: 15px; }
    .content { font-size: 14px; line-height: 1.6; }
    .item { margin-bottom: 15px; }
    .item-header { font-weight: bold; color: #374151; margin-bottom: 5px; }
    .item-details { font-style: italic; color: #6b7280; margin-bottom: 8px; }
    .achievements { margin-left: 20px; }
    .achievement { margin-bottom: 4px; }
    .skills-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .skill-category { margin-bottom: 12px; }
    .skill-category-title { font-weight: bold; color: #374151; margin-bottom: 6px; }
    .competencies { display: flex; flex-wrap: wrap; gap: 8px; }
    .competency { background: #dbeafe; padding: 6px 12px; border-radius: 6px; font-size: 13px; border: 1px solid #3b82f6; color: #1e40af; }
    @media print { body { margin: 0; padding: 0.3in; } .section { page-break-inside: avoid; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="name">${formData.personal.name || 'Your Name'}</div>
    <div class="title">${formData.personal.jobTitle || 'QA Engineer'}</div>
    <div class="contact">
      ${[formData.personal.email, formData.personal.phone, formData.personal.location, formData.personal.linkedin, formData.personal.github].filter(Boolean).join(' | ')}
    </div>
  </div>

  ${formData.summary ? `
    <div class="section">
      <div class="section-title">Professional Summary</div>
      <div class="content">${formData.summary}</div>
    </div>
  ` : ''}

  ${formData.coreCompetencies.length > 0 ? `
    <div class="section">
      <div class="section-title">Core Competencies</div>
      <div class="competencies">
        ${formData.coreCompetencies.map(comp => `<span class="competency">${comp}</span>`).join('')}
      </div>
    </div>
  ` : ''}

  ${Object.values(formData.technicalSkills).some(skills => skills.length > 0) ? `
    <div class="section">
      <div class="section-title">Technical Skills</div>
      <div class="skills-grid">
        ${Object.entries(formData.technicalSkills).map(([category, skills]) => {
          if (!skills || skills.length === 0) return '';
          const categoryName = category === 'testing' ? 'Testing Methodologies' : 
                             category === 'automation' ? 'Automation Frameworks' :
                             category === 'programming' ? 'Programming Languages' : 
                             category === 'databases' ? 'Database Technologies' : 'Tools & Platforms';
          return `
            <div class="skill-category">
              <div class="skill-category-title">${categoryName}</div>
              <div>${skills.join(', ')}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  ` : ''}

  ${formData.experience.filter(exp => exp.company).length > 0 ? `
    <div class="section">
      <div class="section-title">Professional Experience</div>
      ${formData.experience.filter(exp => exp.company).map(exp => `
        <div class="item">
          <div class="item-header">${exp.role} - ${exp.company}</div>
          <div class="item-details">${exp.duration}${exp.location ? ` | ${exp.location}` : ''}</div>
          ${exp.achievements && exp.achievements.filter(Boolean).length > 0 ? `
            <div class="achievements">
              ${exp.achievements.filter(Boolean).map(ach => `<div class="achievement">• ${ach}</div>`).join('')}
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
  ` : ''}

  ${formData.projects.filter(proj => proj.title).length > 0 ? `
    <div class="section">
      <div class="section-title">Key Projects</div>
      ${formData.projects.filter(proj => proj.title).map(project => `
        <div class="item">
          <div class="item-header">${project.title}</div>
          ${project.technologies ? `<div class="item-details">Technologies: ${project.technologies}</div>` : ''}
          ${project.description ? `<div>${project.description}</div>` : ''}
          ${project.impact ? `<div><strong>Impact:</strong> ${project.impact}</div>` : ''}
        </div>
      `).join('')}
    </div>
  ` : ''}

  ${formData.achievements.filter(ach => ach.title).length > 0 ? `
    <div class="section">
      <div class="section-title">Achievements & Impact</div>
      ${formData.achievements.filter(ach => ach.title).map(ach => `
        <div class="item">
          <div class="item-header">${ach.title}</div>
          <div class="item-details">${ach.organization}${ach.year ? ` | ${ach.year}` : ''}</div>
          ${ach.description ? `<div>${ach.description}</div>` : ''}
        </div>
      `).join('')}
    </div>
  ` : ''}

  ${formData.certifications.filter(cert => cert.name).length > 0 ? `
    <div class="section">
      <div class="section-title">Certifications</div>
      ${formData.certifications.filter(cert => cert.name).map(cert => `
        <div class="item">
          <div class="item-header">${cert.name}</div>
          <div class="item-details">${cert.organization}${cert.year ? ` | ${cert.year}` : ''}${cert.credentialId ? ` | ID: ${cert.credentialId}` : ''}</div>
        </div>
      `).join('')}
    </div>
  ` : ''}

  ${formData.education.filter(edu => edu.degree).length > 0 ? `
    <div class="section">
      <div class="section-title">Education</div>
      ${formData.education.filter(edu => edu.degree).map(edu => `
        <div class="item">
          <div class="item-header">${edu.degree}</div>
          <div class="item-details">${edu.university}${edu.year ? ` | ${edu.year}` : ''}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</div>
        </div>
      `).join('')}
    </div>
  ` : ''}

  ${formData.awards.filter(award => award.title).length > 0 ? `
    <div class="section">
      <div class="section-title">Awards & Recognition</div>
      ${formData.awards.filter(award => award.title).map(award => `
        <div class="item">
          <div class="item-header">${award.title}</div>
          <div class="item-details">${award.organization}${award.year ? ` | ${award.year}` : ''}</div>
          ${award.description ? `<div>${award.description}</div>` : ''}
        </div>
      `).join('')}
    </div>
  ` : ''}

  ${formData.publications.filter(pub => pub.title).length > 0 ? `
    <div class="section">
      <div class="section-title">Publications</div>
      ${formData.publications.filter(pub => pub.title).map(pub => `
        <div class="item">
          <div class="item-header">${pub.title}</div>
          <div class="item-details">${pub.publication}${pub.year ? ` | ${pub.year}` : ''}</div>
          ${pub.url ? `<div><a href="${pub.url}">${pub.url}</a></div>` : ''}
        </div>
      `).join('')}
    </div>
  ` : ''}

  ${formData.conferences.filter(conf => conf.name).length > 0 ? `
    <div class="section">
      <div class="section-title">Conference Participation</div>
      ${formData.conferences.filter(conf => conf.name).map(conf => `
        <div class="item">
          <div class="item-header">${conf.name}</div>
          <div class="item-details">${conf.role}${conf.year ? ` | ${conf.year}` : ''}${conf.location ? ` | ${conf.location}` : ''}</div>
        </div>
      `).join('')}
    </div>
  ` : ''}

  ${formData.affiliations.filter(aff => aff.organization).length > 0 ? `
    <div class="section">
      <div class="section-title">Professional Affiliations</div>
      ${formData.affiliations.filter(aff => aff.organization).map(aff => `
        <div class="item">
          <div class="item-header">${aff.organization}</div>
          <div class="item-details">${aff.role}${aff.since ? ` | Member since ${aff.since}` : ''}${aff.status ? ` | ${aff.status}` : ''}</div>
        </div>
      `).join('')}
    </div>
  ` : ''}

</body>
</html>
    `;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
              >
                <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Back</span>
              </button>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Enhanced QA Resume Builder</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {userEmail && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={manualSaveDraft}
                    disabled={isDraftSaving}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                  >
                    <Save className={`w-4 h-4 ${isDraftSaving ? 'animate-spin' : ''}`} />
                    {isDraftSaving ? 'Saving...' : 'Save Draft'}
                  </button>
                  {lastSaved && (
                    <span className="text-xs text-gray-500">
                      Last saved: {lastSaved.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step {currentStep + 1} of {steps.length}</span>
            <span className="text-sm text-gray-500">{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-blue-700 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-140px)]">
        <div className="grid lg:grid-cols-4 gap-8 h-full">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 h-full">
              <h3 className="font-bold text-gray-900 mb-4">Resume Sections</h3>
              <div className="space-y-2 overflow-y-auto" style={{maxHeight: 'calc(100vh - 280px)'}}>
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === index;
                  const isCompleted = currentStep > index;
                  
                  return (
                    <div
                      key={step.id}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                        isActive 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : isCompleted
                          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={() => setCurrentStep(index)}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isActive ? 'bg-white/20' : isCompleted ? 'bg-blue-100' : 'bg-gray-200'
                      }`}>
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : isCompleted ? 'text-blue-600' : 'text-gray-500'}`} />
                      </div>
                      <span className="font-medium text-sm">{step.title}</span>
                      {isCompleted && <div className="w-2 h-2 bg-green-500 rounded-full ml-auto" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl p-8 h-full overflow-y-auto" style={{maxHeight: 'calc(100vh - 200px)'}}>
              {/* Personal Info */}
              {currentStep === 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
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
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title *</label>
                      <input
                        type="text"
                        value={formData.personal.jobTitle}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personal: { ...prev.personal, jobTitle: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Senior QA Engineer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        value={formData.personal.email}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personal: { ...prev.personal, email: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="john.doe@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.personal.phone}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personal: { ...prev.personal, phone: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="San Francisco, CA"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">LinkedIn</label>
                      <input
                        type="url"
                        value={formData.personal.linkedin}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personal: { ...prev.personal, linkedin: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://linkedin.com/in/johndoe"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Summary */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Summary</h2>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Career Summary</label>
                    <textarea
                      value={formData.summary}
                      onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                      rows="6"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Results-driven QA Engineer with 5+ years of experience in manual and automated testing..."
                    />
                  </div>
                </div>
              )}

              {/* Core Competencies */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Core Competencies</h2>
                  <p className="text-gray-600 mb-6">Select your key professional competencies that make you stand out as a QA professional.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {coreCompetenciesOptions.map(competency => (
                      <label key={competency} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-blue-50 border border-gray-200">
                        <input
                          type="checkbox"
                          checked={formData.coreCompetencies.includes(competency)}
                          onChange={() => toggleCompetency(competency)}
                          className="w-5 h-5 rounded border-2 border-blue-300 text-blue-600"
                        />
                        <span className="text-sm font-medium text-gray-700">{competency}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Skills */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Skills</h2>
                  {Object.entries(skillCategories).map(([category, skills]) => (
                    <div key={category} className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                        {category === 'testing' ? 'Testing Methodologies' : 
                         category === 'automation' ? 'Automation Frameworks' :
                         category === 'programming' ? 'Programming Languages' : 
                         category === 'databases' ? 'Database Technologies' : 'Tools & Platforms'}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {skills.map(skill => (
                          <label key={skill} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-blue-50 border border-gray-200">
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
                    </div>
                  ))}
                </div>
              )}

              {/* Experience */}
              {currentStep === 4 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Work Experience</h2>
                  {formData.experience.map((exp, index) => (
                    <div key={index} className="bg-gray-50 p-6 rounded-xl mb-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold text-gray-900">Experience {index + 1}</h4>
                        {formData.experience.length > 1 && (
                          <button
                            onClick={() => removeItem('experience', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Company</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => updateItem('experience', index, 'company', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="TechCorp Inc."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) => updateItem('experience', index, 'role', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Senior QA Engineer"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
                          <input
                            type="text"
                            value={exp.duration}
                            onChange={(e) => updateItem('experience', index, 'duration', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="2020 - Present"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                          <input
                            type="text"
                            value={exp.location}
                            onChange={(e) => updateItem('experience', index, 'location', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="San Francisco, CA"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Key Achievements</label>
                        {exp.achievements.map((achievement, achIndex) => (
                          <div key={achIndex} className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={achievement}
                              onChange={(e) => {
                                const newAchievements = [...exp.achievements];
                                newAchievements[achIndex] = e.target.value;
                                updateItem('experience', index, 'achievements', newAchievements);
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Led QA team of 5 engineers, implementing automated testing that reduced manual testing time by 60%"
                            />
                            {exp.achievements.length > 1 && (
                              <button
                                onClick={() => {
                                  const newAchievements = exp.achievements.filter((_, i) => i !== achIndex);
                                  updateItem('experience', index, 'achievements', newAchievements);
                                }}
                                className="text-red-500 hover:text-red-700 px-2"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const newAchievements = [...exp.achievements, ''];
                            updateItem('experience', index, 'achievements', newAchievements);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          + Add Achievement
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => addItem('experience', { company: '', role: '', duration: '', location: '', achievements: [''] })}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    + Add Experience
                  </button>
                </div>
              )}

              {/* Projects */}
              {currentStep === 5 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Projects</h2>
                  {formData.projects.map((project, index) => (
                    <div key={index} className="bg-gray-50 p-6 rounded-xl mb-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold text-gray-900">Project {index + 1}</h4>
                        {formData.projects.length > 1 && (
                          <button
                            onClick={() => removeItem('projects', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Project Title</label>
                          <input
                            type="text"
                            value={project.title}
                            onChange={(e) => updateItem('projects', index, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="E-commerce Platform Testing Framework"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Technologies</label>
                          <input
                            type="text"
                            value={project.technologies}
                            onChange={(e) => updateItem('projects', index, 'technologies', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Selenium, Java, TestNG, Jenkins"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                          <textarea
                            value={project.description}
                            onChange={(e) => updateItem('projects', index, 'description', e.target.value)}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Built comprehensive testing framework for high-traffic e-commerce platform"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Impact</label>
                          <input
                            type="text"
                            value={project.impact}
                            onChange={(e) => updateItem('projects', index, 'impact', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Reduced regression testing time from 2 weeks to 2 days"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => addItem('projects', { title: '', description: '', technologies: '', impact: '' })}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    + Add Project
                  </button>
                </div>
              )}

              {/* Achievements */}
              {currentStep === 6 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Achievements & Impact</h2>
                  {formData.achievements.map((achievement, index) => (
                    <div key={index} className="bg-gray-50 p-6 rounded-xl mb-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold text-gray-900">Achievement {index + 1}</h4>
                        {formData.achievements.length > 1 && (
                          <button
                            onClick={() => removeItem('achievements', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                          <input
                            type="text"
                            value={achievement.title}
                            onChange={(e) => updateItem('achievements', index, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Quality Excellence Award"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Organization</label>
                          <input
                            type="text"
                            value={achievement.organization}
                            onChange={(e) => updateItem('achievements', index, 'organization', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="TechCorp Inc."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                          <input
                            type="text"
                            value={achievement.year}
                            onChange={(e) => updateItem('achievements', index, 'year', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="2023"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                          <textarea
                            value={achievement.description}
                            onChange={(e) => updateItem('achievements', index, 'description', e.target.value)}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Recognized for implementing zero-defect release process"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => addItem('achievements', { title: '', organization: '', year: '', description: '' })}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    + Add Achievement
                  </button>
                </div>
              )}

              {/* Certifications */}
              {currentStep === 7 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Certifications</h2>
                  {formData.certifications.map((cert, index) => (
                    <div key={index} className="bg-gray-50 p-6 rounded-xl mb-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold text-gray-900">Certification {index + 1}</h4>
                        {formData.certifications.length > 1 && (
                          <button
                            onClick={() => removeItem('certifications', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Certification Name</label>
                          <input
                            type="text"
                            value={cert.name}
                            onChange={(e) => updateItem('certifications', index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="ISTQB Advanced Level Test Manager"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Organization</label>
                          <input
                            type="text"
                            value={cert.organization}
                            onChange={(e) => updateItem('certifications', index, 'organization', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="ISTQB"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                          <input
                            type="text"
                            value={cert.year}
                            onChange={(e) => updateItem('certifications', index, 'year', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="2022"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Credential ID</label>
                          <input
                            type="text"
                            value={cert.credentialId}
                            onChange={(e) => updateItem('certifications', index, 'credentialId', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="ISTQB-ATM-2022-001"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => addItem('certifications', { name: '', organization: '', year: '', credentialId: '' })}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    + Add Certification
                  </button>
                </div>
              )}

              {/* Education */}
              {currentStep === 8 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Education</h2>
                  {formData.education.map((edu, index) => (
                    <div key={index} className="bg-gray-50 p-6 rounded-xl mb-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold text-gray-900">Education {index + 1}</h4>
                        {formData.education.length > 1 && (
                          <button
                            onClick={() => removeItem('education', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Degree</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => updateItem('education', index, 'degree', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Bachelor of Science in Computer Science"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">University</label>
                          <input
                            type="text"
                            value={edu.university}
                            onChange={(e) => updateItem('education', index, 'university', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="University of California, Berkeley"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                          <input
                            type="text"
                            value={edu.year}
                            onChange={(e) => updateItem('education', index, 'year', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="2016"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">GPA (Optional)</label>
                          <input
                            type="text"
                            value={edu.gpa}
                            onChange={(e) => updateItem('education', index, 'gpa', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="3.8/4.0"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => addItem('education', { degree: '', university: '', year: '', gpa: '' })}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    + Add Education
                  </button>
                </div>
              )}

              {/* Awards & Recognition */}
              {currentStep === 9 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Awards & Recognition</h2>
                  <p className="text-gray-600 mb-6">Highlight your professional awards, recognitions, and honors.</p>
                  {formData.awards.map((award, index) => (
                    <div key={index} className="bg-gray-50 p-6 rounded-xl mb-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold text-gray-900">Award {index + 1}</h4>
                        {formData.awards.length > 1 && (
                          <button
                            onClick={() => removeItem('awards', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Award Title</label>
                          <input
                            type="text"
                            value={award.title}
                            onChange={(e) => updateItem('awards', index, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Employee of the Year"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Organization</label>
                          <input
                            type="text"
                            value={award.organization}
                            onChange={(e) => updateItem('awards', index, 'organization', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="TechCorp Inc."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                          <input
                            type="text"
                            value={award.year}
                            onChange={(e) => updateItem('awards', index, 'year', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="2023"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                          <textarea
                            value={award.description}
                            onChange={(e) => updateItem('awards', index, 'description', e.target.value)}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Recognized for outstanding contribution to quality improvement initiatives"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => addItem('awards', { title: '', organization: '', year: '', description: '' })}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    + Add Award
                  </button>
                </div>
              )}

              {/* Publications */}
              {currentStep === 10 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Publications</h2>
                  <p className="text-gray-600 mb-6">Showcase your published articles, research papers, and thought leadership content.</p>
                  {formData.publications.map((pub, index) => (
                    <div key={index} className="bg-gray-50 p-6 rounded-xl mb-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold text-gray-900">Publication {index + 1}</h4>
                        {formData.publications.length > 1 && (
                          <button
                            onClick={() => removeItem('publications', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                          <input
                            type="text"
                            value={pub.title}
                            onChange={(e) => updateItem('publications', index, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Modern API Testing Strategies for Microservices"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Publication/Journal</label>
                          <input
                            type="text"
                            value={pub.publication}
                            onChange={(e) => updateItem('publications', index, 'publication', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Testing Magazine"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                          <input
                            type="text"
                            value={pub.year}
                            onChange={(e) => updateItem('publications', index, 'year', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="2023"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">URL (Optional)</label>
                          <input
                            type="url"
                            value={pub.url}
                            onChange={(e) => updateItem('publications', index, 'url', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="https://testingmag.com/api-testing-strategies"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => addItem('publications', { title: '', publication: '', year: '', url: '' })}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    + Add Publication
                  </button>
                </div>
              )}

              {/* Conference Participation */}
              {currentStep === 11 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Conference Participation</h2>
                  <p className="text-gray-600 mb-6">List conferences where you've spoken, presented, or participated as an expert.</p>
                  {formData.conferences.map((conf, index) => (
                    <div key={index} className="bg-gray-50 p-6 rounded-xl mb-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold text-gray-900">Conference {index + 1}</h4>
                        {formData.conferences.length > 1 && (
                          <button
                            onClick={() => removeItem('conferences', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Conference Name</label>
                          <input
                            type="text"
                            value={conf.name}
                            onChange={(e) => updateItem('conferences', index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="International Software Testing Conference"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                          <select
                            value={conf.role}
                            onChange={(e) => updateItem('conferences', index, 'role', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Role</option>
                            <option value="Speaker">Speaker</option>
                            <option value="Keynote Speaker">Keynote Speaker</option>
                            <option value="Panelist">Panelist</option>
                            <option value="Workshop Leader">Workshop Leader</option>
                            <option value="Attendee">Attendee</option>
                            <option value="Organizer">Organizer</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                          <input
                            type="text"
                            value={conf.year}
                            onChange={(e) => updateItem('conferences', index, 'year', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="2023"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                          <input
                            type="text"
                            value={conf.location}
                            onChange={(e) => updateItem('conferences', index, 'location', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="San Francisco, CA"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => addItem('conferences', { name: '', role: '', year: '', location: '' })}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    + Add Conference
                  </button>
                </div>
              )}

              {/* Professional Affiliations */}
              {currentStep === 12 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Affiliations</h2>
                  <p className="text-gray-600 mb-6">List your memberships in professional organizations, societies, and industry groups.</p>
                  {formData.affiliations.map((affiliation, index) => (
                    <div key={index} className="bg-gray-50 p-6 rounded-xl mb-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold text-gray-900">Affiliation {index + 1}</h4>
                        {formData.affiliations.length > 1 && (
                          <button
                            onClick={() => removeItem('affiliations', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Organization</label>
                          <input
                            type="text"
                            value={affiliation.organization}
                            onChange={(e) => updateItem('affiliations', index, 'organization', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="ISTQB (International Software Testing Qualifications Board)"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Role/Position</label>
                          <input
                            type="text"
                            value={affiliation.role}
                            onChange={(e) => updateItem('affiliations', index, 'role', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Certified Member"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Member Since</label>
                          <input
                            type="text"
                            value={affiliation.since}
                            onChange={(e) => updateItem('affiliations', index, 'since', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="2020"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                          <select
                            value={affiliation.status}
                            onChange={(e) => updateItem('affiliations', index, 'status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Lifetime">Lifetime</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => addItem('affiliations', { organization: '', role: '', since: '', status: 'Active' })}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    + Add Affiliation
                  </button>
                </div>
              )}

              {/* Review & Download */}
              {currentStep === 13 && (
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Download className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Enhanced QA Resume is Ready!</h2>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Professional QA resume with industry-leading sections, optimized for ATS systems and world-class formatting.
                  </p>
                  
                  <div className="bg-blue-50 p-6 rounded-xl mb-8">
                    <h3 className="font-semibold text-blue-900 mb-4">Resume Includes:</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-blue-800">
                      {steps.filter(step => step.id !== 'review').map(step => (
                        <div key={step.id} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          {step.title}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                      onClick={() => {
                        const printWindow = window.open('', '_blank');
                        printWindow.document.write(generateResumeHTML());
                        printWindow.document.close();
                        printWindow.focus();
                        setTimeout(() => printWindow.print(), 250);
                      }}
                      className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                      Preview & Print
                    </button>
                    <button
                      onClick={downloadResume}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
                    >
                      <Download className="w-5 h-5" />
                      Download Resume
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all"
                >
                  Previous
                </button>
                
                {currentStep < steps.length - 1 ? (
                  <button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all"
                  >
                    Next
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QAResumeBuilderPage;