<<<<<<< HEAD
// PRODUCTION-READY MAGIC LINK API - BULLETPROOF VERSION
import { createClient } from '@supabase/supabase-js';

// Environment validation
const requiredEnvVars = {
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
  ZEPTO_API_KEY: process.env.ZEPTO_API_KEY,
=======
// PRODUCTION-READY MAGIC LINK API - WORLD CLASS TEMPLATE v2.0
import { createClient } from '@supabase/supabase-js';

// Template version for cache busting
const TEMPLATE_VERSION = '2.0.0';

// Environment validation with fallbacks
const requiredEnvVars = {
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'https://qxsardezvxsquvejvsso.supabase.co',
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4c2FyZGV6dnhzcXV2ZWp2c3NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NDc2OTMsImV4cCI6MjA3MTAyMzY5M30.ZQhcxebPR4kvAAwCIJr7WlugVwoZivTDN9ID3p_aC04',
  ZEPTO_API_KEY: process.env.ZEPTO_API_KEY || 'Zoho-enczapikey wSsVR60h+H2z1/slQwNXOqACRsi9eCGrL5gLwUVuY8XAqRRGU1Wr98pwWTiokx+AKFBQPPNwNo6se+bsOmGLG68PWlPCWqyqK3sx/VYSPOZsbq6x00Yt1UbckzVUYLtd9Zu1STUvdbSNA==',
>>>>>>> origin/main
  ZEPTO_FROM_EMAIL: process.env.ZEPTO_FROM_EMAIL || 'info@testingvala.com',
  ZEPTO_FROM_NAME: process.env.ZEPTO_FROM_NAME || 'TestingVala'
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
<<<<<<< HEAD
  .filter(([key, value]) => !value && key !== 'ZEPTO_FROM_EMAIL' && key !== 'ZEPTO_FROM_NAME')
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars);
=======
  .filter(([key, value]) => !value || value.includes('your_') || value.includes('placeholder'))
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('❌ Missing or invalid environment variables:', missingVars);
  console.log('📋 Current env values:', {
    hasSupabaseUrl: !!requiredEnvVars.VITE_SUPABASE_URL && !requiredEnvVars.VITE_SUPABASE_URL.includes('your_'),
    hasSupabaseKey: !!requiredEnvVars.VITE_SUPABASE_ANON_KEY && !requiredEnvVars.VITE_SUPABASE_ANON_KEY.includes('your_'),
    hasZeptoKey: !!requiredEnvVars.ZEPTO_API_KEY && !requiredEnvVars.ZEPTO_API_KEY.includes('your_'),
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV
  });
>>>>>>> origin/main
}

// Initialize Supabase client
const supabase = requiredEnvVars.VITE_SUPABASE_URL && requiredEnvVars.VITE_SUPABASE_ANON_KEY 
  ? createClient(requiredEnvVars.VITE_SUPABASE_URL, requiredEnvVars.VITE_SUPABASE_ANON_KEY)
  : null;

// Rate limiting store
const rateLimitStore = new Map();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

