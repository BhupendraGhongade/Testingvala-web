import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader, Shield, Clock } from 'lucide-react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const AuthVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error', 'already_verified'
  const [errorDetails, setErrorDetails] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const success = searchParams.get('success');
  const error = searchParams.get('error');
  const sessionToken = searchParams.get('session');

  useEffect(() => {
    const handleVerification = async () => {
      // Check if already authenticated
      if (authService.isAuthenticated()) {
        const authStatus = authService.getAuthStatus();
        console.log('✅ User already authenticated:', authStatus.email);
        setStatus('already_verified');
        setSessionInfo(authStatus);
        toast.success('Welcome back! You\'re already signed in.');
        
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
        return;
      }
      
      // Handle direct success from redirect
      if (success === 'true' && sessionToken) {
        try {
          const sessionData = JSON.parse(atob(sessionToken));
          
          // Create secure session
          const session = {
            email: sessionData.email,
            verified: true,
            deviceId: authService.getDeviceId(),
            loginTime: Date.now(),
            expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
          };
          
          localStorage.setItem('testingvala_session', JSON.stringify(session));
          localStorage.setItem('user_email', sessionData.email);
          localStorage.setItem('user_verified', 'true');
          
          setStatus('success');
          setSessionInfo(session);
          toast.success('✅ Email verified successfully!');
          
          console.log('✅ Session created successfully', {
            email: sessionData.email,
            deviceId: session.deviceId,
            expiresIn: '30 days'
          });
          
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 3000);
          return;
        } catch (err) {
          console.error('Session parsing error:', err);
          setStatus('error');
          setErrorDetails({ message: 'Invalid session data' });
          return;
        }
      }
      
      // Handle errors from redirect
      if (error) {
        console.warn('Verification error:', error);
        setStatus('error');
        
        const errorMessages = {
          invalid_token: 'The verification link is invalid or malformed.',
          expired_token: 'The verification link has expired. Please request a new one.',
          verification_failed: 'Verification failed due to a server error.',
          already_used: 'This verification link has already been used.'
        };
        
        setErrorDetails({
          message: errorMessages[error] || 'Verification failed. Please try again.'
        });
        return;
      }
      
      // Handle token-based verification (legacy flow)
      if (token && email) {
        try {
          await authService.verifyToken(token, email);
          setStatus('success');
          const authStatus = authService.getAuthStatus();
          setSessionInfo(authStatus);
          toast.success('✅ Email verified successfully!');
          
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 3000);
        } catch (err) {
          console.error('Token verification failed:', err);
          setStatus('error');
          setErrorDetails({ message: err.message });
        }
        return;
      }
      
      // No valid parameters
      setStatus('error');
      setErrorDetails({ message: 'Invalid verification link. Missing required parameters.' });
    };
    
    // Add delay for better UX
    setTimeout(handleVerification, 1500);
  }, [token, email, success, error, sessionToken, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        {status === 'verifying' && (
          <>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader className="w-8 h-8 text-white animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Verifying Your Email</h2>
            <p className="text-gray-600 mb-6">Please wait while we securely verify your email address and create your session...</p>
            <div className="space-y-2">
              <div className="animate-pulse bg-blue-200 h-2 rounded-full"></div>
              <div className="animate-pulse bg-blue-100 h-2 rounded-full w-3/4 mx-auto"></div>
            </div>
          </>
        )}
        
        {status === 'already_verified' && (
          <>
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Already Signed In</h2>
            <p className="text-gray-600 mb-6">
              Welcome back! You're already authenticated as <strong>{sessionInfo?.email}</strong>.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-green-800">
                <Clock className="w-4 h-4" />
                <span>Session expires: {sessionInfo?.expiresAt ? new Date(sessionInfo.expiresAt).toLocaleDateString() : 'Never'}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500">Redirecting you to the platform...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Verified!</h2>
            <p className="text-gray-600 mb-6">
              Welcome to TestingVala! Your email <strong>{sessionInfo?.email || email}</strong> has been successfully verified.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="text-sm text-green-800">
                <p className="font-medium mb-2">🎉 Authentication Complete!</p>
                <ul className="space-y-1 text-xs">
                  <li>• Secure session created (30-day duration)</li>
                  <li>• Full access to all TestingVala features</li>
                  <li>• Device-specific authentication for security</li>
                  {sessionInfo?.deviceId && <li>• Device ID: {sessionInfo.deviceId.substring(0, 8)}...</li>}
                </ul>
              </div>
            </div>
            <p className="text-sm text-gray-500">Redirecting you to the platform...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Verification Failed</h2>
            <p className="text-gray-600 mb-6">
              {errorDetails?.message || 'The verification link is invalid or has expired. Please try requesting a new magic link.'}
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">Common Solutions:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Check if the link was copied completely</li>
                  <li>• Verification links expire after 24 hours</li>
                  <li>• Each link can only be used once</li>
                  <li>• Try requesting a new magic link</li>
                </ul>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/', { replace: true })}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                Request New Link
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 font-medium"
              >
                Try Again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthVerify;