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
    <section id="contact" className="py-20 bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#FF6600] text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Mail className="w-4 h-4" />
            Contact Us
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Get in Touch
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Ready to elevate your QA career? Have questions about our platform? We're here to help you succeed.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Details */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#FF6600] to-[#E55A00] rounded-2xl flex items-center justify-center shadow-lg">
                    <Mail className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">Email Address</h4>
                    <p className="text-gray-600">{safeData.email || defaultData.email}</p>
                    <p className="text-sm text-gray-500 mt-1">We'll respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#0057B7] to-[#004494] rounded-2xl flex items-center justify-center shadow-lg">
                    <MapPin className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">Global Presence</h4>
                    <p className="text-gray-600">{safeData.location || defaultData.location}</p>
                    <p className="text-sm text-gray-500 mt-1">Serving 85+ countries worldwide</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">Support Hours</h4>
                    <p className="text-gray-600">24/7 Community Support</p>
                    <p className="text-sm text-gray-500 mt-1">Professional support available</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-[#0057B7] to-[#FF6600] rounded-2xl p-8 text-white">
              <h3 className="text-xl font-bold mb-6">Join Our Community</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">25,000+</div>
                  <div className="text-sm text-white/80">Active Members</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">85+</div>
                  <div className="text-sm text-white/80">Countries</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">50+</div>
                  <div className="text-sm text-white/80">Contests Held</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">1,200+</div>
                  <div className="text-sm text-white/80">Companies</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6600] focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6600] focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6600] focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="What can we help you with?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6600] focus:border-transparent transition-all duration-200 resize-none bg-gray-50 focus:bg-white"
                    placeholder="Tell us more about your inquiry or how we can assist you..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className={`w-full bg-gradient-to-r from-[#FF6600] to-[#E55A00] text-white py-4 px-8 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-200 ${sending ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105'}`}
                >
                  {sending ? 'Sending Message...' : 'Send Message'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  By submitting this form, you agree to our{' '}
                  <a href="#" className="text-[#FF6600] hover:underline font-medium">Privacy Policy</a>
                  {' '}and{' '}
                  <a href="#" className="text-[#FF6600] hover:underline font-medium">Terms of Service</a>
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