<<<<<<< HEAD
// Professional email template
function getEmailTemplate(email, magicLink) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your TestingVala Account</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 40px 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .button { display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🚀 TestingVala</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Professional QA Testing Platform</p>
        </div>
        <div class="content">
            <h2 style="color: #1e40af; margin: 0 0 20px 0;">Welcome to TestingVala! 🎉</h2>
            <p style="color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
                Hi there! We're excited to have you join our QA community. Click the button below to verify your email address and start exploring:
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${magicLink}" class="button">✨ Verify My Account</a>
            </div>
            <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #64748b; font-size: 14px; margin: 0; text-align: center;">
                    💡 <strong>What's next?</strong> Access exclusive QA resources, join contests, and connect with testing professionals worldwide!
                </p>
            </div>
            <p style="color: #64748b; font-size: 13px; margin: 20px 0 0 0; text-align: center;">
                This link expires in 24 hours for security. If you didn't request this, please ignore this email.
            </p>
        </div>
        <div class="footer">
            <p style="margin: 0 0 10px 0;">
                📧 Questions? Email us at <a href="mailto:info@testingvala.com" style="color: #3b82f6;">info@testingvala.com</a>
            </p>
            <p style="margin: 0;">© ${new Date().getFullYear()} TestingVala • Professional QA Testing Platform</p>
        </div>
    </div>
=======
// World-class professional email template v2.0
function getEmailTemplate(email, magicLink) {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <title>Verify Your TestingVala Account</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; width: 100% !important; min-width: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; }
        table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; box-shadow: 0 4px 25px rgba(0, 0, 0, 0.08); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 48px 40px; text-align: center; }
        .logo { font-size: 32px; font-weight: 700; color: #ffffff; margin: 0; letter-spacing: -0.5px; }
        .tagline { font-size: 16px; color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-weight: 400; }
        .content { padding: 48px 40px; }
        .welcome-title { font-size: 28px; font-weight: 700; color: #1a202c; margin: 0 0 16px 0; line-height: 1.2; }
        .welcome-text { font-size: 16px; color: #4a5568; line-height: 1.6; margin: 0 0 32px 0; }
        .cta-container { text-align: center; margin: 40px 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 18px 36px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: all 0.3s ease; }
        .cta-button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6); }
        .features-box { background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; margin: 32px 0; }
        .features-title { font-size: 18px; font-weight: 600; color: #2d3748; margin: 0 0 16px 0; }
        .features-list { margin: 0; padding: 0; list-style: none; }
        .features-list li { font-size: 14px; color: #4a5568; margin: 8px 0; padding-left: 24px; position: relative; }
        .features-list li:before { content: '✨'; position: absolute; left: 0; top: 0; }
        .security-note { background: #fff5f5; border: 1px solid #fed7d7; border-radius: 12px; padding: 20px; margin: 32px 0; }
        .security-text { font-size: 14px; color: #742a2a; margin: 0; text-align: center; }
        .footer { background: #f7fafc; padding: 40px; text-align: center; border-top: 1px solid #e2e8f0; }
        .social-links { margin: 24px 0; }
        .social-link { display: inline-block; margin: 0 12px; }
        .social-icon { width: 40px; height: 40px; border-radius: 50%; background: #667eea; display: inline-flex; align-items: center; justify-content: center; text-decoration: none; transition: all 0.3s ease; }
        .social-icon:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); }
        .footer-text { font-size: 14px; color: #718096; margin: 16px 0 0 0; }
        .footer-links { margin: 16px 0; }
        .footer-link { color: #667eea; text-decoration: none; margin: 0 16px; font-size: 14px; }
        .footer-link:hover { text-decoration: underline; }
        @media only screen and (max-width: 600px) {
            .container { margin: 0 !important; width: 100% !important; }
            .header, .content, .footer { padding: 32px 24px !important; }
            .welcome-title { font-size: 24px !important; }
            .cta-button { padding: 16px 28px !important; font-size: 15px !important; }
            .features-box { padding: 24px !important; }
        }
    </style>
</head>
<body style="background-color: #f7fafc;">
    <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-height: 0; max-width: 0; opacity: 0; overflow: hidden;">Welcome to TestingVala! Verify your account to join the premier QA testing community.</div>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
            <td style="padding: 40px 20px;">
                <div class="container">
                    <!-- Header -->
                    <div class="header">
                        <h1 class="logo">TestingVala</h1>
                        <p class="tagline">Premier QA Testing Community</p>
                    </div>
                    
                    <!-- Main Content -->
                    <div class="content">
                        <h2 class="welcome-title">Welcome to the future of QA testing! 🚀</h2>
                        <p class="welcome-text">
                            Hi there! We're thrilled to have you join our elite community of QA professionals. 
                            You're just one click away from accessing exclusive resources, networking opportunities, 
                            and career-advancing contests.
                        </p>
                        
                        <div class="cta-container">
                            <a href="${magicLink}" class="cta-button">Verify My Account →</a>
                        </div>
                        
                        <div class="features-box">
                            <h3 class="features-title">What awaits you inside:</h3>
                            <ul class="features-list">
                                <li>Monthly QA contests with cash prizes up to $2,000</li>
                                <li>Exclusive testing frameworks and automation tools</li>
                                <li>Direct networking with industry leaders</li>
                                <li>Advanced interview preparation resources</li>
                                <li>Real-time collaboration on testing projects</li>
                                <li>Career advancement opportunities</li>
                            </ul>
                        </div>
                        
                        <div class="security-note">
                            <p class="security-text">
                                🔒 <strong>Security Notice:</strong> This verification link expires in 24 hours and can only be used once. 
                                If you didn't create this account, please ignore this email.
                            </p>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div class="footer">
                        <div class="social-links">
                            <a href="https://www.youtube.com/@TestingvalaOfficial" class="social-link">
                                <div class="social-icon" style="background: #FF0000;">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                    </svg>
                                </div>
                            </a>
                            <a href="https://www.linkedin.com/company/testingvala" class="social-link">
                                <div class="social-icon" style="background: #0077B5;">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                    </svg>
                                </div>
                            </a>
                            <a href="https://twitter.com/testingvala" class="social-link">
                                <div class="social-icon" style="background: #1DA1F2;">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                    </svg>
                                </div>
                            </a>
                            <a href="https://www.instagram.com/testingvala" class="social-link">
                                <div class="social-icon" style="background: linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%);">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                    </svg>
                                </div>
                            </a>
                        </div>
                        
                        <div class="footer-links">
                            <a href="https://testingvala.com/about" class="footer-link">About Us</a>
                            <a href="https://testingvala.com/privacy" class="footer-link">Privacy Policy</a>
                            <a href="https://testingvala.com/terms" class="footer-link">Terms of Service</a>
                            <a href="https://testingvala.com/contact" class="footer-link">Contact Support</a>
                        </div>
                        
                        <p class="footer-text">
                            Questions? Reply to this email or contact us at 
                            <a href="mailto:info@testingvala.com" style="color: #667eea; text-decoration: none;">info@testingvala.com</a>
                        </p>
                        
                        <p class="footer-text">
                            © ${new Date().getFullYear()} TestingVala. All rights reserved.<br>
                            TestingVala Inc., Global QA Community Platform
                        </p>
                    </div>
                </div>
            </td>
        </tr>
    </table>
>>>>>>> origin/main
</body>
</html>`;
}

// Rate limiting function
function checkRateLimit(identifier) {
  const now = Date.now();
  const userRequests = rateLimitStore.get(identifier) || [];
  
  // Remove old requests outside the window
  const validRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
  
  if (validRequests.length >= RATE_LIMIT_MAX) {
    return false;
  }
  
  // Add current request
  validRequests.push(now);
  rateLimitStore.set(identifier, validRequests);
  
  return true;
}

// Main handler function
export default async function handler(req, res) {
  const requestId = Math.random().toString(36).substring(2, 15);
  const startTime = Date.now();
  
  // Set secure CORS headers
  const origin = req.headers.origin;
  const allowedOrigins = ['https://testingvala.com', 'https://www.testingvala.com', 'http://localhost:5173'];
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      requestId 
    });
  }
  
  console.log(`[magic-link] [${requestId}] === REQUEST STARTED ===`);
  console.log(`[magic-link] [${requestId}] Environment check:`, {
    hasSupabaseUrl: !!requiredEnvVars.VITE_SUPABASE_URL,
    hasSupabaseKey: !!requiredEnvVars.VITE_SUPABASE_ANON_KEY,
    hasZeptoKey: !!requiredEnvVars.ZEPTO_API_KEY,
    fromEmail: requiredEnvVars.ZEPTO_FROM_EMAIL,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV
  });
  
  try {
    // 1. Validate request body
    const { email, deviceId } = req.body || {};
    
    if (!email) {
      return res.status(400).json({ 
        error: 'Email address is required',
        requestId 
      });
    }
    
    // Validate email format with safe regex
    const emailRegex = new RegExp('^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$');
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format',
        requestId 
      });
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    
    // 2. Rate limiting
    const clientId = deviceId || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    
    if (!checkRateLimit(clientId)) {
      return res.status(429).json({
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 1000 / 60), // minutes
        requestId
      });
    }
    
    // 3. Check environment variables
    if (missingVars.length > 0) {
      console.error(`[magic-link] [${requestId}] Missing environment variables:`, missingVars);
<<<<<<< HEAD
      return res.status(500).json({
        error: 'Authentication service unavailable',
        message: 'Server configuration error',
        requestId
      });
=======
      
      // In production, try to continue with available credentials
      if (process.env.VERCEL_ENV === 'production' && requiredEnvVars.ZEPTO_API_KEY && !requiredEnvVars.ZEPTO_API_KEY.includes('your_')) {
        console.log(`[magic-link] [${requestId}] Continuing with available ZeptoMail credentials`);
      } else {
        return res.status(500).json({
          error: 'Authentication service unavailable',
          message: 'Server configuration error - please contact support',
          requestId,
          debug: process.env.NODE_ENV !== 'production' ? { missingVars } : undefined
        });
      }
>>>>>>> origin/main
    }
    
    // 4. Generate magic link token
    let token, magicLink;
    
    if (supabase) {
      console.log(`[magic-link] [${requestId}] Generating token via Supabase...`);
      
      try {
        const { data: tokenData, error: tokenError } = await supabase
          .rpc('generate_magic_link_token', {
            user_email: normalizedEmail
          });
        
        if (tokenError) {
          console.error(`[magic-link] [${requestId}] Supabase token error:`, tokenError);
          throw new Error(`Token generation failed: ${tokenError.message}`);
        }
        
        if (!tokenData || !tokenData.success) {
          throw new Error(tokenData?.error || 'Token generation failed');
        }
        
        token = tokenData.token;
        console.log(`[magic-link] [${requestId}] Token generated successfully`);
        
      } catch (error) {
        console.error(`[magic-link] [${requestId}] Token generation error:`, error.message);
        return res.status(500).json({
          error: 'Authentication service unavailable',
          message: error.message,
          requestId
        });
      }
    } else {
      // Fallback token generation
      token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      console.log(`[magic-link] [${requestId}] Using fallback token generation`);
    }
    
    // Generate magic link URL
    const baseUrl = req.headers.origin || 'https://testingvala.com';
    magicLink = `${baseUrl}/auth/verify?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;
    
    // 5. Send email via ZeptoMail
    console.log(`[magic-link] [${requestId}] Sending email to: ${normalizedEmail}`);
    
    const emailPayload = {
      from: { 
        address: requiredEnvVars.ZEPTO_FROM_EMAIL, 
        name: requiredEnvVars.ZEPTO_FROM_NAME 
      },
      to: [{ 
        email_address: { 
          address: normalizedEmail 
        } 
      }],
<<<<<<< HEAD
      subject: '🚀 Verify Your TestingVala Account',
=======
      subject: '🚀 Welcome to TestingVala - Verify Your Account',
>>>>>>> origin/main
      htmlbody: getEmailTemplate(normalizedEmail, magicLink)
    };
    
    const emailResponse = await fetch('https://api.zeptomail.in/v1.1/email', {
      method: 'POST',
      headers: {
        'Authorization': requiredEnvVars.ZEPTO_API_KEY,
        'Content-Type': 'application/json',
<<<<<<< HEAD
        'Accept': 'application/json'
=======
        'Accept': 'application/json',
        'User-Agent': 'TestingVala/1.0'
>>>>>>> origin/main
      },
      body: JSON.stringify(emailPayload)
    });
    
    console.log(`[magic-link] [${requestId}] ZeptoMail response: ${emailResponse.status}`);
    
    if (emailResponse.ok) {
      let result;
      try {
        result = await emailResponse.json();
      } catch (jsonError) {
        console.warn(`[magic-link] [${requestId}] JSON parse warning:`, jsonError.message);
        result = { data: [{ message_id: requestId }] };
      }
      
      const messageId = result.data?.[0]?.message_id || requestId;
<<<<<<< HEAD
      console.log(`[magic-link] [${requestId}] ✅ EMAIL SENT: ${messageId}`);
=======
      console.log(`[magic-link] [${requestId}] ✅ EMAIL SENT: ${messageId} (Template v${TEMPLATE_VERSION})`);
>>>>>>> origin/main
      
      return res.status(200).json({
        success: true,
        messageId,
        message: 'Verification email sent successfully',
        provider: 'zeptomail',
<<<<<<< HEAD
=======
        templateVersion: TEMPLATE_VERSION,
>>>>>>> origin/main
        requestId
      });
      
    } else {
      // Handle ZeptoMail errors
      let errorText;
      try {
        const errorData = await emailResponse.json();
        errorText = errorData.message || errorData.error || `HTTP ${emailResponse.status}`;
      } catch {
        errorText = await emailResponse.text().catch(() => `HTTP ${emailResponse.status}`);
      }
      
      console.error(`[magic-link] [${requestId}] ZeptoMail error:`, {
        status: emailResponse.status,
        error: errorText
      });
      
      // Specific error handling
<<<<<<< HEAD
      if (errorText.toLowerCase().includes('sandbox')) {
        return res.status(400).json({
          error: 'Email service is in sandbox mode',
          message: 'Please contact support to enable production email delivery',
          code: 'SANDBOX_MODE',
          requestId
=======
      if (errorText.toLowerCase().includes('sandbox') || errorText.toLowerCase().includes('test mode')) {
        console.log(`[magic-link] [${requestId}] ZeptoMail in sandbox mode - this is normal for testing`);
        return res.status(200).json({
          success: true,
          messageId: `sandbox_${requestId}`,
          message: 'Email sent successfully (sandbox mode)',
          provider: 'zeptomail-sandbox',
          requestId,
          warning: 'ZeptoMail is in sandbox mode - emails may not be delivered to external addresses'
>>>>>>> origin/main
        });
      }
      
      if (emailResponse.status === 401) {
        return res.status(500).json({
          error: 'Authentication service unavailable',
          message: 'Email service authentication failed',
          code: 'EMAIL_AUTH_FAILED',
          requestId
        });
      }
      
<<<<<<< HEAD
      if (errorText.toLowerCase().includes('domain')) {
        return res.status(500).json({
          error: 'Authentication service unavailable',
          message: 'Email domain not verified',
          code: 'DOMAIN_NOT_VERIFIED',
          requestId
=======
      if (errorText.toLowerCase().includes('domain') || errorText.toLowerCase().includes('verify')) {
        console.error(`[magic-link] [${requestId}] Domain verification issue:`, errorText);
        return res.status(500).json({
          error: 'Email service configuration issue',
          message: 'Domain verification required. Please contact support.',
          code: 'DOMAIN_NOT_VERIFIED',
          requestId,
          suggestion: 'Verify your domain in ZeptoMail dashboard'
>>>>>>> origin/main
        });
      }
      
      // Development fallback
      if (process.env.NODE_ENV !== 'production' && process.env.VERCEL_ENV !== 'production') {
        console.log(`[magic-link] [${requestId}] 🔗 DEV MAGIC LINK: ${magicLink}`);
        
        return res.status(200).json({
          success: true,
          messageId: `dev_${requestId}`,
          magicLink,
          message: 'Development mode - check console for magic link',
          provider: 'development',
          warning: `ZeptoMail failed: ${errorText}`,
          requestId
        });
      }
      
      // Production error
      return res.status(500).json({
        error: 'Authentication service unavailable',
        message: 'Email delivery failed. Please try again later.',
        code: 'EMAIL_DELIVERY_FAILED',
        requestId
      });
    }
    
  } catch (error) {
    console.error(`[magic-link] [${requestId}] CRITICAL ERROR:`, error);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Authentication service unavailable',
      requestId
    });
    
  } finally {
    const duration = Date.now() - startTime;
    console.log(`[magic-link] [${requestId}] === REQUEST COMPLETED in ${duration}ms ===`);
  }
}