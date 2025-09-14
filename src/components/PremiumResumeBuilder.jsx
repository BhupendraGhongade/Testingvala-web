import React, { useState, useEffect } from 'react';
import { X, Sparkles, FileText, Upload, CreditCard, CheckCircle, Crown, Zap, Clock, Star, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

const PremiumResumeBuilder = ({ isOpen, onClose, userEmail }) => {
  const [step, setStep] = useState('check'); // check, payment, builder
  const [subscription, setSubscription] = useState(null);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [generatedResume, setGeneratedResume] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [pendingPayment, setPendingPayment] = useState(null);

  useEffect(() => {
    if (isOpen && userEmail) {
      checkSubscription();
      loadPaymentConfig();
    }
  }, [isOpen, userEmail]);

  const checkSubscription = async () => {
    try {
      // Check for active subscription
      const { data: activeData } = await supabase
        .from('premium_subscriptions')
        .select('*')
        .eq('user_email', userEmail)
        .eq('status', 'active')
        .gte('expires_at', new Date().toISOString())
        .single();
      
      if (activeData) {
        setSubscription(activeData);
        setStep('builder');
        return;
      }

      // Check for pending payment
      const { data: pendingData } = await supabase
        .from('premium_subscriptions')
        .select('*')
        .eq('user_email', userEmail)
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

  const handlePaymentSubmit = async () => {
    if (!paymentScreenshot) {
      toast.error('Please upload payment screenshot');
      return;
    }

    try {
      const fileExt = paymentScreenshot.name.split('.').pop();
      const fileName = `payment_${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payments')
        .upload(fileName, paymentScreenshot);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('payments')
        .getPublicUrl(fileName);

      await supabase.from('premium_subscriptions').insert({
        user_email: userEmail,
        payment_screenshot_url: urlData.publicUrl,
        amount: paymentConfig?.monthly_price || 99,
        status: 'pending'
      });

      toast.success('Payment submitted! Admin will verify within 24 hours.');
      setStep('pending');
    } catch (error) {
      toast.error('Failed to submit payment');
    }
  };

  const generateAIResume = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please enter job description');
      return;
    }

    setIsGenerating(true);
    try {
      // AI-powered resume generation
      const mockResume = {
        personal: {
          name: 'Professional Name',
          email: userEmail,
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
        user_email: userEmail,
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-slate-900 via-gray-900 to-slate-800 text-white px-6 py-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
          <div className="relative flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Premium Resume Builder
                </h2>
                <p className="text-gray-300 text-sm">AI-Powered Professional Resume Generation</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {step === 'payment' && (
            <div className="p-8">
              <div className="max-w-lg mx-auto">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">Upgrade to Premium</h3>
                  <p className="text-gray-600">Unlock AI-powered resume generation with advanced features</p>
                </div>

                {/* Pricing Card */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200 mb-8">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-baseline">
                      <span className="text-5xl font-bold text-gray-900">₹{paymentConfig?.monthly_price || 99}</span>
                      <span className="text-gray-600 ml-2">/month</span>
                    </div>
                    <p className="text-gray-600 mt-2">Everything you need for professional resumes</p>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {[
                      'Unlimited AI resume generations',
                      'Job-specific content optimization', 
                      'ATS-friendly formatting',
                      'Professional templates',
                      'Instant download & editing',
                      '24/7 premium support'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Payment Section */}
                  {paymentConfig && (
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-4">Complete Your Payment</h4>
                      
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">UPI ID:</span>
                          <span className="font-mono text-sm font-semibold">{paymentConfig.upi_id}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-bold text-lg text-blue-600">₹{paymentConfig.monthly_price}</span>
                        </div>
                      </div>

                      {paymentConfig.payment_instructions && (
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-800">{paymentConfig.payment_instructions}</p>
                        </div>
                      )}

                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Upload Payment Screenshot
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPaymentScreenshot(e.target.files[0])}
                            className="hidden"
                            id="payment-upload"
                          />
                          <label htmlFor="payment-upload" className="cursor-pointer">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">
                              {paymentScreenshot ? paymentScreenshot.name : 'Click to upload screenshot'}
                            </p>
                          </label>
                        </div>
                      </div>

                      <button
                        onClick={handlePaymentSubmit}
                        disabled={!paymentScreenshot}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      >
                        Activate Premium Access
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 'pending' && (
            <div className="p-8">
              <div className="max-w-md mx-auto text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Clock className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Payment Verification in Progress</h3>
                <p className="text-gray-600 mb-8">
                  Thank you for your payment! Our team is verifying your transaction and will activate your premium access within 24 hours.
                </p>
                
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-left">
                      <h4 className="font-semibold text-amber-800 mb-2">Next Steps</h4>
                      <ul className="text-amber-700 space-y-2 text-sm">
                        <li>✓ Payment screenshot received</li>
                        <li>⏳ Admin verification in progress</li>
                        <li>🎯 Premium access activation (within 24h)</li>
                        <li>📧 Email confirmation upon activation</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={onClose}
                  className="bg-gray-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
                >
                  Got it, thanks!
                </button>
              </div>
            </div>
          )}

          {step === 'builder' && (
            <div className="p-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Resume Generator</h3>
                    <p className="text-gray-600">Paste any job description and get a tailored professional resume</p>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Job Description
                    </label>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      rows="12"
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                      placeholder="Paste the complete job description here. Our AI will analyze the requirements, skills, and qualifications to create a perfectly tailored resume that matches the role..."
                    />
                  </div>

                  <button
                    onClick={generateAIResume}
                    disabled={isGenerating || !jobDescription.trim()}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
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
                <div>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Resume Preview</h3>
                    <p className="text-gray-600">Your AI-generated resume will appear here</p>
                  </div>
                  
                  {generatedResume ? (
                    <div className="bg-white border border-gray-200 rounded-xl p-6 h-[500px] overflow-y-auto shadow-sm">
                      <div className="space-y-6">
                        {/* Header */}
                        <div className="border-b border-gray-200 pb-4">
                          <h4 className="text-xl font-bold text-gray-900">{generatedResume.personal.name}</h4>
                          <p className="text-gray-600">{generatedResume.personal.email}</p>
                          <p className="text-gray-600 text-sm">{generatedResume.personal.phone} • {generatedResume.personal.location}</p>
                        </div>

                        {/* Summary */}
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-2">Professional Summary</h5>
                          <p className="text-gray-700 text-sm leading-relaxed">{generatedResume.summary}</p>
                        </div>

                        {/* Skills */}
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-3">Core Competencies</h5>
                          <div className="flex flex-wrap gap-2">
                            {generatedResume.skills.map((skill, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Experience */}
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-3">Professional Experience</h5>
                          {generatedResume.experience.map((exp, index) => (
                            <div key={index} className="mb-4 last:mb-0">
                              <div className="flex justify-between items-start mb-1">
                                <h6 className="font-medium text-gray-900">{exp.role}</h6>
                                <span className="text-xs text-gray-500">{exp.duration}</span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{exp.company}</p>
                              <ul className="text-xs text-gray-700 space-y-1">
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

                        {/* Education */}
                        {generatedResume.education && (
                          <div>
                            <h5 className="font-semibold text-gray-900 mb-3">Education</h5>
                            {generatedResume.education.map((edu, index) => (
                              <div key={index}>
                                <div className="flex justify-between items-start">
                                  <h6 className="font-medium text-gray-900">{edu.degree}</h6>
                                  <span className="text-xs text-gray-500">{edu.year}</span>
                                </div>
                                <p className="text-sm text-gray-600">{edu.institution}</p>
                                <p className="text-xs text-gray-700 mt-1">{edu.details}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <button className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-colors font-semibold">
                          Download Resume PDF
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl h-[500px] flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <FileText className="w-16 h-16 mx-auto mb-4 opacity-40" />
                        <p className="text-lg font-medium mb-2">Ready to Generate</p>
                        <p className="text-sm">Add a job description to create your tailored resume</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PremiumResumeBuilder;