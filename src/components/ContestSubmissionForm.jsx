import React, { useState } from 'react';
import { X, Trophy, User, Mail, Phone, Clock, FileText, CheckCircle, AlertCircle, Upload, File } from 'lucide-react';
import { supabase, TABLES } from '../lib/supabase';
import { useModalScrollLock } from '../hooks/useModalScrollLock';
import toast from 'react-hot-toast';

const ContestSubmissionForm = ({ isOpen, onClose, contestData }) => {
  useModalScrollLock(isOpen);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    experience: '',
    title: '',
    description: '',
    impact: '',
    consent: false,
    attachmentFile: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';

    if (!formData.experience.trim()) newErrors.experience = 'Experience is required';
    if (!formData.title.trim()) newErrors.title = 'Technique title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.impact.trim()) newErrors.impact = 'Impact/Benefits is required';
    if (!formData.consent) newErrors.consent = 'You must agree to the terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {


      let fileUrl = null;
      
      // Upload file if provided
      if (formData.attachmentFile && supabase) {
        try {
          const fileExt = formData.attachmentFile.name.split('.').pop();
          const fileName = `contest-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `contest-attachments/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('testingvala-bucket')
            .upload(filePath, formData.attachmentFile);
          
          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('testingvala-bucket')
              .getPublicUrl(filePath);
            fileUrl = publicUrl;
          }
        } catch (uploadError) {
          console.warn('File upload failed:', uploadError);
        }
      }

      // Demo mode fallback
      if (!supabase) {
        const submissionData = {
          name: formData.fullName,
          email: formData.email,
          mobile: formData.mobile,
          company: 'Not provided',
          role: 'QA Professional',
          experience_years: formData.experience,
          contest_title: contestData?.theme || 'Advanced Testing Methodologies',
          technique_title: formData.title,
          technique_description: formData.description,
          impact_benefits: formData.impact,
          submission_text: `Title: ${formData.title}\n\nDescription: ${formData.description}\n\nImpact/Benefits: ${formData.impact}`,
          submission_file_url: fileUrl,
          status: 'pending',
          created_at: new Date().toISOString(),
          winner_rank: null,
          winner_announcement_timestamp: null
        };
        
        const localSubmissions = JSON.parse(localStorage.getItem('contest_submissions') || '[]');
        const demoSubmission = {
          id: Date.now(),
          ...submissionData,
          created_at: new Date().toISOString(),
          winner_rank: null,
          winner_announcement_timestamp: null
        };
        localSubmissions.push(demoSubmission);
        localStorage.setItem('contest_submissions', JSON.stringify(localSubmissions));
        
        console.log('Demo submission:', demoSubmission);
        toast.success('🎉 Contest submission successful! (Demo mode)');
        
        setFormData({
          fullName: '',
          email: '',
          mobile: '',
          experience: '',
          title: '',
          description: '',
          impact: '',
          consent: false,
          attachmentFile: null
        });
        
        onClose();
        return;
      }

      const submissionData = {
        name: formData.fullName,
        email: formData.email,
        mobile: formData.mobile,
        company: 'Not provided',
        role: 'QA Professional',
        experience_years: formData.experience,
        contest_title: contestData?.theme || 'Advanced Testing Methodologies',
        technique_title: formData.title,
        technique_description: formData.description,
        impact_benefits: formData.impact,
        submission_text: `Title: ${formData.title}\n\nDescription: ${formData.description}\n\nImpact/Benefits: ${formData.impact}`,
        submission_file_url: fileUrl,
        status: 'pending',
        created_at: new Date().toISOString(),
        winner_rank: null,
        winner_announcement_timestamp: null
      };

      const { data, error } = await supabase
        .from('contest_submissions')
        .insert([submissionData])
        .select();

      // Also save to localStorage as backup
      const localSubmissions = JSON.parse(localStorage.getItem('contest_submissions') || '[]');
      localSubmissions.push({
        id: Date.now(),
        ...submissionData,
        created_at: new Date().toISOString(),
        winner_rank: null,
        winner_announcement_timestamp: null
      });
      localStorage.setItem('contest_submissions', JSON.stringify(localSubmissions));

      if (error) {
        console.error('Submission error:', error);
        // Save to localStorage as fallback
        const localSubmissions = JSON.parse(localStorage.getItem('contest_submissions') || '[]');
        const fallbackSubmission = {
          id: Date.now(),
          ...submissionData,
          created_at: new Date().toISOString(),
          winner_rank: null,
          winner_announcement_timestamp: null
        };
        localSubmissions.push(fallbackSubmission);
        localStorage.setItem('contest_submissions', JSON.stringify(localSubmissions));
        
        console.log('Submission saved locally:', fallbackSubmission);
        toast.success('🎉 Contest submission received! We\'ll review your entry soon.');
        
        setFormData({
          fullName: '',
          email: '',
          mobile: '',
          experience: '',
          title: '',
          description: '',
          impact: '',
          consent: false,
          attachmentFile: null
        });
        
        onClose();
        return;
      }

      toast.success('🎉 Contest submission successful! We\'ll review your entry and get back to you soon.');
      
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        mobile: '',
        experience: '',
        title: '',
        description: '',
        impact: '',
        consent: false,
        attachmentFile: null
      });
      
      onClose();
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-start justify-center p-4 pt-32">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[75vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Contest Submission</h2>
                <p className="text-blue-100 text-sm">{contestData?.theme || 'Advanced Testing Methodologies'}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Contest Info */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-2">Testing Excellence Contest - Share Your Smart Techniques!</h3>
            <p className="text-sm text-gray-600 mb-3">
              Showcase your QA expertise! Share your innovative tips, tricks, or methodologies that make testing processes faster, smarter, or more efficient. The best entries will be featured and win exciting prizes!
            </p>
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Clock className="w-4 h-4" />
              <span>Deadline: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Personal Information
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-gray-900 placeholder-gray-500 ${
                    errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                  placeholder="Full name"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-gray-900 placeholder-gray-500 ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                  placeholder="Email"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-gray-900 placeholder-gray-500 ${
                    errors.mobile ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                  placeholder="Mobile"
                />
                {errors.mobile && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.mobile}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience in Testing <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-gray-900 ${
                    errors.experience ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                >
                  <option value="">Experience</option>
                  <option value="0-1">0-1 years</option>
                  <option value="2-3">2-3 years</option>
                  <option value="4-5">4-5 years</option>
                  <option value="6-8">6-8 years</option>
                  <option value="9-12">9-12 years</option>
                  <option value="13+">13+ years</option>
                </select>
                {errors.experience && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.experience}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submission Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Your Testing Innovation
            </h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title of your Technique/Hack/Method <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 ${
                  errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                }`}
                placeholder="e.g., AI-Powered Test Case Generation, Smart Automation Framework"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description of your Technique <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={5}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500 ${
                  errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                }`}
                placeholder="Provide a comprehensive explanation of your testing technique, methodology, or innovation. Include implementation steps, tools used, and any unique approaches..."
              />
              <div className="text-xs text-gray-500 mt-1">{formData.description.length}/1000 characters</div>
              {errors.description && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.description}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Impact/Benefits of the Technique <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.impact}
                onChange={(e) => handleInputChange('impact', e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500 ${
                  errors.impact ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                }`}
                placeholder="Describe the measurable impact and benefits. Include metrics like time saved, efficiency improvements, defect reduction, cost savings, etc..."
              />
              <div className="text-xs text-gray-500 mt-1">{formData.impact.length}/500 characters</div>
              {errors.impact && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.impact}
                </p>
              )}
            </div>

            {/* Optional File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supporting Document (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                {formData.attachmentFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <File className="w-8 h-8 text-blue-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{formData.attachmentFile.name}</p>
                      <p className="text-sm text-gray-500">{(formData.attachmentFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleInputChange('attachmentFile', null)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">Upload screenshots, diagrams, or documentation</p>
                    <p className="text-xs text-gray-500 mb-4">PDF, DOC, PNG, JPG up to 10MB</p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.zip"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file && file.size <= 10 * 1024 * 1024) {
                          handleInputChange('attachmentFile', file);
                        } else {
                          toast.error('File size must be less than 10MB');
                        }
                      }}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 cursor-pointer transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Choose File
                    </label>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Optional: Upload supporting materials like screenshots, architecture diagrams, or documentation
              </p>
            </div>
          </div>

          {/* Consent */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="consent"
                checked={formData.consent}
                onChange={(e) => handleInputChange('consent', e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="flex-1">
                <label htmlFor="consent" className="text-sm text-gray-700 cursor-pointer">
                  <span className="font-medium">Consent & Rules</span> <span className="text-red-500">*</span>
                  <p className="mt-1 text-gray-600">
                    I confirm that my submission is original work, and I agree to the contest rules and the use of my idea for feature purposes. 
                    I understand that TestingVala may showcase winning entries on the platform and social media channels.
                  </p>
                </label>
                {errors.consent && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.consent}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg sm:rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Submit Entry
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContestSubmissionForm;