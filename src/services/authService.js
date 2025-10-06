// Enterprise Authentication Service
import { supabase } from '../lib/supabase';

class AuthService {
  constructor() {
    this.rateLimitKey = import.meta.env.VITE_RATE_LIMIT_KEY;
    this.sessionKey = import.meta.env.VITE_SESSION_KEY;
    this.deviceKey = import.meta.env.VITE_DEVICE_KEY;
    this.maxRequests = parseInt(import.meta.env.VITE_MAX_REQUESTS) || 5;
    this.rateLimitWindow = parseInt(import.meta.env.VITE_RATE_LIMIT_WINDOW) || 60 * 60 * 1000;
    this.sessionDuration = parseInt(import.meta.env.VITE_SESSION_DURATION) || 30 * 24 * 60 * 60 * 1000;
  }

  // Generate unique device fingerprint
  generateDeviceId() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    return btoa(fingerprint).substring(0, 32);
  }

  // Get or create device ID
  getDeviceId() {
    let deviceId = localStorage.getItem(this.deviceKey);
    if (!deviceId) {
      deviceId = this.generateDeviceId();
      localStorage.setItem(this.deviceKey, deviceId);
    }
    return deviceId;
  }

  // Check rate limiting
  checkRateLimit(email) {
    const deviceId = this.getDeviceId();
    const key = `${this.rateLimitKey}_${email}_${deviceId}`;
    const stored = localStorage.getItem(key);
    
    if (!stored) {
      return { allowed: true, remaining: this.maxRequests - 1 };
    }
    
    const data = JSON.parse(stored);
    const now = Date.now();
    
    // Reset if window expired
    if (now - data.firstRequest > this.rateLimitWindow) {
      localStorage.removeItem(key);
      return { allowed: true, remaining: this.maxRequests - 1 };
    }
    
    // Check if limit exceeded
    if (data.count >= this.maxRequests) {
      const resetTime = new Date(data.firstRequest + this.rateLimitWindow);
      return { 
        allowed: false, 
        remaining: 0,
        resetTime,
        message: `Rate limit exceeded. Try again after ${resetTime.toLocaleTimeString()}`
      };
    }
    
    return { allowed: true, remaining: this.maxRequests - data.count - 1 };
  }

  // Record magic link request
  recordRequest(email) {
    const deviceId = this.getDeviceId();
    const key = `${this.rateLimitKey}_${email}_${deviceId}`;
    const stored = localStorage.getItem(key);
    const now = Date.now();
    
    if (!stored) {
      localStorage.setItem(key, JSON.stringify({
        count: 1,
        firstRequest: now,
        lastRequest: now
      }));
    } else {
      const data = JSON.parse(stored);
      data.count += 1;
      data.lastRequest = now;
      localStorage.setItem(key, JSON.stringify(data));
    }
  }

  // Send magic link with comprehensive logging
  async sendMagicLink(email) {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(2, 15);
    
    console.log(`🚀 [${requestId}] Magic Link Request Started`, {
      email,
      timestamp: new Date().toISOString(),
      deviceId: this.getDeviceId(),
      userAgent: navigator.userAgent
    });

    try {
      // Check rate limiting
      const rateCheck = this.checkRateLimit(email);
      if (!rateCheck.allowed) {
        console.warn(`⚠️ [${requestId}] Rate limit exceeded`, rateCheck);
        throw new Error(rateCheck.message);
      }

      // Validate email format with safe regex
      const emailRegex = new RegExp('^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$');
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Generate secure CSRF token
      const csrfToken = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('csrf_token', csrfToken);

      console.log(`📧 [${requestId}] Sending email request`, {
        email,
        remaining: rateCheck.remaining,
        csrfToken
      });

      // Send request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch('/api/send-magic-link', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
          'X-Request-ID': requestId,
          'X-Requested-With': 'XMLHttpRequest',
          'Origin': window.location.origin
        },
        credentials: 'same-origin',
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(),
          deviceId: this.getDeviceId(),
          requestId,
          csrfToken
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json();
      
      // Record successful request
      this.recordRequest(email);
      
      const duration = Date.now() - startTime;
      console.log(`✅ [${requestId}] Magic Link Sent Successfully`, {
        email,
        messageId: result.messageId,
        duration: `${duration}ms`,
        remaining: rateCheck.remaining - 1
      });

      return {
        success: true,
        messageId: result.messageId,
        remaining: rateCheck.remaining - 1,
        requestId
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ [${requestId}] Magic Link Failed`, {
        email,
        error: error.message,
        duration: `${duration}ms`,
        stack: error.stack
      });

      // Categorize errors for better UX
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your connection and try again.');
      } else if (error.message.includes('Rate limit')) {
        throw error; // Pass through rate limit errors
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        throw new Error(error.message || 'Failed to send magic link. Please try again.');
      }
    }
  }

  // Verify magic link token
  async verifyToken(token, email) {
    const requestId = Math.random().toString(36).substring(2, 15);
    
    console.log(`🔐 [${requestId}] Token Verification Started`, {
      email,
      token: token.substring(0, 8) + '...',
      timestamp: new Date().toISOString()
    });

    try {
      // Validate inputs
      if (!token || !email || token.length > 100 || email.length > 254) {
        throw new Error('Invalid token or email format');
      }
      
      const response = await fetch(`/api/verify-token?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}&requestId=${requestId}`, {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'same-origin'
      });
      
      if (!response.ok) {
        throw new Error('Token verification failed');
      }

      // Create secure session
      const session = {
        email,
        verified: true,
        deviceId: this.getDeviceId(),
        loginTime: Date.now(),
        expiresAt: Date.now() + this.sessionDuration
      };

      localStorage.setItem(this.sessionKey, JSON.stringify(session));
      localStorage.setItem('user_email', email);
      localStorage.setItem('user_verified', 'true');

      console.log(`✅ [${requestId}] Token Verified Successfully`, {
        email,
        sessionDuration: '30 days'
      });

      return { success: true, session };

    } catch (error) {
      console.error(`❌ [${requestId}] Token Verification Failed`, {
        email,
        error: error.message
      });
      throw error;
    }
  }

  // Check if user has valid session
  isAuthenticated() {
    try {
      const session = localStorage.getItem(this.sessionKey);
      if (!session) return false;

      const sessionData = JSON.parse(session);
      const now = Date.now();

      // Check if session expired
      if (now > sessionData.expiresAt) {
        this.clearSession();
        return false;
      }

      // Check if device changed (security measure)
      const currentDeviceId = this.getDeviceId();
      if (sessionData.deviceId !== currentDeviceId) {
        console.warn('🔒 Device change detected, requiring re-authentication');
        this.clearSession();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      this.clearSession();
      return false;
    }
  }

  // Get current session
  getSession() {
    try {
      const session = localStorage.getItem(this.sessionKey);
      return session ? JSON.parse(session) : null;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  // Clear session
  clearSession() {
    localStorage.removeItem(this.sessionKey);
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_verified');
    console.log('🔓 Session cleared');
  }

  // Extend session (called on user activity)
  extendSession() {
    const session = this.getSession();
    if (session) {
      session.expiresAt = Date.now() + this.sessionDuration;
      localStorage.setItem(this.sessionKey, JSON.stringify(session));
    }
  }

  // Get authentication status with detailed info
  getAuthStatus() {
    const session = this.getSession();
    const isAuth = this.isAuthenticated();
    
    return {
      isAuthenticated: isAuth,
      email: session?.email || localStorage.getItem('user_email'),
      loginTime: session?.loginTime,
      expiresAt: session?.expiresAt,
      deviceId: session?.deviceId,
      timeRemaining: session?.expiresAt ? session.expiresAt - Date.now() : 0
    };
  }
}

export const authService = new AuthService();