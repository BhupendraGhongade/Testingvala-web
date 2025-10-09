/**
 * UNIFIED MAGIC LINK API - PRODUCTION READY
 * Sends emails via ZeptoEmail with role assignment
 */

import { createClient } from '@supabase/supabase-js';

// Environment configuration
const config = {
  supabaseUrl: process.env.VITE_SUPABASE_URL,
  supabaseKey: process.env.VITE_SUPABASE_ANON_KEY,
  zeptoApiKey: process.env.ZEPTO_API_KEY,
  zeptoFromEmail: process.env.ZEPTO_FROM_EMAIL || 'info@testingvala.com',
  zeptoFromName: process.env.ZEPTO_FROM_NAME || 'TestingVala',
  isDevelopment: process.env.NODE_ENV !== 'production' && process.env.VERCEL_ENV !== 'production'
};

// Initialize Supabase (for token storage only)
const supabase = config.supabaseUrl && config.supabaseKey 
  ? createClient(config.supabaseUrl, config.supabaseKey)
  : null;

// Rate limiting
const rateLimitStore = new Map();
const RATE_LIMIT = { max: 5, window: 60 * 60 * 1000 }; // 5 per hour

// Role determination
const determineUserRole = (email) => {
  const adminEmails = ['admin@testingvala.com'];
  const isAdmin = adminEmails.includes(email.toLowerCase()) || 
                 email.toLowerCase().includes('admin@testingvala');
  return isAdmin ? 'admin' : 'user';
};

