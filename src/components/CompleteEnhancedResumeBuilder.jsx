import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Shield, User, Target, Star, Code, Settings, Briefcase, Award, 
  GraduationCap, CheckCircle, Download, Eye, BookOpen, Github, Users, 
  ExternalLink, Lightbulb, Globe, Heart, Plus, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  OpenSourceSection, MembershipsSection, PortfolioSection, 
  PatentsSection, LanguagesSection, VolunteerSection 
} from './ResumeSections';
import { previewResume, downloadHTML, printResume, resumeTemplates } from '../utils/resumeExportSimple';

const CompleteEnhancedResumeBuilder = ({ onBack, userEmail }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [sectionsEnabled, setSectionsEnabled] = useState({
    achievements: true,
    awards: true,
    languages: true,
    volunteer: true,
    publications: true,
    openSource: true,
    memberships: true,
    portfolio: true,
    patents: true
  });

  const [formData, setFormData] = useState({
    personal: {
      name: '',
      jobTitle: 'QA Engineer',
      email: userEmail || '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      portfolio: ''
    },
    summary: '',
    coreCompetencies: [],
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
    projects: [{ title: '', description: '', technologies: '', impact: '' }],
    achievements: [{ title: '', organization: '', year: '', description: '' }],
    certifications: [{ name: '', organization: '', year: '', credentialId: '' }],
    education: [{ degree: '', university: '', year: '', gpa: '' }],
    awards: [{ title: '', organization: '', year: '', description: '' }],
    languages: [{ language: '', proficiency: 'Professional' }],
    volunteer: [{ organization: '', role: '', duration: '', description: '' }],
    publications: [{ title: '', publication: '', date: '', url: '', type: 'Article' }],
    openSource: [{ project: '', description: '', role: '', technologies: '', url: '', stars: '' }],
    memberships: [{ organization: '', role: '', since: '', level: '' }],
    portfolio: [{ title: '', description: '', url: '', type: 'Case Study', technologies: '' }],
    patents: [{ title: '', patentNumber: '', status: 'Pending', date: '', description: '' }]
  });

  const steps = [
    { id: 'personal', title: 'Personal Info', icon: User },
    { id: 'summary', title: 'Professional Summary', icon: Target },
    { id: 'competencies', title: 'Core Competencies', icon: Star },
    { id: 'skills', title: 'Technical Skills', icon: Code },
    { id: 'tools', title: 'Tools & Technologies', icon: Settings },
    { id: 'experience', title: 'Work Experience', icon: Briefcase },
    { id: 'projects', title: 'Projects', icon: Settings },
    { id: 'achievements', title: 'Achievements & Impact', icon: Award },
    { id: 'certifications', title: 'Certifications', icon: CheckCircle },
    { id: 'education', title: 'Education', icon: GraduationCap },
    { id: 'awards', title: 'Awards & Recognition', icon: Award },
    { id: 'languages', title: 'Languages', icon: Globe },
    { id: 'volunteer', title: 'Volunteer Work', icon: Heart },
    { id: 'publications', title: 'Publications & Talks', icon: BookOpen },
    { id: 'opensource', title: 'Open Source Contributions', icon: Github },
    { id: 'memberships', title: 'Professional Memberships', icon: Users },
    { id: 'portfolio', title: 'Portfolio & Case Studies', icon: ExternalLink },
    { id: 'patents', title: 'Patents & Innovations', icon: Lightbulb },
    { id: 'review', title: 'Download Resume', icon: Download }
  ];

  const skillCategories = {
    testing: ['Manual Testing', 'Functional Testing', 'Regression Testing', 'API Testing', 'Performance Testing', 'Security Testing', 'Usability Testing', 'Accessibility Testing'],
    automation: ['Selenium WebDriver', 'Playwright', 'Cypress', 'TestComplete', 'Appium', 'Robot Framework', 'Katalon Studio', 'Puppeteer'],
    programming: ['Java', 'Python', 'JavaScript', 'C#', 'TypeScript', 'SQL', 'Bash/Shell', 'PowerShell'],
    databases: ['MySQL', 'PostgreSQL', 'MongoDB', 'Oracle', 'SQL Server', 'Redis', 'Cassandra', 'DynamoDB']
  };

  const toolCategories = {
    testManagement: ['JIRA', 'TestRail', 'Zephyr', 'qTest', 'PractiTest', 'TestLink', 'Azure Test Plans'],
    automation: ['Jenkins', 'GitLab CI', 'GitHub Actions', 'Azure DevOps', 'TeamCity', 'Bamboo', 'CircleCI'],
    cicd: ['Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Terraform', 'Ansible'],
    monitoring: ['Grafana', 'Prometheus', 'New Relic', 'Datadog', 'Splunk', 'ELK Stack']
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

  const toggleTool = (category, tool) => {
    setFormData(prev => ({
      ...prev,
      tools: {
        ...prev.tools,
        [category]: prev.tools[category].includes(tool)
          ? prev.tools[category].filter(t => t !== tool)
          : [...prev.tools[category], tool]
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

  const addItem = (section, item) => {
    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], item]
    }));
  };

  const removeItem = (section, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
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

  const addAchievement = (expIndex) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === expIndex ? { ...exp, achievements: [...exp.achievements, ''] } : exp
      )
    }));
  };

  const updateAchievement = (expIndex, achIndex, value) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === expIndex ? {
          ...exp,
          achievements: exp.achievements.map((ach, j) => j === achIndex ? value : ach)
        } : exp
      )
    }));
  };

  const toggleSection = (sectionName) => {
    setSectionsEnabled(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const getVisibleSteps = () => {
    return steps;
  };

  const [selectedTemplate, setSelectedTemplate] = useState('modernMinimal');
  const [atsScore, setAtsScore] = useState(0);
  const [atsAnalysis, setAtsAnalysis] = useState({
    keywords: 0,
    sections: 0,
    format: 0,
    suggestions: []
  });

  // Real-time ATS scoring
  useEffect(() => {
    const calculateAtsScore = () => {
      let score = 0;
      let keywords = 0;
      let sections = 0;
      let format = 0;
      let suggestions = [];

      // Keywords scoring (40 points) - More comprehensive
      const allSkills = [
        ...formData.coreCompetencies,
        ...Object.values(formData.technicalSkills).flat(),
        ...Object.values(formData.tools).flat()
      ].filter(skill => skill && skill.trim().length > 0);
      
      keywords = Math.min(allSkills.length * 1.5, 40);
      if (keywords < 15) suggestions.push('Add more technical skills and tools (aim for 25+ keywords)');
      if (keywords < 25) suggestions.push('Include more QA-specific keywords for better ATS matching');

      // Sections scoring (35 points) - Enhanced validation
      const sectionChecks = [
        formData.personal.name?.trim() && formData.personal.email?.trim(), // Personal info
        formData.summary?.trim() && formData.summary.length > 50, // Meaningful summary
        formData.experience.length > 0 && formData.experience[0].company?.trim(), // Experience
        formData.experience.length > 0 && formData.experience[0].achievements?.some(ach => ach?.trim()), // Achievements
        formData.certifications.length > 0 && formData.certifications[0].name?.trim(), // Certifications
        formData.education.length > 0 && formData.education[0].degree?.trim(), // Education
        formData.projects.length > 0 && formData.projects[0].title?.trim(), // Projects
        allSkills.length > 10 // Sufficient skills
      ];
      
      const completedSections = sectionChecks.filter(Boolean).length;
      sections = Math.min(completedSections * 4.5, 35);
      
      if (completedSections < 6) suggestions.push('Complete more core resume sections');
      if (!formData.summary?.trim()) suggestions.push('Add a professional summary');
      if (formData.experience.length === 0) suggestions.push('Add work experience');
      if (!formData.experience[0]?.achievements?.some(ach => ach?.trim())) {
        suggestions.push('Add quantifiable achievements to work experience');
      }

      // Format scoring (25 points) - Professional completeness
      format = 15; // Base format score
      
      if (formData.personal.linkedin?.trim()) format += 3;
      else suggestions.push('Add LinkedIn profile URL');
      
      if (formData.personal.github?.trim()) format += 3;
      else suggestions.push('Add GitHub profile for technical credibility');
      
      if (formData.personal.phone?.trim()) format += 2;
      else suggestions.push('Add phone number');
      
      if (formData.personal.location?.trim()) format += 2;
      else suggestions.push('Add location/city');

      // Bonus points for advanced sections
      if (formData.certifications.length > 0 && formData.certifications[0].name?.trim()) format += 2;
      if (formData.projects.length > 0 && formData.projects[0].title?.trim()) format += 2;

      score = Math.min(keywords + sections + format, 100);
      setAtsScore(score);
      setAtsAnalysis({ keywords: Math.round(keywords), sections: Math.round(sections), format: Math.round(format), suggestions });
    };

    calculateAtsScore();
  }, [formData]);

  const downloadResume = () => {
    try {
      downloadHTML(formData, selectedTemplate, sectionsEnabled);
      toast.success('🎉 Your professional QA resume has been downloaded!');
    } catch (error) {
      toast.error('Failed to download resume. Please try again.');
    }
  };

  const handlePreview = () => {
    try {
      previewResume(formData, selectedTemplate, sectionsEnabled);
      toast.success('Opening resume preview...');
    } catch (error) {
      toast.error('Failed to preview resume. Please try again.');
    }
  };

  const handlePrint = () => {
    try {
      printResume(formData, selectedTemplate, sectionsEnabled);
      toast.success('Opening print dialog...');
    } catch (error) {
      toast.error('Failed to print resume. Please try again.');
    }
  };

  const renderCurrentStep = () => {
    const visibleSteps = getVisibleSteps();
    const currentStepData = visibleSteps[currentStep];
    
    if (!currentStepData) return null;

    switch (currentStepData.id) {
      case 'personal':
        return (
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
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">GitHub</label>
                <input
                  type="url"
                  value={formData.personal.github}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    personal: { ...prev.personal, github: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://johndoe.dev"
                />
              </div>
            </div>
          </div>
        );

      case 'summary':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Summary</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Career Summary</label>
              <textarea
                value={formData.summary}
                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                rows="6"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Results-driven QA Engineer with 5+ years of experience in manual and automated testing across web, mobile, and API platforms. Proven track record of implementing comprehensive testing strategies that reduced production bugs by 85% and improved release velocity by 40%."
              />
              <p className="text-sm text-gray-500 mt-2">
                Tip: Include years of experience, key achievements, and quantifiable results
              </p>
            </div>
          </div>
        );

      case 'competencies':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Core Competencies</h2>
            <p className="text-gray-600 mb-6">Select your key professional competencies that make you stand out as a QA professional.</p>
            
            {/* Add Custom Competency */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3">Add Custom Competency</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter your custom competency..."
                  className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      const newCompetency = e.target.value.trim();
                      if (!formData.coreCompetencies.includes(newCompetency)) {
                        toggleCompetency(newCompetency);
                      }
                      e.target.value = '';
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    const input = e.target.previousElementSibling;
                    if (input.value.trim()) {
                      const newCompetency = input.value.trim();
                      if (!formData.coreCompetencies.includes(newCompetency)) {
                        toggleCompetency(newCompetency);
                      }
                      input.value = '';
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Selected Competencies */}
            {formData.coreCompetencies.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Selected Competencies</h3>
                <div className="flex flex-wrap gap-2">
                  {formData.coreCompetencies.map(competency => (
                    <span
                      key={competency}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {competency}
                      <button
                        onClick={() => toggleCompetency(competency)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Predefined Options */}
            <h3 className="font-semibold text-gray-900 mb-3">Common QA Competencies</h3>
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
        );

      case 'skills':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Skills</h2>
            {Object.entries(skillCategories).map(([category, skills]) => {
              const categoryTitle = category === 'testing' ? 'Testing Methodologies' : 
                                  category === 'automation' ? 'Automation Frameworks' :
                                  category === 'programming' ? 'Programming Languages' : 'Database Technologies';
              return (
                <div key={category} className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{categoryTitle}</h3>
                  
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={`Add custom ${categoryTitle.toLowerCase()}...`}
                        className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            const newSkill = e.target.value.trim();
                            if (!formData.technicalSkills[category].includes(newSkill)) {
                              toggleSkill(category, newSkill);
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
                              toggleSkill(category, newSkill);
                            }
                            input.value = '';
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {formData.technicalSkills[category].length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Selected Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.technicalSkills[category].map(skill => (
                          <span key={skill} className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {skill}
                            <button onClick={() => toggleSkill(category, skill)} className="text-blue-600 hover:text-blue-800">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <h4 className="font-medium text-gray-900 mb-2">Common Options</h4>
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
              );
            })}
          </div>
        );

      case 'tools':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tools & Technologies</h2>
            {Object.entries(toolCategories).map(([category, tools]) => {
              const categoryTitle = category === 'testManagement' ? 'Test Management Tools' : 
                                  category === 'automation' ? 'CI/CD & Automation' :
                                  category === 'cicd' ? 'Cloud & Infrastructure' : 'Monitoring & Analytics';
              return (
                <div key={category} className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{categoryTitle}</h3>
                  
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={`Add custom ${categoryTitle.toLowerCase()}...`}
                        className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            const newTool = e.target.value.trim();
                            if (!formData.tools[category].includes(newTool)) {
                              toggleTool(category, newTool);
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
                              toggleTool(category, newTool);
                            }
                            input.value = '';
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {formData.tools[category].length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Selected Tools</h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.tools[category].map(tool => (
                          <span key={tool} className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {tool}
                            <button onClick={() => toggleTool(category, tool)} className="text-blue-600 hover:text-blue-800">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <h4 className="font-medium text-gray-900 mb-2">Common Options</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {tools.map(tool => (
                      <label key={tool} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-blue-50 border border-gray-200">
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
                </div>
              );
            })}
          </div>
        );

      case 'experience':
        return (
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
                      <X className="w-5 h-5" />
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
                        onChange={(e) => updateAchievement(index, achIndex, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Led QA team of 5 engineers, implementing automated testing that reduced manual testing time by 60%"
                      />
                      {exp.achievements.length > 1 && (
                        <button
                          onClick={() => {
                            const newAchievements = exp.achievements.filter((_, i) => i !== achIndex);
                            updateItem('experience', index, 'achievements', newAchievements);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addAchievement(index)}
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
              <Plus className="w-4 h-4" />
              Add Experience
            </button>
          </div>
        );

      case 'awards':
        return (
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
                      <X className="w-5 h-5" />
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
              <Plus className="w-4 h-4" />
              Add Award
            </button>
          </div>
        );

      case 'publications':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Publications & Talks</h2>
            <p className="text-gray-600 mb-6">Showcase your thought leadership and expertise through publications, blog posts, and speaking engagements.</p>
            
            {formData.publications.map((publication, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl mb-4 border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-semibold text-gray-900">Publication {index + 1}</h4>
                  {formData.publications.length > 1 && (
                    <button
                      onClick={() => removeItem('publications', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={publication.title}
                      onChange={(e) => updateItem('publications', index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Modern API Testing Strategies"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Publication/Platform</label>
                    <input
                      type="text"
                      value={publication.publication}
                      onChange={(e) => updateItem('publications', index, 'publication', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Testing Magazine, Medium, Conference"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                    <input
                      type="month"
                      value={publication.date}
                      onChange={(e) => updateItem('publications', index, 'date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                    <input
                      type="text"
                      value={publication.type}
                      onChange={(e) => updateItem('publications', index, 'type', e.target.value)}
                      list={`pub-types-${index}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter or select type..."
                    />
                    <datalist id={`pub-types-${index}`}>
                      <option value="Article" />
                      <option value="Blog Post" />
                      <option value="Conference Talk" />
                      <option value="Webinar" />
                      <option value="Podcast" />
                      <option value="White Paper" />
                    </datalist>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">URL</label>
                    <input
                      type="url"
                      value={publication.url}
                      onChange={(e) => updateItem('publications', index, 'url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/article"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <button
              onClick={() => addItem('publications', { title: '', publication: '', date: '', url: '', type: 'Article' })}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Publication
            </button>
          </div>
        );

      case 'opensource':
        return (
          <OpenSourceSection 
            formData={formData} 
            updateItem={updateItem} 
            addItem={addItem} 
            removeItem={removeItem} 
          />
        );
      
      case 'memberships':
        return (
          <MembershipsSection 
            formData={formData} 
            updateItem={updateItem} 
            addItem={addItem} 
            removeItem={removeItem} 
          />
        );
      
      case 'portfolio':
        return (
          <PortfolioSection 
            formData={formData} 
            updateItem={updateItem} 
            addItem={addItem} 
            removeItem={removeItem} 
          />
        );
      
      case 'patents':
        return (
          <PatentsSection 
            formData={formData} 
            updateItem={updateItem} 
            addItem={addItem} 
            removeItem={removeItem} 
          />
        );
      
      case 'languages':
        return (
          <LanguagesSection 
            formData={formData} 
            updateItem={updateItem} 
            addItem={addItem} 
            removeItem={removeItem} 
          />
        );
      
      case 'volunteer':
        return (
          <VolunteerSection 
            formData={formData} 
            updateItem={updateItem} 
            addItem={addItem} 
            removeItem={removeItem} 
          />
        );

      case 'projects':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Projects</h2>
            <p className="text-gray-600 mb-6">Showcase your key projects and their impact on quality and testing processes.</p>
            
            {formData.projects.map((project, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl mb-4 border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-semibold text-gray-900">Project {index + 1}</h4>
                  {formData.projects.length > 1 && (
                    <button
                      onClick={() => removeItem('projects', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
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
                      placeholder="E-commerce Testing Framework"
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
                      placeholder="Developed comprehensive testing framework for e-commerce platform with automated regression testing"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Impact & Results</label>
                    <textarea
                      value={project.impact}
                      onChange={(e) => updateItem('projects', index, 'impact', e.target.value)}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Reduced testing time by 70%, improved bug detection rate by 85%"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <button
              onClick={() => addItem('projects', { title: '', description: '', technologies: '', impact: '' })}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Project
            </button>
          </div>
        );

      case 'review':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Download className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Enhanced QA Resume is Ready!</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Professional QA resume with advanced sections, optimized for ATS systems and designed to stand out in 2025.
            </p>
            
            <div className="bg-gray-50 p-6 rounded-xl mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Choose Template</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(resumeTemplates).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTemplate(key)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedTemplate === key
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-full h-16 rounded mb-2" style={{ backgroundColor: template.colors.primary }}></div>
                    <div className="text-sm font-medium text-gray-900">{template.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* ATS Score Display */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl mb-8 border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">ATS Optimization Score</h3>
                <div className={`text-2xl font-bold ${
                  atsScore >= 80 ? 'text-green-600' : 
                  atsScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {atsScore}%
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    atsScore >= 80 ? 'bg-green-500' : 
                    atsScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${atsScore}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-gray-700">Keywords</div>
                  <div className="text-blue-600">{atsAnalysis.keywords}/40</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-700">Sections</div>
                  <div className="text-blue-600">{atsAnalysis.sections}/35</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-700">Format</div>
                  <div className="text-blue-600">{atsAnalysis.format}/25</div>
                </div>
              </div>
              
              {atsAnalysis.suggestions.length > 0 && (
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-2">💡 Suggestions to improve:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {atsAnalysis.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-6 rounded-xl mb-8">
              <h3 className="font-semibold text-blue-900 mb-4">Resume Includes:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-blue-800">
                {getVisibleSteps().filter(step => step.id !== 'review').map(step => (
                  <div key={step.id} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    {step.title}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handlePreview}
                className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors"
              >
                <Eye className="w-5 h-5" />
                Preview Resume
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-blue-100 text-blue-700 px-6 py-3 rounded-xl hover:bg-blue-200 transition-colors"
              >
                <Download className="w-5 h-5" />
                Print Resume
              </button>
              <button
                onClick={downloadResume}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </button>
            </div>
          </div>
        );

      case 'achievements':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Achievements & Impact</h2>
            <p className="text-gray-600 mb-6">Highlight your key professional achievements and measurable impact.</p>
            
            {formData.achievements.map((achievement, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl mb-4 border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-semibold text-gray-900">Achievement {index + 1}</h4>
                  {formData.achievements.length > 1 && (
                    <button
                      onClick={() => removeItem('achievements', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Achievement Title</label>
                    <input
                      type="text"
                      value={achievement.title}
                      onChange={(e) => updateItem('achievements', index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Reduced Production Bugs by 85%"
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
                      placeholder="Implemented comprehensive testing strategy that reduced production bugs by 85% and improved customer satisfaction"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <button
              onClick={() => addItem('achievements', { title: '', organization: '', year: '', description: '' })}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Achievement
            </button>
          </div>
        );

      case 'certifications':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Certifications</h2>
            <p className="text-gray-600 mb-6">List your professional certifications and credentials.</p>
            
            {formData.certifications.map((cert, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl mb-4 border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-semibold text-gray-900">Certification {index + 1}</h4>
                  {formData.certifications.length > 1 && (
                    <button
                      onClick={() => removeItem('certifications', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
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
                      placeholder="ISTQB Foundation Level"
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
                      placeholder="2023"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Credential ID</label>
                    <input
                      type="text"
                      value={cert.credentialId}
                      onChange={(e) => updateItem('certifications', index, 'credentialId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="ISTQB-FL-12345"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <button
              onClick={() => addItem('certifications', { name: '', organization: '', year: '', credentialId: '' })}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Certification
            </button>
          </div>
        );

      case 'education':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Education</h2>
            <p className="text-gray-600 mb-6">List your educational background and qualifications.</p>
            
            {formData.education.map((edu, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl mb-4 border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-semibold text-gray-900">Education {index + 1}</h4>
                  {formData.education.length > 1 && (
                    <button
                      onClick={() => removeItem('education', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
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
                      placeholder="Bachelor of Computer Science"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">University/Institution</label>
                    <input
                      type="text"
                      value={edu.university}
                      onChange={(e) => updateItem('education', index, 'university', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Stanford University"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                    <input
                      type="text"
                      value={edu.year}
                      onChange={(e) => updateItem('education', index, 'year', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="2020"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">GPA (optional)</label>
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
              <Plus className="w-4 h-4" />
              Add Education
            </button>
          </div>
        );

      default:
        return <div>Section not implemented yet</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">




      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {getVisibleSteps().length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStep + 1) / getVisibleSteps().length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-blue-700 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / getVisibleSteps().length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8">
              <h3 className="font-bold text-gray-900 mb-4">Resume Sections</h3>
              <div className="space-y-2 overflow-y-auto pr-4 resume-sidebar-scroll" style={{maxHeight: 'calc(100vh - 280px)'}}>
                {getVisibleSteps().map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === index;
                  const isCompleted = currentStep > index;
                  const isEnabled = true;
                  
                  return (
                    <div
                      key={step.id}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                        isActive 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : isCompleted
                          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                          : isEnabled
                          ? 'text-gray-600 hover:bg-gray-100'
                          : 'text-gray-400 opacity-50'
                      }`}
                      onClick={() => isEnabled && setCurrentStep(index)}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isActive ? 'bg-white/20' : isCompleted ? 'bg-blue-100' : 'bg-gray-200'
                      }`}>
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : isCompleted ? 'text-blue-600' : 'text-gray-500'}`} />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-sm block">{step.title}</span>
                      </div>
                      {isCompleted && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="overflow-y-auto max-h-[calc(100vh-300px)] pr-4">
                {renderCurrentStep()}
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>
                
                {currentStep < getVisibleSteps().length - 1 ? (
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

export default CompleteEnhancedResumeBuilder;