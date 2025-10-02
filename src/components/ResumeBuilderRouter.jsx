import React, { useState, useEffect } from 'react';
import { X, Sparkles, FileText, CheckCircle, Crown, Zap, Lock, Shield, CreditCard, Copy, User, Phone, Mail, ArrowRight, ArrowLeft, AlertCircle, Clock } from 'lucide-react';
import AIResumeBuilderPage from './AIResumeBuilderPage';
import CompleteEnhancedResumeBuilder from './CompleteEnhancedResumeBuilder';
import AuthModal from './AuthModal';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const ResumeBuilderRouter = ({ isOpen, onClose }) => {
  const [currentPage, setCurrentPage] = useState('selection');
  const [userEmail, setUserEmail] = useState('user@example.com');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [paymentStep, setPaymentStep] = useState('details');
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', transactionId: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasError, setHasError] = useState(false);
  const { user, isVerified, loading } = useAuth();

  useEffect(() => {
    try {
      if (isOpen) {
        loadPaymentConfig();
      }
      
      const handleNavigateToAI = (event) => {
        try {
          setUserEmail(event.detail.userEmail);
          setCurrentPage('ai-builder');
        } catch (error) {
          console.error('Navigate to AI error:', error);
        }
      };

      const handleNavigateToQA = (event) => {
        try {
          setUserEmail(event.detail.userEmail);
          setCurrentPage('qa-builder');
        } catch (error) {
          console.error('Navigate to QA error:', error);
        }
      };

      const handleNavigation = (event) => {
        // Close resume builder when navigating to other pages
        if (event.detail.path !== window.location.pathname) {
          onClose();
        }
      };

      window.addEventListener('navigate-to-ai-builder', handleNavigateToAI);
      window.addEventListener('navigate-to-qa-builder', handleNavigateToQA);
      window.addEventListener('navigate', handleNavigation);

      return () => {
        window.removeEventListener('navigate-to-ai-builder', handleNavigateToAI);
        window.removeEventListener('navigate-to-qa-builder', handleNavigateToQA);
        window.removeEventListener('navigate', handleNavigation);
      };
    } catch (error) {
      console.error('ResumeBuilderRouter useEffect error:', error);
      setHasError(true);
    }
  }, [isOpen, onClose]);

  const handleBack = () => {
    setCurrentPage('selection');
  };

  const loadPaymentConfig = async () => {
    try {
      if (!supabase) {
        console.warn('Supabase not configured, using default payment config');
        setPaymentConfig({ monthly_price: 99, upi_id: 'testingvala@paytm' });
        return;
      }
      const { data } = await supabase
        .from('payment_config')
        .select('*')
        .eq('id', 1)
        .single();
      if (data) {
        setPaymentConfig(data);
      } else {
        setPaymentConfig({ monthly_price: 99, upi_id: 'testingvala@paytm' });
      }
    } catch (error) {
      console.error('Error loading payment config:', error);
      setPaymentConfig({ monthly_price: 99, upi_id: 'testingvala@paytm' });
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
    if (!formData.transactionId.trim()) {
      toast.error('Please enter transaction ID');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (!supabase) {
        toast.error('Database not configured. Please contact support.');
        return;
      }
      
      const { error } = await supabase.from('payment_requests').insert({
        user_name: formData.name,
        user_email: user?.email || userEmail,
        email: user?.email || userEmail,
        user_phone: formData.phone,
        transaction_id: formData.transactionId
      });
      
      if (error) {
        toast.error(`Error: ${error.message}`);
        return;
      }
      
      toast.success('Payment submitted successfully!');
      setPaymentStep('success');
      
    } catch (error) {
      console.error('Payment submission error:', error);
      toast.error('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentPage('selection');
    setShowAuthModal(false);
    setPendingAction(null);
    setPaymentStep('details');
    setFormData({ name: '', phone: '', transactionId: '' });
    setErrors({});
    onClose();
  };

  const handleBackToSelection = () => {
    setCurrentPage('selection');
    setPaymentStep('details');
    setFormData({ name: '', phone: '', transactionId: '' });
    setErrors({});
  };

  const handleBuilderAccess = (builderType) => {
    try {
      if (builderType === 'ai-payment') {
        if (!user || !isVerified) {
          setPendingAction('ai-payment');
          setShowAuthModal(true);
          return;
        }
        setUserEmail(user.email);
        setCurrentPage('ai-payment');
        return;
      }
      
      if (!user || !isVerified) {
        setPendingAction(builderType);
        setShowAuthModal(true);
        return;
      }
      
      setUserEmail(user.email);
      setCurrentPage(builderType);
    } catch (error) {
      console.error('Builder access error:', error);
      toast.error('Failed to access resume builder. Please try again.');
      setHasError(true);
    }
  };

  const handleAuthSuccess = () => {
    try {
      setShowAuthModal(false);
      if (pendingAction && user && isVerified) {
        setUserEmail(user.email);
        setCurrentPage(pendingAction);
        setPendingAction(null);
      }
    } catch (error) {
      console.error('Auth success handling error:', error);
      toast.error('Authentication successful, but failed to proceed. Please try again.');
      setHasError(true);
    }
  };

  // Check verification status when user changes
  useEffect(() => {
    try {
      if (user && isVerified && pendingAction) {
        setUserEmail(user.email);
        setCurrentPage(pendingAction);
        setPendingAction(null);
        setShowAuthModal(false);
      }
    } catch (error) {
      console.error('Auth status check error:', error);
      setHasError(true);
    }
  }, [user, isVerified, pendingAction]);

  // Error boundary
  if (hasError) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[8001] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-4">We encountered an error loading the resume builder.</p>
          <div className="flex gap-3">
            <button
              onClick={() => setHasError(false)}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  // Show loading state while auth is loading
  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-[7999] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resume builder...</p>
        </div>
      </div>
    );
  }

  // Full-page AI Resume Builder
  if (currentPage === 'ai-builder') {
    return (
      <div className="fixed inset-0 bg-white" style={{ top: '64px', zIndex: 7999 }}>
        {/* Single Back Button */}
        <div className="absolute top-4 left-4 sm:left-6 z-10">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-lg hover:bg-gray-50 transition-all text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-gray-700">Back</span>
          </button>
        </div>
        <div className="h-full overflow-y-auto">
          <AIResumeBuilderPage onBack={handleBack} userEmail={userEmail} />
        </div>
      </div>
    );
  }

  // AI Payment Flow
  if (currentPage === 'ai-payment') {
    return (
      <div className="fixed inset-0 bg-white" style={{ top: '64px', zIndex: 7999 }}>
        {/* Single Back Button */}
        <div className="absolute top-4 left-4 sm:left-6 z-10">
          <button 
            onClick={handleBackToSelection}
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-lg hover:bg-gray-50 transition-all text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-gray-700">Back</span>
          </button>
        </div>

        {/* Content */}
        <div className="h-full bg-gradient-to-br from-purple-50 to-pink-50 overflow-y-auto">
          <div className="max-w-lg mx-auto px-4 py-6">
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-3">
                <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium ${
                  paymentStep === 'details' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-600'
                }`}>
                  1
                </div>
                <div className="w-12 h-0.5 bg-gray-300"></div>
                <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium ${
                  paymentStep === 'payment' ? 'bg-purple-600 text-white' : 
                  ['payment', 'confirm', 'success'].includes(paymentStep) ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
                <div className="w-12 h-0.5 bg-gray-300"></div>
                <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium ${
                  ['confirm', 'success'].includes(paymentStep) ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  3
                </div>
              </div>
            </div>

            {/* Payment Steps */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              {paymentStep === 'details' && (
                <>
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Your Details</h2>
                    <p className="text-gray-600 text-sm">We need some basic information</p>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4" />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-all ${
                          errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                        }`}
                        placeholder="Enter your full name"
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
                    </div>
                    
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Mail className="w-4 h-4" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user?.email || userEmail}
                        disabled
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
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
                        className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-all ${
                          errors.phone ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                        }`}
                        placeholder="Enter your phone number"
                      />
                      {errors.phone && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.phone}</p>}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (validateForm('details')) {
                        setPaymentStep('payment');
                      }
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
                  >
                    Continue to Payment
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {paymentStep === 'payment' && (
                <>
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Complete Payment</h2>
                    <p className="text-gray-600 text-sm">Secure payment via UPI</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 mb-4 text-center">
                    <div className="text-2xl font-bold text-purple-900 mb-1">₹{paymentConfig?.monthly_price || 99}</div>
                    <div className="text-purple-700 font-medium">Monthly subscription</div>
                    <div className="text-purple-600 text-xs mt-1">Unlimited AI generations • Cancel anytime</div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <h3 className="font-bold text-gray-900 mb-3 text-center">Pay via UPI</h3>
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <span className="font-mono bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm text-sm">{paymentConfig?.upi_id || 'testingvala@paytm'}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(paymentConfig?.upi_id || 'testingvala@paytm');
                          toast.success('UPI ID copied!');
                        }}
                        className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-all border border-purple-200"
                        title="Copy UPI ID"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex justify-center mb-3">
                      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi://pay?pa=${paymentConfig?.upi_id || 'testingvala@paytm'}&pn=TestingVala&am=${paymentConfig?.monthly_price || 99}&cu=INR&tn=AI Resume Builder Premium`}
                          alt="UPI QR Code"
                          className="w-24 h-24"
                        />
                      </div>
                    </div>
                    <p className="text-center text-gray-600 text-xs">Scan QR code with any UPI app</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setPaymentStep('details')}
                      className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      onClick={() => setPaymentStep('confirm')}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-2.5 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Payment Done
                    </button>
                  </div>
                </>
              )}

              {paymentStep === 'confirm' && (
                <>
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Confirm Payment</h2>
                    <p className="text-gray-600 text-sm">Enter your transaction details</p>
                  </div>
                  
                  <div className="space-y-4 mb-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <CreditCard className="w-4 h-4" />
                        Transaction ID *
                      </label>
                      <input
                        type="text"
                        value={formData.transactionId}
                        onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
                        className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-all ${
                          errors.transactionId ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                        }`}
                        placeholder="Enter UPI transaction ID"
                      />
                      {errors.transactionId && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.transactionId}</p>}
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-blue-800">
                          <p className="font-medium mb-1 text-sm">Verification Process:</p>
                          <p className="text-xs">Payment verified within 24 hours. You'll receive email confirmation once approved.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setPaymentStep('payment')}
                      className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                </>
              )}

              {paymentStep === 'success' && (
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">🎉 Payment Submitted!</h2>
                  <p className="text-gray-600 text-sm mb-4">
                    Thank you! Your payment request has been submitted successfully.
                  </p>
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="text-green-800">
                      <p className="font-medium mb-3 flex items-center justify-center gap-2 text-sm">
                        <Clock className="w-4 h-4" />
                        What happens next?
                      </p>
                      <div className="space-y-2 text-left text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                          <span>Admin will verify payment within 24 hours</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                          <span>AI Resume Builder access will be activated</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                          <span>You'll receive an email confirmation</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-blue-800 text-xs">
                      <strong>Transaction ID:</strong> {formData.transactionId}
                    </p>
                  </div>
                  
                  <button
                    onClick={handleBackToSelection}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg"
                  >
                    Back to Resume Builders
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full-page Enhanced QA Resume Builder
  if (currentPage === 'qa-builder') {
    return (
      <div className="fixed inset-0 bg-white" style={{ top: '64px', zIndex: 7999 }}>
        {/* Single Back Button */}
        <div className="absolute top-4 left-4 sm:left-6 z-10">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-lg hover:bg-gray-50 transition-all text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-gray-700">Back</span>
          </button>
        </div>
        <div className="h-full overflow-y-auto">
          <CompleteEnhancedResumeBuilder onBack={handleBack} userEmail={userEmail} />
        </div>
      </div>
    );
  }

  // Selection Screen - Professional Full Page Layout
  try {
    return (
      <div className="fixed inset-0 bg-white" style={{ top: '64px', zIndex: 7999 }}>
        {/* Single Back Button for all pages */}
        <div className="absolute top-4 left-4 sm:left-6 z-10">
          <button 
            onClick={handleClose}
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-lg hover:bg-gray-50 transition-all text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-gray-700">Back</span>
          </button>
        </div>

        {/* Content */}
        <div className="h-full bg-gradient-to-br from-gray-50 to-blue-50 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Resume Builder
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Select the perfect tool to create your professional resume
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* AI Resume Builder */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Resume Builder</h3>
                <p className="text-purple-600 font-semibold">AI-Powered • ₹{paymentConfig?.monthly_price || 99}/month</p>
              </div>
              
              <div className="space-y-3 mb-8">
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
                onClick={() => handleBuilderAccess('ai-payment')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg flex items-center justify-center gap-3 relative"
              >
                <Sparkles className="w-6 h-6" />
                Try AI Builder
              </button>
            </div>

            {/* QA Resume Builder */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">QA Resume Builder</h3>
                <p className="text-blue-600 font-semibold">QA Professionals • Free</p>
              </div>
              
              <div className="space-y-3 mb-8">
                {[
                  'Publications & Open Source sections',
                  'Professional Memberships (ISTQB, etc.)',
                  'Portfolio & Case Studies',
                  'Patents & Innovations',
                  'Advanced QA-specific templates'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => handleBuilderAccess('qa-builder')}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg flex items-center justify-center gap-3 relative"
              >
                <Crown className="w-6 h-6" />
                QA Resume Builder
              </button>
            </div>
          </div>

          {/* Verification Notice */}
          {(!user || !isVerified) && (
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Email Verification Required
              </h3>
              <p className="text-blue-700 mb-4">
                To create and save your resume, please verify your email address. We'll send you a magic link for instant access.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                <CheckCircle className="w-4 h-4" />
                <span>Secure & Private</span>
                <span>•</span>
                <CheckCircle className="w-4 h-4" />
                <span>No Spam</span>
                <span>•</span>
                <CheckCircle className="w-4 h-4" />
                <span>Instant Access</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setPendingAction(null);
        }}
        onSuccess={handleAuthSuccess}
        action="resume"
      />
      </div>
    );
  } catch (error) {
    console.error('ResumeBuilderRouter render error:', error);
    setHasError(true);
    return null;
  }
};

export default ResumeBuilderRouter;