// Email template with role-aware content
const getEmailTemplate = (email, magicLink, role) => {
  const roleText = role === 'admin' ? 'Admin Dashboard' : 'Community Platform';
  const roleIcon = role === 'admin' ? '👑' : '🚀';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign in to TestingVala ${roleText}</title>
    <style>
        body { font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 40px 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .button { display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2); }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        .role-badge { display: inline-block; background: ${role === 'admin' ? '#dc2626' : '#059669'}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 48px; margin-bottom: 16px;">${roleIcon}</div>
            <h1 style="margin: 0; font-size: 28px;">TestingVala</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">${roleText}</p>
        </div>
        <div class="content">
            <div class="role-badge">${role.toUpperCase()} ACCESS</div>
            <h2 style="color: #1e293b; margin: 0 0 20px 0;">Welcome back! 🎉</h2>
            <p style="color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
                Click the button below to securely sign in to your TestingVala ${roleText.toLowerCase()}. This magic link is valid for 15 minutes and can only be used once.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${magicLink}" class="button">Sign In to ${roleText}</a>
            </div>
            <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #64748b; font-size: 14px; margin: 0; text-align: center;">
                    <strong>Security Notice:</strong> This link expires in 15 minutes and can only be used once. If you didn't request this, please ignore this email.
                </p>
            </div>
            <p style="color: #64748b; font-size: 13px; margin: 20px 0 0 0; text-align: center;">
                Having trouble? Copy and paste this link: <br>
                <span style="word-break: break-all; color: #2563eb;">${magicLink}</span>
            </p>
        </div>
        <div class="footer">
            <p style="margin: 0 0 10px 0;">
                📧 Questions? Email us at <a href="mailto:support@testingvala.com" style="color: #2563eb;">support@testingvala.com</a>
            </p>
            <p style="margin: 0;">© ${new Date().getFullYear()} TestingVala • Professional QA Testing Platform</p>
        </div>
    </div>
</body>
</html>`;
};

// Rate limiting check
const checkRateLimit = (identifier) => {
  const now = Date.now();
  const requests = rateLimitStore.get(identifier) || [];
  const validRequests = requests.filter(time => now - time < RATE_LIMIT.window);
  
  if (validRequests.length >= RATE_LIMIT.max) {
    return { allowed: false, resetTime: new Date(Math.min(...validRequests) + RATE_LIMIT.window) };
  }
  
  validRequests.push(now);
  rateLimitStore.set(identifier, validRequests);
  return { allowed: true, remaining: RATE_LIMIT.max - validRequests.length };
};

// Generate secure token
const generateToken = () => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Store token for verification
const storeToken = async (email, token, role) => {
  if (!supabase) {
    // Fallback storage for development
    const tokenData = {
      email,
      token,
      role,
      expires: Date.now() + (15 * 60 * 1000), // 15 minutes
      used: false
    };
    
    // Store in memory for development
    global.magicTokens = global.magicTokens || new Map();
    global.magicTokens.set(token, tokenData);
    return true;
  }
  
  try {
    const { error } = await supabase
      .from('magic_tokens')
      .insert({
        email,
        token,
        role,
        expires_at: new Date(Date.now() + (15 * 60 * 1000)).toISOString(),
        used: false
      });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Token storage error:', error);
    return false;
  }
};

export default async function handler(req, res) {
  const requestId = Math.random().toString(36).substring(2, 15);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, X-Request-ID');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', requestId });
  }
  
  console.log(`[magic-link] [${requestId}] Request started`);
  
  try {
    const { email, deviceId } = req.body || {};
    
    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email address required', requestId });
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    const userRole = determineUserRole(normalizedEmail);
    
    // Rate limiting
    const clientId = deviceId || req.headers['x-forwarded-for'] || 'unknown';
    const rateCheck = checkRateLimit(`${normalizedEmail}:${clientId}`);
    
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Try again later.',
        resetTime: rateCheck.resetTime,
        requestId
      });
    }
    
    // Generate secure token
    const token = generateToken();
    const baseUrl = req.headers.origin || 'https://testingvala.com';
    const magicLink = `${baseUrl}/auth/verify?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;
    
    // Store token
    const tokenStored = await storeToken(normalizedEmail, token, userRole);
    if (!tokenStored) {
      return res.status(500).json({ error: 'Token storage failed', requestId });
    }
    
    // Development mode - log link and return success
    if (config.isDevelopment) {
      console.log(`[magic-link] [${requestId}] 🔗 DEV MAGIC LINK: ${magicLink}`);
      console.log(`[magic-link] [${requestId}] 👤 USER ROLE: ${userRole}`);
      
      return res.status(200).json({
        success: true,
        messageId: `dev_${requestId}`,
        magicLink,
        role: userRole,
        message: 'Development mode - check console for magic link',
        provider: 'development',
        requestId
      });
    }
    
    // Production - send via ZeptoEmail
    if (!config.zeptoApiKey) {
      return res.status(500).json({ 
        error: 'Email service not configured', 
        requestId 
      });
    }
    
    const emailPayload = {
      from: { 
        address: config.zeptoFromEmail, 
        name: config.zeptoFromName 
      },
      to: [{ 
        email_address: { 
          address: normalizedEmail 
        } 
      }],
      subject: `🔐 Sign in to TestingVala ${userRole === 'admin' ? 'Admin Dashboard' : 'Community'}`,
      htmlbody: getEmailTemplate(normalizedEmail, magicLink, userRole)
    };
    
    console.log(`[magic-link] [${requestId}] Sending email via ZeptoMail to: ${normalizedEmail} (${userRole})`);
    
    const emailResponse = await fetch('https://api.zeptomail.in/v1.1/email', {
      method: 'POST',
      headers: {
        'Authorization': config.zeptoApiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    });
    
    if (emailResponse.ok) {
      const result = await emailResponse.json().catch(() => ({}));
      const messageId = result.data?.[0]?.message_id || requestId;
      
      console.log(`[magic-link] [${requestId}] ✅ Email sent successfully: ${messageId}`);
      
      return res.status(200).json({
        success: true,
        messageId,
        role: userRole,
        message: 'Magic link sent successfully via ZeptoMail',
        provider: 'zeptomail',
        remaining: rateCheck.remaining,
        requestId
      });
      
    } else {
      const errorText = await emailResponse.text().catch(() => 'Unknown error');
      console.error(`[magic-link] [${requestId}] ZeptoMail error: ${emailResponse.status} - ${errorText}`);
      
      return res.status(500).json({
        error: 'Email delivery failed',
        message: 'Unable to send verification email. Please try again.',
        requestId
      });
    }
    
  } catch (error) {
    console.error(`[magic-link] [${requestId}] Error:`, error);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Authentication service temporarily unavailable',
      requestId
    });
  }
}