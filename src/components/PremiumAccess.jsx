import React, { useState, useEffect } from 'react';
import { Crown, CheckCircle, Clock, XCircle, Copy, AlertTriangle, User, Phone, Mail, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const PremiumAccess = ({ userEmail, onAccessChange }) => {
  const [loading, setLoading] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [premiumStatus, setPremiumStatus] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: userEmail || '',
    user_phone: '',
    transaction_id: ''
  });

  useEffect(() => {
    if (userEmail) {
      loadData();
    }
  }, [userEmail]);

  const loadData = async () => {
    try {
      if (!supabase) {
        toast.error('Service not available');
        return;
      }

      const [configResult, userResult, requestResult] = await Promise.all([
        supabase.from('payment_config').select('*').single(),
        supabase.from('premium_users').select('*').eq('user_email', userEmail).single(),
        supabase.from('premium_requests').select('*').eq('user_email', userEmail).order('created_at', { ascending: false }).limit(1).single()
      ]);

      if (configResult.data) {
        setPaymentConfig(configResult.data);
      }
      
      if (userResult.data && new Date(userResult.data.expires_at) > new Date()) {
        setPremiumStatus({ type: 'active', data: userResult.data });
        onAccessChange?.(true);
      } else if (requestResult.data && requestResult.data.status === 'pending') {
        setPremiumStatus({ type: 'pending', data: requestResult.data });
        onAccessChange?.(false);
      } else {
        setPremiumStatus({ type: 'none' });
        onAccessChange?.(false);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      onAccessChange?.(false);
    } finally {
      setLoading(false);
    }
  };

  const handleStepSubmit = (e) => {
    e.preventDefault();
    if (currentStep === 1) {
      if (!formData.user_name || !formData.user_phone) {
        toast.error('Please fill all required fields');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 3) {
      submitPaymentRequest();
    }
  };

  const submitPaymentRequest = async () => {
    if (!formData.transaction_id) {
      toast.error('Please enter transaction ID');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('premium_requests').insert({
        user_name: formData.user_name,
        user_email: formData.user_email,
        user_phone: formData.user_phone,
        transaction_id: formData.transaction_id,
        payment_method: 'UPI'
      });

      if (error) throw error;

      toast.success('Thanks for your payment. Once the admin verifies, your Premium access will be enabled within 24 hours.');
      setCurrentStep(1);
      loadData();
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit payment request');
    } finally {
      setLoading(false);
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(paymentConfig?.upi_id || '');
    toast.success('UPI ID copied to clipboard');
  };

  const generateQRCode = (upiId, amount) => {
    const upiUrl = `upi://pay?pa=${upiId}&pn=TestingVala&am=${amount}&cu=INR&tn=AI Resume Builder Premium`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  // Active premium access
  if (premiumStatus?.type === 'active') {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-900">Premium Active</h3>
            <p className="text-sm text-green-700">You have unlimited access to AI Resume Builder</p>
          </div>
        </div>
        <div className="bg-white/50 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-700">Expires on:</span>
            <span className="font-medium text-green-900">
              {new Date(premiumStatus.data.expires_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Pending request
  if (premiumStatus?.type === 'pending') {
    return (
      <div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-xl p-6 border border-yellow-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-yellow-900">Payment Under Review</h3>
            <p className="text-sm text-yellow-700">We're verifying your payment. You'll get access within 24 hours.</p>
          </div>
        </div>
        <div className="bg-white/50 rounded-lg p-4">
          <div className="text-sm text-yellow-700 space-y-1">
            <p><strong>Transaction ID:</strong> {premiumStatus.data.transaction_id}</p>
            <p><strong>Submitted:</strong> {new Date(premiumStatus.data.created_at).toLocaleString()}</p>
          </div>
        </div>
      </div>
    );
  }

  // No active subscription - show payment options
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-xl p-6 border border-purple-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-purple-900">Unlock AI Resume Builder</h3>
            <p className="text-sm text-purple-700">Get unlimited access to AI-powered resume generation</p>
          </div>
        </div>
        
        <div className="bg-white/50 rounded-lg p-4 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-900 mb-2">₹{paymentConfig?.monthly_price || 99}</div>
            <div className="text-sm text-purple-700">per month</div>
          </div>
        </div>

        <div className="space-y-3 text-sm text-purple-700">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Unlimited AI resume generations</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>ATS-optimized templates</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Industry-specific keywords</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Priority support</span>
          </div>
        </div>

        <button
          onClick={() => setCurrentStep(1)}
          className="w-full mt-6 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          Pay Now - Get Instant Access
        </button>
      </div>

      {currentStep > 0 && currentStep < 4 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-sm sm:max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold">
                  {currentStep === 1 ? 'Personal Details' : 
                   currentStep === 2 ? 'Payment Details' : 'Confirm Payment'}
                </h3>
                <button
                  onClick={() => setCurrentStep(0)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Step Progress */}
              <div className="flex items-center justify-center mb-4 sm:mb-6">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                      currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {step}
                    </div>
                    {step < 3 && <div className={`w-8 sm:w-12 h-1 mx-1 sm:mx-2 ${
                      currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />}
                  </div>
                ))}
              </div>

              {/* Step 1: Personal Details */}
              {currentStep === 1 && (
                <form onSubmit={handleStepSubmit} className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.user_name}
                      onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.user_email}
                      disabled
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.user_phone}
                      onChange={(e) => setFormData({ ...formData, user_phone: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Continue to Payment
                  </button>
                </form>
              )}

              {/* Step 2: Payment Details */}
              {currentStep === 2 && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <div className="text-center">
                      <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-2">Pay ₹{paymentConfig?.monthly_price} via UPI</h4>
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <span className="font-mono text-sm sm:text-lg break-all">{paymentConfig?.upi_id}</span>
                        <button
                          onClick={copyUpiId}
                          className="p-1 text-blue-600 hover:text-blue-800 flex-shrink-0"
                        >
                          <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                      {paymentConfig?.upi_id && (
                        <img
                          src={generateQRCode(paymentConfig.upi_id, paymentConfig.monthly_price)}
                          alt="UPI QR Code"
                          className="mx-auto w-24 h-24 sm:w-32 sm:h-32 border rounded-lg"
                        />
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      I have completed the payment
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Transaction Details */}
              {currentStep === 3 && (
                <form onSubmit={handleStepSubmit} className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                      Transaction ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.transaction_id}
                      onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter UPI transaction ID"
                    />
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs sm:text-sm text-blue-800">
                        <p className="font-medium">Note:</p>
                        <p>Thanks for your payment. Once the admin verifies, your Premium access will be enabled within 24 hours.</p>
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </form>
              )}


            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumAccess;