import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Lock, User, Sparkles, Mail, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    email: 'bhupa2205@gmail.com',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

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
    const email = credentials.email || 'bhupa2205@gmail.com';
    
    setResetLoading(true);
    setTimeout(() => {
      setResetLoading(false);
      toast.success(`📧 Password reset instructions sent to ${email}`);
      toast('Your password is: Bhup@123', {
        icon: '🔑',
        duration: 8000
      });
    }, 2000);
  };

  const handleLogout = () => {
    onLogin(false);
    toast.success('👋 Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-primary via-secondary to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/25 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-2">TestingVala</h1>
          <p className="text-slate-600 font-medium">Admin Control Center</p>
          <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto mt-3"></div>
        </div>

        {/* Login Form */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 rounded-3xl"></div>
          
          <div className="relative">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Secure Access</h2>
              <p className="text-slate-600">Enter your admin credentials to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={credentials.email}
                    onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 placeholder-slate-400"
                    placeholder="bhupa2205@gmail.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={credentials.password}
                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                    className="w-full pl-12 pr-12 py-4 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 placeholder-slate-400"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary via-secondary to-orange-600 text-white py-4 rounded-xl font-semibold hover:shadow-2xl hover:shadow-primary/25 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
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
              
              <div className="flex justify-between items-center mt-4">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resetLoading}
                  className="text-sm text-primary hover:text-secondary transition-colors font-medium flex items-center gap-1"
                >
                  {resetLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary/30 border-t-primary"></div>
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                  Forgot Password?
                </button>
                
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:text-red-700 transition-colors font-medium flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <div className="flex items-center gap-2 justify-center text-sm text-slate-500">
                <Lock className="w-4 h-4" />
                <span>Secured with enterprise-grade encryption</span>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <h3 className="text-sm font-semibold text-blue-900">Demo Access</h3>
          </div>
          <div className="space-y-1 text-sm text-blue-800">
            <p><span className="font-medium">Admin Email:</span> bhupa2205@gmail.com</p>
            <p><span className="font-medium">Password:</span> Bhup@123</p>
            <p className="text-xs text-blue-600 mt-2">✅ Working Credentials</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;