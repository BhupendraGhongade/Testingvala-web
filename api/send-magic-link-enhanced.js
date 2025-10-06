import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Rate limiting
const rateLimitStore = new Map();
const MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;

// Log environment variables
console.log('[send-magic-link] Environment check:', {
  hasZeptoKey: !!process.env.ZEPTO_API_KEY,
  hasSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
  hasSupabaseKey: !!process.env.VITE_SUPABASE_ANON_KEY,
  nodeVersion: process.version
});

// Professional email template
function getEmailTemplate(email, magicLink) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TestingVala Verification</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 40px 30px; text-align: center; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 8px; }
        .tagline { font-size: 16px; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .title { font-size: 24px; color: #1e40af; margin-bottom: 20px; font-weight: 600; }
        .message { font-size: 16px; color: #4b5563; margin-bottom: 30px; line-height: 1.7; }
        .cta-container { text-align: center; margin: 40px 0; }
        .cta-button { 
            display: inline-block; 
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); 
            color: white; 
            padding: 16px 32px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: 600; 
            font-size: 16px;
            box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
        }
        .security-info { background: #f8fafc; border-left: 4px solid #1e40af; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0; }
        .security-title { font-weight: 600; color: #1e40af; margin-bottom: 8px; }
        .security-text { font-size: 14px; color: #64748b; }
        .footer { background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer-text { font-size: 14px; color: #64748b; margin-bottom: 15px; }
        @media (max-width: 600px) {
            .header, .content, .footer { padding: 30px 20px; }
            .title { font-size: 20px; }
            .cta-button { padding: 14px 28px; font-size: 15px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🚀 TestingVala</div>
            <div class="tagline">Professional QA Community Platform</div>
        </div>
        
        <div class="content">
            <h1 class="title">Verify Your Account</h1>
            
            <p class="message">
                Welcome to TestingVala! We're excited to have you join our community of QA professionals. 
                To complete your registration and access all features, please verify your email address.
            </p>
            
            <div class="cta-container">
                <a href="${magicLink}" class="cta-button">Verify My Account</a>
            </div>
            
            <div class="security-info">
                <div class="security-title">🔒 Security Information</div>
                <div class="security-text">
                    This verification link is valid for 24 hours and can only be used once. 
                    If you didn't request this verification, please ignore this email.
                </div>
            </div>
            
            <p style="font-size: 14px; color: #64748b; text-align: center; margin-top: 30px;">
                Having trouble with the button? Copy and paste this link into your browser:<br>
                <a href="${magicLink}" style="color: #1e40af; word-break: break-all;">${magicLink}</a>
            </p>
        </div>
        
        <div class="footer">
            <p class="footer-text">
                © ${new Date().getFullYear()} TestingVala. All rights reserved.
            </p>
            <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
                TestingVala - Building the future of QA professionals worldwide
            </p>
        </div>
    </div>
</body>
</html>`;
}

// Clean up expired rate limit entries
function cleanupRateLimit() {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.firstRequest > RATE_LIMIT_WINDOW) {
      rateLimitStore.delete(key);
    }
  }
}

// Check rate limiting
function checkRateLimit(email, deviceId, ip) {
  cleanupRateLimit();
  
  const key = `${email}_${deviceId}_${ip}`;
  const now = Date.now();
  const stored = rateLimitStore.get(key);
  
  if (!stored) {
    rateLimitStore.set(key, {
      count: 1,
      firstRequest: now,
      lastRequest: now
    });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }
  
  // Reset if window expired
  if (now - stored.firstRequest > RATE_LIMIT_WINDOW) {
    rateLimitStore.set(key, {
      count: 1,
      firstRequest: now,
      lastRequest: now
    });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }
  
  // Check if limit exceeded
  if (stored.count >= MAX_REQUESTS) {
    const resetTime = new Date(stored.firstRequest + RATE_LIMIT_WINDOW);
    return { 
      allowed: false, 
      remaining: 0,
      resetTime,
      message: `Rate limit exceeded. Try again after ${resetTime.toLocaleTimeString()}`
    };
  }
  
  // Increment counter
  stored.count += 1;
  stored.lastRequest = now;
  rateLimitStore.set(key, stored);
  
  return { allowed: true, remaining: MAX_REQUESTS - stored.count };
}

export default async function handler(req, res) {
  const requestId = Math.random().toString(36).substring(2, 15);
  const startTime = Date.now();
  
  try {
    console.log(`[send-magic-link] [${requestId}] === REQUEST STARTED ===`);
    console.log(`[send-magic-link] [${requestId}] Method: ${req.method}`);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, deviceId } = req.body || {};
    
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Rate limiting
    const rateCheck = checkRateLimit(email, deviceId || 'unknown', req.headers['x-forwarded-for'] || 'unknown');
    if (!rateCheck.allowed) {
      return res.status(429).json({ 
        error: rateCheck.message,
        resetTime: rateCheck.resetTime
      });
    }

    // Generate magic link token using Supabase
    console.log(`[send-magic-link] [${requestId}] Generating magic link token via Supabase...`);
    
    let tokenData;
    try {
      const { data, error } = await supabase.rpc('generate_magic_link_token', {
        user_email: email
      });
      
      if (error) {
        console.error(`[send-magic-link] [${requestId}] Supabase token generation error:`, error);
        throw new Error(`Token generation failed: ${error.message}`);
      }
      
      tokenData = data;
      console.log(`[send-magic-link] [${requestId}] Token generated via Supabase:`, {
        token: tokenData.token.substring(0, 8) + '...',
        expires_at: tokenData.expires_at,
        user_id: tokenData.user_id
      });
    } catch (supabaseError) {
      console.error(`[send-magic-link] [${requestId}] Supabase error:`, supabaseError.message);
      // Fallback to simple token generation for development
      const fallbackToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
      tokenData = {
        token: fallbackToken,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        email: email
      };
      console.log(`[send-magic-link] [${requestId}] Using fallback token generation`);
    }
    
    const magicLink = `${req.headers.origin || 'https://testingvala.com'}/auth/verify?token=${tokenData.token}&email=${encodeURIComponent(email)}`;
    console.log(`[send-magic-link] [${requestId}] Magic link generated`);

    // Send email via ZeptoMail API
    console.log(`[send-magic-link] [${requestId}] Sending email via ZeptoMail API...`);
    
    const zeptoApiKey = process.env.ZEPTO_API_KEY;
    const fromEmail = process.env.ZEPTO_FROM_EMAIL || 'info@testingvala.com';
    const fromName = process.env.ZEPTO_FROM_NAME || 'TestingVala';
    
    if (!zeptoApiKey) {
      console.warn(`[send-magic-link] [${requestId}] ZeptoMail API key not configured`);
      throw new Error('Email service not configured');
    }
    
    try {
      const emailPayload = {
        from: { 
          address: fromEmail, 
          name: fromName 
        },
        to: [{ 
          email_address: { 
            address: email,
            name: email.split('@')[0]
          } 
        }],
        subject: '🚀 Verify Your TestingVala Account',
        htmlbody: getEmailTemplate(email, magicLink),
        track_opens: true,
        track_clicks: true
      };
      
      console.log(`[send-magic-link] [${requestId}] Email payload prepared for:`, {
        to: email,
        from: fromEmail,
        hasHtml: !!emailPayload.htmlbody
      });
      
      const emailResponse = await fetch('https://api.zeptomail.in/v1.1/email', {
        method: 'POST',
        headers: {
          'Authorization': zeptoApiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(emailPayload)
      });

      console.log(`[send-magic-link] [${requestId}] ZeptoMail API response:`, {
        status: emailResponse.status,
        statusText: emailResponse.statusText
      });

      if (emailResponse.ok) {
        const result = await emailResponse.json();
        const duration = Date.now() - startTime;
        
        console.log(`[send-magic-link] [${requestId}] ✅ EMAIL SENT SUCCESSFULLY:`, {
          messageId: result.data?.[0]?.message_id,
          code: result.data?.[0]?.code,
          duration: `${duration}ms`,
          provider: 'zeptomail-api'
        });
        
        return res.status(200).json({
          success: true,
          messageId: result.data?.[0]?.message_id || requestId,
          message: 'Verification email sent successfully',
          provider: 'zeptomail-api',
          duration: `${duration}ms`,
          email: email
        });
      } else {
        const errorText = await emailResponse.text();
        console.error(`[send-magic-link] [${requestId}] ZeptoMail API error:`, {
          status: emailResponse.status,
          statusText: emailResponse.statusText,
          error: errorText
        });
        
        // Parse error for better user feedback
        let errorMessage = 'Email delivery failed';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error_description || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(`ZeptoMail API error: ${emailResponse.status} - ${errorMessage}`);
      }
    } catch (apiError) {
      console.error(`[send-magic-link] [${requestId}] ZeptoMail API failed:`, {
        message: apiError.message,
        stack: apiError.stack?.split('\n')[0]
      });
      
      // Don't fallback to development mode in production
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Email delivery service temporarily unavailable. Please try again later.');
      }
      
      // Development fallback
      console.log(`[send-magic-link] [${requestId}] Using development fallback`);
    }

    // Development fallback - return magic link
    console.log(`[send-magic-link] [${requestId}] Using development fallback`);
    console.log(`[send-magic-link] [${requestId}] 🔗 MAGIC LINK: ${magicLink}`);
    
    const duration = Date.now() - startTime;
    return res.status(200).json({
      success: true,
      messageId: `dev_${requestId}`,
      magicLink,
      message: 'Development mode - check console for magic link',
      provider: 'development',
      duration: `${duration}ms`,
      token: tokenData.token,
      expires_at: tokenData.expires_at
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[send-magic-link] [${requestId}] ❌ CRITICAL ERROR:`, {
      message: error.message,
      stack: error.stack,
      duration: `${duration}ms`
    });
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      requestId,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
  }
}