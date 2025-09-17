import React from 'react';
import { Plus, X, ExternalLink, Github, Users, Lightbulb, Globe, Heart } from 'lucide-react';

// Open Source Contributions Section
export const OpenSourceSection = ({ formData, updateItem, addItem, removeItem }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Open Source Contributions</h2>
    <p className="text-gray-600 mb-6">Highlight your contributions to open source projects and community involvement.</p>
    
    {formData.openSource.map((project, index) => (
      <div key={index} className="bg-gray-50 p-6 rounded-xl mb-4 border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Github className="w-5 h-5" />
            Project {index + 1}
          </h4>
          {formData.openSource.length > 1 && (
            <button
              onClick={() => removeItem('openSource', index)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Project Name</label>
            <input
              type="text"
              value={project.project}
              onChange={(e) => updateItem('openSource', index, 'project', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="TestUtils Library"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Your Role</label>
            <input
              type="text"
              value={project.role}
              onChange={(e) => updateItem('openSource', index, 'role', e.target.value)}
              list={`roles-${index}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter or select role..."
            />
            <datalist id={`roles-${index}`}>
              <option value="Maintainer" />
              <option value="Core Contributor" />
              <option value="Contributor" />
              <option value="Creator" />
            </datalist>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              value={project.description}
              onChange={(e) => updateItem('openSource', index, 'description', e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Open-source testing utilities for web applications with focus on automation and reliability"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Technologies</label>
            <input
              type="text"
              value={project.technologies}
              onChange={(e) => updateItem('openSource', index, 'technologies', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="JavaScript, Node.js, Jest"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">GitHub Stars (optional)</label>
            <input
              type="number"
              value={project.stars}
              onChange={(e) => updateItem('openSource', index, 'stars', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="245"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Repository URL</label>
            <input
              type="url"
              value={project.url}
              onChange={(e) => updateItem('openSource', index, 'url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://github.com/username/project"
            />
          </div>
        </div>
      </div>
    ))}
    
    <button
      onClick={() => addItem('openSource', { project: '', description: '', role: '', technologies: '', url: '', stars: '' })}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <Plus className="w-4 h-4" />
      Add Open Source Project
    </button>
  </div>
);

// Professional Memberships Section
export const MembershipsSection = ({ formData, updateItem, addItem, removeItem }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Memberships & Affiliations</h2>
    <p className="text-gray-600 mb-6">Showcase your professional associations and industry involvement.</p>
    
    {formData.memberships.map((membership, index) => (
      <div key={index} className="bg-gray-50 p-6 rounded-xl mb-4 border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Membership {index + 1}
          </h4>
          {formData.memberships.length > 1 && (
            <button
              onClick={() => removeItem('memberships', index)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Organization</label>
            <input
              type="text"
              value={membership.organization}
              onChange={(e) => updateItem('memberships', index, 'organization', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="ISTQB (International Software Testing Qualifications Board)"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Role/Status</label>
            <input
              type="text"
              value={membership.role}
              onChange={(e) => updateItem('memberships', index, 'role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Certified Member, Board Member, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Member Since</label>
            <input
              type="text"
              value={membership.since}
              onChange={(e) => updateItem('memberships', index, 'since', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="2020"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Level/Certification</label>
            <input
              type="text"
              value={membership.level}
              onChange={(e) => updateItem('memberships', index, 'level', e.target.value)}
              list={`levels-${index}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter or select level..."
            />
            <datalist id={`levels-${index}`}>
              <option value="Foundation" />
              <option value="Advanced" />
              <option value="Expert" />
              <option value="Professional" />
              <option value="Associate" />
              <option value="Fellow" />
            </datalist>
          </div>
        </div>
      </div>
    ))}
    
    <button
      onClick={() => addItem('memberships', { organization: '', role: '', since: '', level: '' })}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <Plus className="w-4 h-4" />
      Add Membership
    </button>
  </div>
);

// Portfolio/Case Studies Section
export const PortfolioSection = ({ formData, updateItem, addItem, removeItem }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Portfolio & Case Studies</h2>
    <p className="text-gray-600 mb-6">Showcase your best work and detailed case studies with measurable results.</p>
    
    {formData.portfolio.map((item, index) => (
      <div key={index} className="bg-gray-50 p-6 rounded-xl mb-4 border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Portfolio Item {index + 1}
          </h4>
          {formData.portfolio.length > 1 && (
            <button
              onClick={() => removeItem('portfolio', index)}
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
              value={item.title}
              onChange={(e) => updateItem('portfolio', index, 'title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="QA Process Optimization Case Study"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
            <input
              type="text"
              value={item.type}
              onChange={(e) => updateItem('portfolio', index, 'type', e.target.value)}
              list={`types-${index}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter or select type..."
            />
            <datalist id={`types-${index}`}>
              <option value="Case Study" />
              <option value="Project Portfolio" />
              <option value="Testing Framework" />
              <option value="Process Documentation" />
              <option value="Tool Implementation" />
            </datalist>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              value={item.description}
              onChange={(e) => updateItem('portfolio', index, 'description', e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Complete transformation of testing processes at Fortune 500 company, resulting in 60% reduction in defects and 40% faster releases"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Technologies Used</label>
            <input
              type="text"
              value={item.technologies}
              onChange={(e) => updateItem('portfolio', index, 'technologies', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Selenium, Jenkins, JIRA, TestRail"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Portfolio URL</label>
            <input
              type="url"
              value={item.url}
              onChange={(e) => updateItem('portfolio', index, 'url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://yourportfolio.com/case-study"
            />
          </div>
        </div>
      </div>
    ))}
    
    <button
      onClick={() => addItem('portfolio', { title: '', description: '', url: '', type: 'Case Study', technologies: '' })}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <Plus className="w-4 h-4" />
      Add Portfolio Item
    </button>
  </div>
);

// Patents/Innovations Section
export const PatentsSection = ({ formData, updateItem, addItem, removeItem }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Patents & Innovations</h2>
    <p className="text-gray-600 mb-6">Highlight your intellectual property and innovative contributions to the field.</p>
    
    {formData.patents.map((patent, index) => (
      <div key={index} className="bg-gray-50 p-6 rounded-xl mb-4 border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Patent {index + 1}
          </h4>
          {formData.patents.length > 1 && (
            <button
              onClick={() => removeItem('patents', index)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Patent Title</label>
            <input
              type="text"
              value={patent.title}
              onChange={(e) => updateItem('patents', index, 'title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Automated Test Case Generation System"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Patent Number</label>
            <input
              type="text"
              value={patent.patentNumber}
              onChange={(e) => updateItem('patents', index, 'patentNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="US10,123,456"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <input
              type="text"
              value={patent.status}
              onChange={(e) => updateItem('patents', index, 'status', e.target.value)}
              list={`statuses-${index}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter or select status..."
            />
            <datalist id={`statuses-${index}`}>
              <option value="Pending" />
              <option value="Granted" />
              <option value="Published" />
              <option value="Filed" />
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={patent.date}
              onChange={(e) => updateItem('patents', index, 'date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              value={patent.description}
              onChange={(e) => updateItem('patents', index, 'description', e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="AI-powered system for generating comprehensive test cases from user stories and requirements"
            />
          </div>
        </div>
      </div>
    ))}
    
    <button
      onClick={() => addItem('patents', { title: '', patentNumber: '', status: 'Pending', date: '', description: '' })}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <Plus className="w-4 h-4" />
      Add Patent
    </button>
  </div>
);

// Languages Section
export const LanguagesSection = ({ formData, updateItem, addItem, removeItem }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Languages</h2>
    <p className="text-gray-600 mb-6">List your language proficiencies for global opportunities.</p>
    
    {formData.languages.map((language, index) => (
      <div key={index} className="bg-gray-50 p-6 rounded-xl mb-4 border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Language {index + 1}
          </h4>
          {formData.languages.length > 1 && (
            <button
              onClick={() => removeItem('languages', index)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
            <input
              type="text"
              value={language.language}
              onChange={(e) => updateItem('languages', index, 'language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Spanish"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Proficiency Level</label>
            <input
              type="text"
              value={language.proficiency}
              onChange={(e) => updateItem('languages', index, 'proficiency', e.target.value)}
              list={`proficiency-${index}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter or select proficiency..."
            />
            <datalist id={`proficiency-${index}`}>
              <option value="Native" />
              <option value="Fluent" />
              <option value="Professional" />
              <option value="Conversational" />
              <option value="Basic" />
            </datalist>
          </div>
        </div>
      </div>
    ))}
    
    <button
      onClick={() => addItem('languages', { language: '', proficiency: 'Professional' })}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <Plus className="w-4 h-4" />
      Add Language
    </button>
  </div>
);

// Volunteer Work Section
export const VolunteerSection = ({ formData, updateItem, addItem, removeItem }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Volunteer Work</h2>
    <p className="text-gray-600 mb-6">Showcase your community involvement and volunteer contributions.</p>
    
    {formData.volunteer.map((volunteer, index) => (
      <div key={index} className="bg-gray-50 p-6 rounded-xl mb-4 border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Volunteer Experience {index + 1}
          </h4>
          {formData.volunteer.length > 1 && (
            <button
              onClick={() => removeItem('volunteer', index)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Organization</label>
            <input
              type="text"
              value={volunteer.organization}
              onChange={(e) => updateItem('volunteer', index, 'organization', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Code for Good"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
            <input
              type="text"
              value={volunteer.role}
              onChange={(e) => updateItem('volunteer', index, 'role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="QA Volunteer"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
            <input
              type="text"
              value={volunteer.duration}
              onChange={(e) => updateItem('volunteer', index, 'duration', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="2021 - Present"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              value={volunteer.description}
              onChange={(e) => updateItem('volunteer', index, 'description', e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Provide testing expertise for non-profit technology projects, helping organizations improve their software quality"
            />
          </div>
        </div>
      </div>
    ))}
    
    <button
      onClick={() => addItem('volunteer', { organization: '', role: '', duration: '', description: '' })}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <Plus className="w-4 h-4" />
      Add Volunteer Experience
    </button>
  </div>
);