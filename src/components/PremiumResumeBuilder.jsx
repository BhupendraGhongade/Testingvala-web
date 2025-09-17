import React, { useState, useEffect } from 'react';
import { X, FileText, CreditCard, CheckCircle, Crown, Zap, Clock, AlertCircle, Copy, User, Phone, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

const PremiumResumeBuilder = ({ isOpen, onClose, userEmail }) => {
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [paymentStep, setPaymentStep] = useState('card'); // card, details, payment, confirm, success
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    transactionId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadPaymentConfig();
      setPaymentStep('card');
      setFormData({ name: '', phone: '', transactionId: '' });
      setErrors({});
    }
  }, [isOpen]);

  const loadPaymentConfig = async () => {
    try {
      const { data } = await supabase
        .from('payment_config')
        .select('*')
        .eq('id', 1)
        .single();
      if (data) setPaymentConfig(data);
    } catch (error) {
      console.error('Error loading payment config:', error);
    }
  };

  const validateForm = (step) => {
    const newErrors = {};
    if (step === 'details') {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    }
    if (step === 'confirm') {
      if (!formData.transactionId.trim()) newErrors.transactionId = 'Transaction ID is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log('handleSubmit called');
    console.log('Form data:', formData);
    
    if (!validateForm('confirm')) {
      console.log('Form validation failed');
      return;
    }
    
    console.log('Form validation passed, submitting...');
    setIsSubmitting(true);
    
    try {
      console.log('Using table: premium_requests');
      const { error } = await supabase.from('premium_requests').insert({
        user_name: formData.name,
        user_email: userEmail,
        user_phone: formData.phone,
        transaction_id: formData.transactionId,
        payment_method: 'UPI'
      });
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Payment submitted successfully');
      toast.success('🎉 Payment submitted! Access within 24 hours.', {
        duration: 4000,
        style: { background: '#10b981', color: '#fff', fontWeight: 'bold' }
      });
      
      setPaymentStep('success');
      setTimeout(() => {
        setPaymentStep('card');
        setFormData({ name: '', phone: '', transactionId: '' });
      }, 4000);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  World's #1 QA Resume Builder
                  <Crown className="w-5 h-5 text-yellow-300" />
                </h2>
                <p className="text-blue-100 text-sm">Professional • ATS-Optimized • Industry-Leading</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">📄 Professional Resume Builder</h3>
              <p className="text-gray-600">Choose your perfect resume solution</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* AI Resume Builder Card */}
              <div className="bg-white rounded-xl shadow-xl border-2 border-purple-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-600 to-pink-600 text-white px-3 py-1 text-xs font-bold">
                  🤖 AI POWERED
                </div>

                {/* Payment Card View */}
                {paymentStep === 'card' && (
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">AI Resume Builder</h4>
                        <p className="text-purple-600 font-semibold text-sm">AI-Powered • ₹{paymentConfig?.monthly_price || 99}/month</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      {[
                        'Paste job description → Get tailored resume',
                        'AI content generation',
                        'ATS optimization',
                        'Industry keywords',
                        'Unlimited generations'
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-lg font-bold text-purple-900">₹{paymentConfig?.monthly_price || 99}</div>
                            <div className="text-xs text-purple-700">per month</div>
                          </div>
                          <div className="text-xs text-purple-600 font-medium">UPI Payment</div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setPaymentStep('details')}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                      >
                        <CreditCard className="w-4 h-4" />
                        Subscribe Now
                      </button>
                      
                      <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          Secure Payment
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          Instant Access
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Details Step */}
                {paymentStep === 'details' && (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-gray-900">Your Details</h4>
                      <button onClick={() => setPaymentStep('card')} className="text-gray-500 hover:text-gray-700 p-1">
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <User className="w-4 h-4" />
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent text-sm ${
                            errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                          }`}
                          placeholder="Enter your full name"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                      </div>
                      
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <Mail className="w-4 h-4" />
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={userEmail}
                          disabled
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <Phone className="w-4 h-4" />
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent text-sm ${
                            errors.phone ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                          }`}
                          placeholder="Enter your phone number"
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        if (validateForm('details')) {
                          setPaymentStep('payment');
                        }
                      }}
                      className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
                    >
                      Continue to Payment
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Payment Step */}
                {paymentStep === 'payment' && (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-gray-900">Payment</h4>
                      <button onClick={() => setPaymentStep('details')} className="text-gray-500 hover:text-gray-700 p-1">
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-900 mb-1">₹{paymentConfig?.monthly_price || 99}</div>
                        <div className="text-sm text-purple-700">Monthly subscription</div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h5 className="font-medium text-gray-900 mb-3 text-center">Pay via UPI</h5>
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <span className="font-mono text-sm">{paymentConfig?.upi_id || 'testingvala@paytm'}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(paymentConfig?.upi_id || 'testingvala@paytm');
                            toast.success('UPI ID copied!');
                          }}
                          className="p-1 text-purple-600 hover:text-purple-800"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex justify-center">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=${paymentConfig?.upi_id || 'testingvala@paytm'}&pn=TestingVala&am=${paymentConfig?.monthly_price || 99}&cu=INR&tn=AI Resume Builder Premium`}
                          alt="UPI QR Code"
                          className="w-24 h-24 border rounded-lg"
                        />
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setPaymentStep('confirm')}
                      className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      I've Completed Payment
                    </button>
                  </div>
                )}

                {/* Confirmation Step */}
                {paymentStep === 'confirm' && (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-gray-900">Confirm Payment</h4>
                      <button onClick={() => setPaymentStep('payment')} className="text-gray-500 hover:text-gray-700 p-1">
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <CreditCard className="w-4 h-4" />
                          Transaction ID *
                        </label>
                        <input
                          type="text"
                          value={formData.transactionId}
                          onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
                          className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent text-sm ${
                            errors.transactionId ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                          }`}
                          placeholder="Enter UPI transaction ID"
                        />
                        {errors.transactionId && <p className="text-red-500 text-xs mt-1">{errors.transactionId}</p>}
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-blue-800">
                            <p className="font-medium mb-1">Verification Process:</p>
                            <p>Your payment will be verified within 24 hours and access will be activated automatically.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 relative z-50">
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 relative z-50 cursor-pointer"
                        style={{ pointerEvents: 'auto' }}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" />
                            Submit & Get Access
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Success Step */}
                {paymentStep === 'success' && (
                  <div className="p-6 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">🎉 Payment Submitted Successfully!</h4>
                    <p className="text-sm text-gray-600 mb-6">
                      Thank you! Your payment request has been submitted. You'll receive AI Resume Builder access within 24 hours.
                    </p>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-4">
                      <div className="text-sm text-green-800">
                        <p className="font-semibold mb-2 flex items-center justify-center gap-2">
                          <Clock className="w-4 h-4" />
                          What happens next?
                        </p>
                        <ul className="text-left space-y-2">
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Admin will verify your payment
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Access will be activated automatically
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            You'll receive an email confirmation
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-xs text-blue-800">
                        <strong>Transaction ID:</strong> {formData.transactionId}
                      </p>
                    </div>
                    
                    <div className="mt-4 text-sm text-gray-500 font-medium">
                      Redirecting in 4 seconds...
                    </div>
                  </div>
                )}
              </div>

              {/* QA Resume Builder Card */}
              <div className="bg-white rounded-xl shadow-xl p-6 border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">QA Resume Builder</h4>
                    <p className="text-blue-600 font-semibold text-sm">QA Professionals • Free</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  {[
                    'QA-specific templates',
                    'Testing skills database',
                    'Automation frameworks',
                    'QA tools & technologies',
                    'Step-by-step builder'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2"
                >
                  <Crown className="w-5 h-5" />
                  Access QA Builder
                </button>
                <p className="text-center text-xs text-gray-500 mt-2">Role verification required</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumResumeBuilder;