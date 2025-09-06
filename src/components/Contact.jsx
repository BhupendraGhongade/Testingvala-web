import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useWebsiteData } from '../hooks/useWebsiteData';
import { Phone, MessageCircle, Mail, MapPin, Users, Clock } from 'lucide-react';

const Contact = ({ data }) => {
  const { addMessage } = useWebsiteData();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  // Default fallback data
  const defaultData = {
    email: 'info@testingvala.com',
    website: 'www.testingvala.com',
    location: 'Global QA Community'
  };

  // Use provided data or fallback to defaults
  const safeData = data || defaultData;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    (async () => {
      try {
        if (sending) return
        setSending(true)
        const ok = await addMessage(formData)
        if (ok) {
          toast.success('Message sent — admin will receive it.');
          setFormData({ name: '', email: '', subject: '', message: '' });
        } else {
          toast.error('Failed to send message. Try again later.');
        }
      } catch (err) {
        console.error(err)
        toast.error('Unexpected error sending message')
      } finally {
        setSending(false)
      }
    })()
  };

  return (
    <section id="contact" className="site-section bg-gradient-to-br from-gray-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Get in Touch
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions about our contests or want to learn more? We'd love to hear from you!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Active Members</span>
                  <span className="font-semibold text-primary">10,000+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Countries</span>
                  <span className="font-semibold text-[#0057B7]">50+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Support</span>
                  <span className="font-semibold text-primary">24/7</span>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-[#E55A00] rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Email</h4>
                  <p className="text-gray-600">{safeData.email || defaultData.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#0057B7] to-[#004494] rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Location</h4>
                  <p className="text-gray-600">{safeData.location || defaultData.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-[#E55A00] rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Response Time</h4>
                  <p className="text-gray-600">Within 24 hours</p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
              <div className="bg-gradient-to-br from-orange-50 to-blue-50 rounded-xl p-5 border border-orange-200">
              <div className="flex items-center gap-3 mb-3">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-gray-900">Need Immediate Help?</h4>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                For urgent contest-related questions, check our FAQ section or join our community discussions.
              </p>
              <button className="text-primary font-medium text-sm hover:underline">
                View FAQ →
              </button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Send us a Message</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    placeholder="What is this about?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className={`w-full btn-primary py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105 font-medium ${sending ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {sending ? 'Sending…' : 'Send Message'}
                </button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  By submitting this form, you agree to our{' '}
                  <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                  {' '}and{' '}
                  <a href="#" className="text-primary hover:underline">Terms of Service</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

