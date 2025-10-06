import React, { useState } from 'react';
import { X, Mail, Users, TrendingUp, Award, Calendar, Building, Phone, Globe, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

const PartnershipModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    partnershipType: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Try to save to database (optional - will continue if fails)
      if (supabase) {
        try {
          const { error } = await supabase
            .from('partnership_inquiries')
            .insert([{
              company_name: formData.companyName,
              contact_name: formData.contactName,
              email: formData.email,
              phone: formData.phone || null,
              website: formData.website || null,
              partnership_type: formData.partnershipType,
              message: formData.message,
              status: 'pending'
            }]);

          if (error) {
            console.warn('Database save failed, continuing with email:', error);
          }
        } catch (dbError) {
          console.warn('Database not available, continuing with email:', dbError);
        }
      }

      // Create professional email content
      const emailSubject = `Partnership Inquiry from ${formData.companyName}`;
      const emailBody = `
Partnership Inquiry Details:

Company: ${formData.companyName}
Contact Person: ${formData.contactName}
Email: ${formData.email}
Phone: ${formData.phone}
Website: ${formData.website}
Partnership Type: ${formData.partnershipType}

Message:
${formData.message}

---
Sent via TestingVala Partnership Portal
      `.trim();

      // Open email client with pre-filled content
      const mailtoLink = `mailto:info@testingvala.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      window.location.href = mailtoLink;

      toast.success('Partnership inquiry submitted successfully!');
      
      // Reset form
      setFormData({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        website: '',
        partnershipType: '',
        message: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const partnershipTypes = [
    { value: 'event-hosting', label: 'Event Hosting & Sponsorship', icon: '🎯' },
    { value: 'corporate-training', label: 'Corporate Training Programs', icon: '🎓' },
    { value: 'technology-integration', label: 'Technology Integration', icon: '⚡' },
    { value: 'content-collaboration', label: 'Content Collaboration', icon: '📝' },
    { value: 'recruitment', label: 'Talent Recruitment', icon: '👥' },
    { value: 'other', label: 'Other Partnership', icon: '🤝' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0057B7] to-[#FF6600] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Building className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Partner with TestingVala</h2>
              <p className="text-blue-100">Join 10,000+ QA professionals in our growing ecosystem</p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="p-6 bg-gradient-to-br from-blue-50 to-orange-50">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Partnership Benefits</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <Users className="w-6 h-6 text-[#0057B7] mx-auto mb-2" />
              <div className="text-sm font-semibold text-gray-900">10,000+</div>
              <div className="text-xs text-gray-600">Active Users</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <TrendingUp className="w-6 h-6 text-[#FF6600] mx-auto mb-2" />
              <div className="text-sm font-semibold text-gray-900">50+</div>
              <div className="text-xs text-gray-600">Countries</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <Award className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-sm font-semibold text-gray-900">500+</div>
              <div className="text-xs text-gray-600">Monthly Events</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-sm font-semibold text-gray-900">24/7</div>
              <div className="text-xs text-gray-600">Support</div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0057B7] focus:border-transparent"
                placeholder="Your company name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person *
              </label>
              <input
                type="text"
                required
                value={formData.contactName}
                onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0057B7] focus:border-transparent"
                placeholder="Your full name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0057B7] focus:border-transparent"
                  placeholder="your@company.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0057B7] focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Website (Optional)
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0057B7] focus:border-transparent"
                placeholder="https://yourcompany.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Partnership Type *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {partnershipTypes.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    formData.partnershipType === type.value
                      ? 'border-[#0057B7] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="partnershipType"
                    value={type.value}
                    checked={formData.partnershipType === type.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, partnershipType: e.target.value }))}
                    className="sr-only"
                  />
                  <span className="text-2xl mr-3">{type.icon}</span>
                  <span className="text-sm font-medium text-gray-900">{type.label}</span>
                  {formData.partnershipType === type.value && (
                    <CheckCircle className="w-5 h-5 text-[#0057B7] ml-auto" />
                  )}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              required
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0057B7] focus:border-transparent resize-none"
              placeholder="Tell us about your partnership goals and how we can work together..."
            />
          </div>

          {/* Contact Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Direct Contact</h4>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4" />
              <a href="mailto:info@testingvala.com" className="text-[#0057B7] hover:underline">
                info@testingvala.com
              </a>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-[#0057B7] to-[#FF6600] text-white py-4 px-6 rounded-lg font-bold text-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Opening Email...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send Partnership Inquiry
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PartnershipModal;