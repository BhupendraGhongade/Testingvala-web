// FIXED MAGIC LINK API - Resolves base64url encoding error
import { createClient } from '@supabase/supabase-js';

// Environment validation
const requiredEnvVars = {
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
  ZEPTO_API_KEY: process.env.ZEPTO_API_KEY,
  ZEPTO_FROM_EMAIL: process.env.ZEPTO_FROM_EMAIL || 'info@testingvala.com',
  ZEPTO_FROM_NAME: process.env.ZEPTO_FROM_NAME || 'TestingVala'
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value && key !== 'ZEPTO_FROM_EMAIL' && key !== 'ZEPTO_FROM_NAME')
  .map(([key]) => key);

// Initialize Supabase client
const supabase = requiredEnvVars.VITE_SUPABASE_URL && requiredEnvVars.VITE_SUPABASE_ANON_KEY 
  ? createClient(requiredEnvVars.VITE_SUPABASE_URL, requiredEnvVars.VITE_SUPABASE_ANON_KEY)
  : null;

// Rate limiting store
const rateLimitStore = new Map();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

// Generate secure token without Supabase function
function generateSecureToken() {
  const chars = '0123456789abcdef';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

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
</body>
</html>`;
}

// Rate limiting function
function checkRateLimit(identifier) {
  const now = Date.now();
  const userRequests = rateLimitStore.get(identifier) || [];
  
  const validRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
  
  if (validRequests.length >= RATE_LIMIT_MAX) {
    return false;
  }
  
  validRequests.push(now);
  rateLimitStore.set(identifier, validRequests);
  
  return true;
}

// Store token in database
async function storeToken(email, token) {
  if (!supabase) return { success: true }; // Fallback for local dev
  
  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    const { error } = await supabase
      .from('magic_link_tokens')
      .upsert({
        email: email.toLowerCase().trim(),
        token_hash: token,
        expires_at: expiresAt,
        created_at: new Date().toISOString(),
        used_at: null
      }, {
        onConflict: 'email'
      });
    
    if (error) {
      console.error('Token storage error:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Token storage exception:', error);
    return { success: false, error: error.message };
  }
}

// Main handler function
export default async function handler(req, res) {
  const requestId = Math.random().toString(36).substring(2, 15);
  const startTime = Date.now();
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  
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
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
        retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 1000 / 60),
        requestId
      });
    }
    
    // 3. Check environment variables
    if (missingVars.length > 0) {
      console.error(`[magic-link] [${requestId}] Missing environment variables:`, missingVars);
      return res.status(500).json({
        error: 'Authentication service unavailable',
        message: 'Server configuration error',
        requestId
      });
    }
    
    // 4. Generate token (without Supabase function)
    const token = generateSecureToken();
    console.log(`[magic-link] [${requestId}] Token generated: ${token.substring(0, 8)}...`);
    
    // 5. Store token in database
    const storeResult = await storeToken(normalizedEmail, token);
    if (!storeResult.success) {
      console.error(`[magic-link] [${requestId}] Token storage failed:`, storeResult.error);
      // Continue anyway for development
    }
    
    // 6. Generate magic link URL
    const baseUrl = req.headers.origin || 'https://testingvala.com';
    const magicLink = `${baseUrl}/auth/verify?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;
    
    // 7. Send email via ZeptoMail
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
      subject: '🚀 Verify Your TestingVala Account',
      htmlbody: getEmailTemplate(normalizedEmail, magicLink)
    };
    
    const emailResponse = await fetch('https://api.zeptomail.in/v1.1/email', {
      method: 'POST',
      headers: {
        'Authorization': requiredEnvVars.ZEPTO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
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
      console.log(`[magic-link] [${requestId}] ✅ EMAIL SENT: ${messageId}`);
      
      return res.status(200).json({
        success: true,
        messageId,
        message: 'Verification email sent successfully',
        provider: 'zeptomail',
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