import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, AlertCircle, CheckCircle, Clock, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useModalScrollLock } from '../hooks/useModalScrollLock';
import toast from 'react-hot-toast';

const AuthModal = ({ isOpen, onClose, onSuccess, action = 'comment' }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('email'); // 'email', 'verify', or 'rate_limited'
  const [rateLimitInfo, setRateLimitInfo] = useState(null);
  const [requestId, setRequestId] = useState(null);

  // Prevent background scrolling
  useModalScrollLock(isOpen);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (isOpen && supabase) {
        try {
          // Check Supabase auth
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            console.log('✅ User already authenticated:', user.email);
            toast.success('Welcome back! You\'re already signed in.');
            onClose();
            if (onSuccess) onSuccess();
          }
        } catch (error) {
          console.warn('Auth check failed:', error);
          // Don't show error to user, just continue with normal flow
        }
      }
    };
    checkAuth();
  }, [isOpen, onClose, onSuccess]);

  if (!isOpen) return null;

  // Error boundary for the component
  try {
    const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!trimmedEmail) {
      toast.error('Please enter your email address');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      // Check if Supabase is available
      if (!supabase) {
        // Fallback for development - simulate magic link
        console.log('🚀 Development mode: Simulating magic link for', trimmedEmail);
        
        // Store email for verification
        sessionStorage.setItem('pending_auth_email', trimmedEmail);
        
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStep('verify');
        toast.success(`✅ Development mode: Magic link simulated for ${trimmedEmail}`);
        
        // Auto-verify after 3 seconds in development
        setTimeout(() => {
          const mockUser = {
            id: `dev-${Date.now()}`,
            email: trimmedEmail,
            email_confirmed_at: new Date().toISOString(),
            user_metadata: {
              full_name: trimmedEmail.split('@')[0]
            }
          };
          
          // Store in localStorage for AuthContext
          localStorage.setItem('dev_auth_user', JSON.stringify(mockUser));
          
          toast.success('🚀 Development: Auto-verified! You can now create posts.');
          onClose();
          if (onSuccess) onSuccess();
          
          // Trigger auth state change
          window.dispatchEvent(new CustomEvent('auth-state-change', {
            detail: { user: mockUser, session: { user: mockUser } }
          }));
        }, 3000);
        
        return;
      }
      
      // Send magic link via Supabase
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        // Handle specific Supabase errors
        if (error.message.includes('fetch')) {
          throw new Error('Unable to connect to authentication service. Please check your internet connection and try again.');
        }
        throw error;
      }
      
      setStep('verify');
      toast.success(`✅ Verification email sent to ${trimmedEmail}`);
      
    } catch (error) {
      console.error('❌ Magic link failed:', error);
      
      let errorMessage = 'Failed to send magic link';
      
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to authentication service. Please check your internet connection and try again.';
      } else if (error.message.includes('Rate limit')) {
        setRateLimitInfo({ message: error.message });
        setStep('rate_limited');
        return;
      } else if (error.message.includes('not available')) {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const actionText = {
    comment: 'comment on this post',
    like: 'like this post',
    post: 'create a post',
    save: 'save this post to your boards',
    boards: 'access your boards',
    resume: 'create your resume'
  };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[calc(90vh-80px)] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {step === 'email' ? 'Join the Discussion' : 'Check Your Email'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {step === 'rate_limited' ? (
            <>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Rate Limit Reached
                </h3>
                <p className="text-gray-600 mb-6">
                  {rateLimitInfo?.message || 'You\'ve reached the maximum number of magic link requests.'}
                </p>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div className="text-sm text-orange-800">
                      <p className="font-medium mb-1">Security Protection Active</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Maximum 5 requests per hour per device</li>
                        <li>• This prevents unauthorized access attempts</li>
                        <li>• Your limit will reset automatically</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setStep('email');
                      setRateLimitInfo(null);
                    }}
                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-medium"
                  >
                    Try Different Email
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </>
          ) : step === 'email' ? (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-600">
                  To {actionText[action]}, please verify your email address. We'll send you a magic link for instant access.
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Sending Magic Link...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Send Magic Link
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  By continuing, you agree to our Terms of Service and Privacy Policy. 
                  No spam, just community updates.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Check Your Email
                </h3>
                <p className="text-gray-600 mb-6">
                  We've sent a secure verification link to <strong>{email}</strong>. 
                  Click the link in your email to complete authentication.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Next Steps:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Check your email inbox (and spam folder)</li>
                        <li>• Click the "Verify Account" button in the email</li>
                        <li>• You'll be automatically signed in</li>
                        {requestId && <li>• Request ID: {requestId}</li>}
                        {window.location.hostname === 'localhost' && (
                          <li style={{color: '#059669'}}>• Development: Check browser console for direct link</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('email')}
                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-medium"
                  >
                    Send to Different Email
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      </div>
    );
  } catch (error) {
    console.error('AuthModal render error:', error);
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999999] p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Authentication Error</h3>
          <p className="text-gray-600 mb-4">There was an issue with the authentication system.</p>
          <button
            onClick={onClose}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }
};

export default AuthModal;