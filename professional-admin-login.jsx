import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Lock, User, Mail, LogOut, X, CheckCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    email: 'bhupa2205@gmail.com',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetStep, setResetStep] = useState('email'); // 'email', 'sending', 'sent'

  const ADMIN_CREDENTIALS = [
    { email: 'admin@testingvala.com', password: 'TestingVala@2025' },
    { email: 'bhupa2205@gmail.com', password: 'Bhup@123' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const isValidAdmin = ADMIN_CREDENTIALS.some(admin => 
        credentials.email === admin.email && 
        credentials.password === admin.password
      );
      
      if (isValidAdmin) {
        toast.success('🎉 Welcome back, Admin!');
        onLogin(true);
      } else {
        toast.error('❌ Invalid credentials. Access denied.');
      }
    } catch (error) {
      toast.error('🚫 Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setForgotEmail(credentials.email || 'bhupa2205@gmail.com');
    setShowForgotModal(true);
    setResetStep('email');
  };

  const sendResetEmail = async () => {
    setResetStep('sending');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setResetStep('sent');
    toast.success('📧 Password reset email sent!');
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setResetStep('email');
    setForgotEmail('');
  };

  const handleLogout = () => {
    onLogin(false);
    toast.success('👋 Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">TestingVala</h1>
          <p className="text-slate-600 font-medium">Admin Control Center</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Admin Login</h2>
            <p className="text-slate-600">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={credentials.email}
                  onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="bhupa2205@gmail.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  className="w-full pl-12 pr-12 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Access Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors font-medium border border-blue-200"
            >
              <Mail className="w-5 h-5" />
              Forgot Password?
            </button>
            
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium border border-red-200"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-6 bg-blue-50 rounded-2xl border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Admin Credentials</h3>
          <div className="space-y-1 text-sm text-blue-800">
            <p><strong>Email:</strong> bhupa2205@gmail.com</p>
            <p><strong>Password:</strong> Bhup@123</p>
          </div>
        </div>
      </div>

      {/* Professional Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={closeForgotModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {resetStep === 'email' && (
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Reset Password</h3>
                <p className="text-slate-600 mb-6">Enter your email address and we'll send you instructions to reset your password.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 text-left">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <button
                    onClick={sendResetEmail}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Send Reset Instructions
                  </button>
                  
                  <button
                    onClick={closeForgotModal}
                    className="w-full text-slate-600 py-2 font-medium hover:text-slate-800 transition-colors"
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            )}

            {resetStep === 'sending' && (
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600/30 border-t-blue-600"></div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Sending Email...</h3>
                <p className="text-slate-600">Please wait while we send the reset instructions to your email.</p>
              </div>
            )}

            {resetStep === 'sent' && (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Email Sent!</h3>
                <p className="text-slate-600 mb-6">We've sent password reset instructions to <strong>{forgotEmail}</strong></p>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-yellow-800">
                    <strong>Demo Mode:</strong> Your password is <strong>Bhup@123</strong>
                  </p>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={closeForgotModal}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Login
                  </button>
                  
                  <p className="text-xs text-slate-500">
                    Didn't receive the email? Check your spam folder or try again.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;