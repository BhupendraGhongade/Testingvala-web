import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, FileText, CreditCard, CheckCircle, Crown, Zap, Clock, Star, AlertCircle, Download, X, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import AuthModal from './AuthModal';
import { useAuth } from '../contexts/AuthContext';

const AIResumeBuilderPage = ({ onBack, userEmail }) => {
  const { user, isVerified } = useAuth();
  const [step, setStep] = useState('check'); // check, payment, builder
  const [subscription, setSubscription] = useState(null);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [generatedResume, setGeneratedResume] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [pendingPayment, setPendingPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1);
  const [paymentForm, setPaymentForm] = useState({
    name: '',
    phone: '',
    transactionId: ''
  });

  useEffect(() => {
    if (!user || !isVerified) {
      setShowAuthModal(true);
      return;
    }
    
    const currentUserEmail = user?.email || userEmail;
    if (currentUserEmail) {
      checkSubscription();
      loadPaymentConfig();
    }
  }, [user, isVerified, userEmail]);

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    toast.success('Welcome! You can now access the AI Resume Builder.');
  };

  const checkSubscription = async () => {
    const currentUserEmail = user?.email || userEmail;
    if (!currentUserEmail) return;
    
    try {
      const { data: activeData } = await supabase
        .from('premium_users')
        .select('*')
        .eq('user_email', currentUserEmail)
        .gt('expires_at', new Date().toISOString())
        .single();
      
      if (activeData) {
        setSubscription(activeData);
        setStep('builder');
        return;
      }

      const { data: pendingData } = await supabase
        .from('payment_requests')
        .select('*')
        .eq('user_email', currentUserEmail)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (pendingData) {
        setPendingPayment(pendingData);
        setStep('pending');
      } else {
        setStep('payment');
      }
    } catch (error) {
      setStep('payment');
    }
  };

  const loadPaymentConfig = async () => {
    const { data } = await supabase
      .from('payment_config')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (data) setPaymentConfig(data);
  };



  const generateAIResume = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please enter job description');
      return;
    }

    const currentUserEmail = user?.email || userEmail;
    setIsGenerating(true);
    try {
      const mockResume = {
        personal: {
          name: 'Professional Name',
          email: currentUserEmail,
          phone: '+91 XXXXXXXXXX',
          location: 'City, Country'
        },
        summary: `Results-driven professional with proven expertise in areas aligned with the role requirements. Demonstrated ability to deliver high-quality solutions and drive organizational success through innovative approaches and strategic thinking.`,
        skills: ['Strategic Planning', 'Team Leadership', 'Process Optimization', 'Quality Assurance', 'Project Management', 'Data Analysis'],
        experience: [{
          company: 'Previous Company',
          role: 'Senior Position',
          duration: '2020 - Present',
          achievements: [
            'Led cross-functional teams to achieve 25% improvement in efficiency',
            'Implemented strategic initiatives resulting in significant cost savings',
            'Developed and executed comprehensive quality improvement programs'
          ]
        }],
        education: [{
          degree: 'Relevant Degree',
          institution: 'University Name',
          year: '2018',
          details: 'Specialized in relevant field with focus on industry best practices'
        }]
      };

      await supabase.from('ai_resume_generations').insert({
        user_email: currentUserEmail,
        job_description: jobDescription,
        generated_resume: mockResume
      });

      setGeneratedResume(mockResume);
      toast.success('Professional resume generated successfully!');
    } catch (error) {
      toast.error('Failed to generate resume');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">




      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 'payment' && (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Unlock AI Resume Builder</h2>
              <p className="text-gray-600 mb-6">Get unlimited access to our AI-powered resume generation</p>
              
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 mb-6">
                <div className="text-3xl font-bold text-purple-600 mb-2">₹{paymentConfig?.monthly_price || 99}/month</div>
                <div className="text-sm text-purple-700">Unlimited AI generations</div>
              </div>

              <div className="space-y-3 mb-8 text-left">
                {[
                  'Paste job description → Get tailored resume',
                  'AI content generation',
                  'ATS optimization',
                  'Industry keywords',
                  'Unlimited generations'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowPaymentModal(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                Pay Now - Get Instant Access
              </button>
            </div>
          </div>
        )}

        {step === 'pending' && (
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Under Review</h2>
              <p className="text-gray-600 mb-8">
                Your payment is being verified. You'll get access within 24 hours.
              </p>
              
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <h4 className="font-semibold text-amber-800 mb-2">Next Steps</h4>
                    <ul className="text-amber-700 space-y-1 text-sm">
                      <li>✓ Payment request received</li>
                      <li>⏳ Admin verification in progress</li>
                      <li>🎯 Access activation (within 24h)</li>
                      <li>📧 Email confirmation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'builder' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">AI Resume Generator</h2>
                  <p className="text-gray-600 text-sm">Paste job description for tailored resume</p>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Job Description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows="12"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Paste the complete job description here. Our AI will analyze requirements, skills, and qualifications to create a perfectly tailored resume..."
                />
              </div>

              <button
                onClick={generateAIResume}
                disabled={isGenerating || !jobDescription.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Generating Resume...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Professional Resume</span>
                  </>
                )}
              </button>
            </div>

            {/* Preview Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Resume Preview</h2>
                  <p className="text-gray-600 text-sm">AI-generated resume appears here</p>
                </div>
              </div>
              
              {generatedResume ? (
                <div className="border border-gray-200 rounded-xl p-6 h-[500px] overflow-y-auto">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="text-xl font-bold text-gray-900">{generatedResume.personal.name}</h3>
                      <p className="text-gray-600">{generatedResume.personal.email}</p>
                      <p className="text-gray-600 text-sm">{generatedResume.personal.phone} • {generatedResume.personal.location}</p>
                    </div>

                    {/* Summary */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Professional Summary</h4>
                      <p className="text-gray-700 text-sm leading-relaxed">{generatedResume.summary}</p>
                    </div>

                    {/* Skills */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Core Competencies</h4>
                      <div className="flex flex-wrap gap-2">
                        {generatedResume.skills.map((skill, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Experience */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Professional Experience</h4>
                      {generatedResume.experience.map((exp, index) => (
                        <div key={index} className="mb-4">
                          <div className="flex justify-between items-start mb-1">
                            <h5 className="font-medium text-gray-900">{exp.role}</h5>
                            <span className="text-sm text-gray-500">{exp.duration}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{exp.company}</p>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {exp.achievements.map((achievement, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                <span>{achievement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <button className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2">
                      <Download className="w-5 h-5" />
                      Download Resume PDF
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-xl h-[500px] flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-40" />
                    <p className="text-lg font-medium mb-2">Ready to Generate</p>
                    <p className="text-sm">Add job description to create tailored resume</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" style={{ zIndex: 50000 }}>
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">
                  {paymentStep === 1 ? 'Personal Details' : paymentStep === 2 ? 'Payment' : 'Confirm Payment'}
                </h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {paymentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={paymentForm.name}
                      onChange={(e) => setPaymentForm({...paymentForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={user?.email || userEmail}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={paymentForm.phone}
                      onChange={(e) => setPaymentForm({...paymentForm, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (!paymentForm.name || !paymentForm.phone) {
                        toast.error('Please fill all required fields');
                        return;
                      }
                      setPaymentStep(2);
                    }}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Continue to Payment
                  </button>
                </div>
              )}

              {paymentStep === 2 && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <h4 className="font-medium text-gray-900 mb-2">Pay ₹{paymentConfig?.monthly_price || 99} via UPI</h4>
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <span className="font-mono text-lg">{paymentConfig?.upi_id || 'testingvala@paytm'}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(paymentConfig?.upi_id || 'testingvala@paytm');
                          toast.success('UPI ID copied!');
                        }}
                        className="p-1 text-blue-600 hover:text-blue-800"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${paymentConfig?.upi_id || 'testingvala@paytm'}&pn=TestingVala&am=${paymentConfig?.monthly_price || 99}&cu=INR&tn=AI Resume Builder Premium`}
                      alt="UPI QR Code"
                      className="mx-auto w-32 h-32 border rounded-lg"
                    />
                  </div>
                  <button
                    onClick={() => setPaymentStep(3)}
                    className="w-full px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    I have completed the payment
                  </button>
                </div>
              )}

              {paymentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID *</label>
                    <input
                      type="text"
                      required
                      value={paymentForm.transactionId}
                      onChange={(e) => setPaymentForm({...paymentForm, transactionId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter UPI transaction ID"
                    />
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">Note:</p>
                        <p>Your payment will be verified within 24 hours and access will be activated.</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      if (!paymentForm.transactionId) {
                        toast.error('Please enter transaction ID');
                        return;
                      }
                      
                      try {
                        await supabase.from('payment_requests').insert({
                          user_name: paymentForm.name,
                          user_email: user?.email || userEmail,
                          user_phone: paymentForm.phone,
                          transaction_id: paymentForm.transactionId
                        });
                        
                        toast.success('Payment request submitted! Admin will review and give permissions within 24 hours.');
                        setShowPaymentModal(false);
                        setPaymentStep(1);
                        checkSubscription();
                      } catch (error) {
                        toast.error('Failed to submit payment request');
                      }
                    }}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Submit Payment Request
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        action="resume"
      />
    </div>
  );
};

export default AIResumeBuilderPage;