import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Shield, User, Target, Star, Code, Settings, Briefcase, Award, 
  GraduationCap, CheckCircle, Download, Eye, BookOpen, Github, Users, 
  ExternalLink, Lightbulb, Globe, Heart, ChevronDown, ChevronUp, Plus, X
} from 'lucide-react';
import toast from 'react-hot-toast';

const EnhancedQAResumeBuilder = ({ onBack, userEmail }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [sectionsEnabled, setSectionsEnabled] = useState({
    publications: false,
    openSource: false,
    memberships: false,
    portfolio: false,
    patents: false,
    achievements: true,
    languages: false,
    volunteer: false
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
      databases: [],
      tools: []
    },
    experience: [{ company: '', role: '', duration: '', location: '', achievements: [''] }],
    projects: [{ title: '', description: '', technologies: '', impact: '' }],
    achievements: [{ title: '', organization: '', year: '', description: '' }],
    certifications: [{ name: '', organization: '', year: '', credentialId: '' }],
    education: [{ degree: '', university: '', year: '', gpa: '' }],
    publications: [{ title: '', publication: '', date: '', url: '', type: 'Article' }],
    openSource: [{ project: '', description: '', role: '', technologies: '', url: '', stars: '' }],
    memberships: [{ organization: '', role: '', since: '', level: '' }],
    portfolio: [{ title: '', description: '', url: '', type: 'Case Study', technologies: '' }],
    patents: [{ title: '', patentNumber: '', status: 'Pending', date: '', description: '' }],
    languages: [{ language: '', proficiency: 'Professional' }],
    volunteer: [{ organization: '', role: '', duration: '', description: '' }]
  });

  const steps = [
    { id: 'personal', title: 'Personal Info', icon: User, required: true },
    { id: 'summary', title: 'Summary', icon: Target, required: true },
    { id: 'competencies', title: 'Core Competencies', icon: Star, required: true },
    { id: 'skills', title: 'Technical Skills', icon: Code, required: true },
    { id: 'experience', title: 'Experience', icon: Briefcase, required: true },
    { id: 'projects', title: 'Projects', icon: Settings, required: true },
    { id: 'achievements', title: 'Achievements', icon: Award, required: false },
    { id: 'certifications', title: 'Certifications', icon: CheckCircle, required: true },
    { id: 'education', title: 'Education', icon: GraduationCap, required: true },
    { id: 'publications', title: 'Publications', icon: BookOpen, required: false },
    { id: 'opensource', title: 'Open Source', icon: Github, required: false },
    { id: 'memberships', title: 'Memberships', icon: Users, required: false },
    { id: 'portfolio', title: 'Portfolio', icon: ExternalLink, required: false },
    { id: 'patents', title: 'Patents', icon: Lightbulb, required: false },
    { id: 'languages', title: 'Languages', icon: Globe, required: false },
    { id: 'volunteer', title: 'Volunteer Work', icon: Heart, required: false },
    { id: 'review', title: 'Review & Download', icon: Download, required: true }
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

  const toggleSection = (sectionName) => {
    setSectionsEnabled(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const getVisibleSteps = () => {
    return steps.filter(step => {
      if (step.required) return true;
      return sectionsEnabled[step.id] || step.id === 'review';
    });
  };

  const downloadResume = () => {
    toast.success('🎉 Your professional QA resume is ready for download!');
  };

  const SectionToggle = ({ sectionName, title, description }) => (
    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div>
        <h4 className="font-semibold text-blue-900">{title}</h4>
        <p className="text-sm text-blue-700">{description}</p>
      </div>
      <button
        onClick={() => toggleSection(sectionName)}
        className={`px-4 py-2 rounded-lg font-medium transition-all ${
          sectionsEnabled[sectionName]
            ? 'bg-blue-600 text-white'
            : 'bg-white text-blue-600 border border-blue-300'
        }`}
      >
        {sectionsEnabled[sectionName] ? 'Enabled' : 'Enable'}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform duration-200" />
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
          </div>
        </div>
      </div>

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
              <div className="space-y-2">
                {getVisibleSteps().map((step, index) => {
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
                      {!step.required && <span className="text-xs opacity-75">(Optional)</span>}
                      {isCompleted && <div className="w-2 h-2 bg-green-500 rounded-full ml-auto" />}
                    </div>
                  );
                })}
              </div>
              
              {/* Section Toggles */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Optional Sections</h4>
                <div className="space-y-2">
                  {Object.entries({
                    publications: 'Publications',
                    openSource: 'Open Source',
                    memberships: 'Memberships',
                    portfolio: 'Portfolio',
                    patents: 'Patents',
                    achievements: 'Achievements',
                    languages: 'Languages',
                    volunteer: 'Volunteer'
                  }).map(([key, label]) => (
                    <label key={key} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sectionsEnabled[key]}
                        onChange={() => toggleSection(key)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl p-8">
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
                      placeholder="Results-driven QA Engineer with 5+ years of experience in manual and automated testing across web, mobile, and API platforms. Proven track record of implementing comprehensive testing strategies that reduced production bugs by 85% and improved release velocity by 40%."
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Tip: Include years of experience, key achievements, and quantifiable results
                    </p>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Skills & Tools</h2>
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

              {/* Publications Section */}
              {sectionsEnabled.publications && getVisibleSteps()[currentStep]?.id === 'publications' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Publications / Blogs / Talks</h2>
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
                          <select
                            value={publication.type}
                            onChange={(e) => updateItem('publications', index, 'type', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Article">Article</option>
                            <option value="Blog Post">Blog Post</option>
                            <option value="Conference Talk">Conference Talk</option>
                            <option value="Webinar">Webinar</option>
                            <option value="Podcast">Podcast</option>
                            <option value="White Paper">White Paper</option>
                          </select>
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
              )}

              {/* Review & Download */}
              {getVisibleSteps()[currentStep]?.id === 'review' && (
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Download className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Enhanced QA Resume is Ready!</h2>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Professional QA resume with advanced sections, optimized for ATS systems and designed to stand out in 2025.
                  </p>
                  
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
                  
                  <div className="flex gap-4 justify-center">
                    <button className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors">
                      <Eye className="w-5 h-5" />
                      Preview Resume
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

export default EnhancedQAResumeBuilder;