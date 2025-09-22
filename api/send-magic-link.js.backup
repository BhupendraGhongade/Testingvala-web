// PRODUCTION MAGIC LINK API - Bulletproof Implementation
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Rate limiting
const rateLimitStore = new Map();
const MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;

// Environment check
console.log('[send-magic-link] Environment check:', {
  hasZeptoKey: !!process.env.ZEPTO_API_KEY,
  hasSupabaseUrl: !!supabaseUrl,
  hasSupabaseKey: !!supabaseKey,
  nodeVersion: process.version
});

function getEmailTemplate(email, magicLink) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>TestingVala - Verify Your Email</title></head>
<body style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;max-width:600px;margin:0 auto;padding:20px;background-color:#f8fafc">
<div style="background:linear-gradient(135deg,#1e40af 0%,#3b82f6 100%);color:white;padding:40px 30px;text-align:center;border-radius:12px 12px 0 0;box-shadow:0 4px 6px rgba(0,0,0,0.1)">
<h1 style="margin:0;font-size:28px;font-weight:700">🚀 TestingVala</h1>
<p style="margin:10px 0 0 0;font-size:16px;opacity:0.9">Professional QA Testing Platform</p>
</div>
<div style="background:white;padding:40px 30px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;box-shadow:0 4px 6px rgba(0,0,0,0.1)">
<h2 style="color:#1e40af;margin:0 0 20px 0;font-size:24px;font-weight:600">Welcome to TestingVala! 🎉</h2>
<p style="color:#475569;font-size:16px;line-height:1.6;margin:0 0 20px 0">Hi there! We're excited to have you join our QA community. Click the button below to verify your email address and start exploring:</p>
<div style="text-align:center;margin:30px 0">
<a href="${magicLink}" style="background:linear-gradient(135deg,#1e40af 0%,#3b82f6 100%);color:white;padding:16px 32px;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;display:inline-block;box-shadow:0 4px 14px rgba(30,64,175,0.3);transition:all 0.3s ease">✨ Verify My Account</a>
</div>
<div style="background:#f1f5f9;padding:20px;border-radius:8px;margin:20px 0">
<p style="color:#64748b;font-size:14px;margin:0;text-align:center">💡 <strong>What's next?</strong> Access exclusive QA resources, join contests, and connect with testing professionals worldwide!</p>
</div>
<p style="color:#64748b;font-size:13px;margin:20px 0 0 0;text-align:center">This link expires in 24 hours for security. If you didn't request this, please ignore this email.</p>
</div>
<div style="text-align:center;padding:20px 0">
<div style="margin:0 0 15px 0">
<a href="https://www.instagram.com/testingvala" style="display:inline-block;margin:0 8px;text-decoration:none"><div style="width:32px;height:32px;background:linear-gradient(45deg,#f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%);border-radius:8px;display:inline-flex;align-items:center;justify-content:center"><span style="color:white;font-size:16px;font-weight:bold">📷</span></div></a>
<a href="https://www.youtube.com/@TestingvalaOfficial" style="display:inline-block;margin:0 8px;text-decoration:none"><div style="width:32px;height:32px;background:#FF0000;border-radius:8px;display:inline-flex;align-items:center;justify-content:center"><span style="color:white;font-size:16px;font-weight:bold">▶️</span></div></a>
<a href="https://twitter.com/testingvala" style="display:inline-block;margin:0 8px;text-decoration:none"><div style="width:32px;height:32px;background:#1DA1F2;border-radius:8px;display:inline-flex;align-items:center;justify-content:center"><span style="color:white;font-size:16px;font-weight:bold">🐦</span></div></a>
<a href="https://www.linkedin.com/company/testingvala" style="display:inline-block;margin:0 8px;text-decoration:none"><div style="width:32px;height:32px;background:#0077B5;border-radius:8px;display:inline-flex;align-items:center;justify-content:center"><span style="color:white;font-size:16px;font-weight:bold">💼</span></div></a>
</div>
<p style="color:#64748b;font-size:13px;margin:0 0 10px 0">📧 Questions? Email us at <a href="mailto:info@testingvala.com" style="color:#3b82f6;text-decoration:none;font-weight:600">info@testingvala.com</a></p>
<p style="color:#94a3b8;font-size:12px;margin:0">© ${new Date().getFullYear()} TestingVala • Professional QA Testing Platform</p>
<p style="color:#94a3b8;font-size:12px;margin:5px 0 0 0">🌐 <a href="https://testingvala.com" style="color:#3b82f6;text-decoration:none">testingvala.com</a></p>
</div>
</body></html>`;
}

export default async function handler(req, res) {
  const requestId = Math.random().toString(36).substring(2, 15);
  const startTime = Date.now();
  
  try {
    console.log(`[send-magic-link] [${requestId}] === REQUEST STARTED ===`);
    
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

    // Generate magic link token using Supabase
    let token, magicLink;
    
    if (supabase) {
      console.log(`[send-magic-link] [${requestId}] Generating token via Supabase`);
      
      try {
        const { data: tokenData, error: tokenError } = await supabase
          .rpc('generate_magic_link_token', {
            user_email: email.toLowerCase().trim()
          });
        
        if (tokenError) {
          console.error(`[send-magic-link] [${requestId}] Supabase token error:`, tokenError);
          throw new Error('Failed to generate authentication token');
        }
        
        if (!tokenData || !tokenData.success) {
          throw new Error(tokenData?.error || 'Token generation failed');
        }
        
        token = tokenData.token;
        magicLink = `${req.headers.origin || 'https://testingvala.com'}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;
        
        console.log(`[send-magic-link] [${requestId}] Token generated successfully`);
      } catch (error) {
        console.error(`[send-magic-link] [${requestId}] Token generation failed:`, error.message);
        throw new Error('Authentication service unavailable');
      }
    } else {
      // Fallback for development
      token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      magicLink = `${req.headers.origin || 'https://testingvala.com'}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;
      console.log(`[send-magic-link] [${requestId}] Using fallback token generation`);
    }

    // CRITICAL FIX: Check environment variables
    const zeptoApiKey = process.env.ZEPTO_API_KEY;
    const fromEmail = process.env.ZEPTO_FROM_EMAIL || 'info@testingvala.com';
    const fromName = process.env.ZEPTO_FROM_NAME || 'TestingVala';
    
    console.log(`[send-magic-link] [${requestId}] Environment check:`, {
      hasApiKey: !!zeptoApiKey,
      fromEmail,
      fromName
    });
    
    if (!zeptoApiKey) {
      console.error(`[send-magic-link] [${requestId}] ZEPTO_API_KEY not found in environment`);
      throw new Error('Email service not configured - ZEPTO_API_KEY missing');
    }

    // Send via ZeptoMail API
    const emailPayload = {
      from: { address: fromEmail, name: fromName },
      to: [{ email_address: { address: email } }],
      subject: '🚀 Verify Your TestingVala Account',
      htmlbody: getEmailTemplate(email, magicLink)
    };
    
    console.log(`[send-magic-link] [${requestId}] Sending email to:`, email);
    
    const emailResponse = await fetch('https://api.zeptomail.in/v1.1/email', {
      method: 'POST',
      headers: {
        'Authorization': zeptoApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    });

    console.log(`[send-magic-link] [${requestId}] ZeptoMail response:`, emailResponse.status);

    if (emailResponse.ok) {
      let result;
      try {
        result = await emailResponse.json();
      } catch (jsonError) {
        console.warn(`[send-magic-link] [${requestId}] JSON parse warning:`, jsonError.message);
        result = { data: [{ message_id: requestId }] };
      }
      
      console.log(`[send-magic-link] [${requestId}] ✅ EMAIL SENT:`, result.data?.[0]?.message_id);
      
      return res.status(200).json({
        success: true,
        messageId: result.data?.[0]?.message_id || requestId,
        message: 'Verification email sent successfully',
        provider: 'zeptomail-api'
      });
    } else {
      let errorText;
      try {
        errorText = await emailResponse.text();
      } catch (textError) {
        errorText = `HTTP ${emailResponse.status}`;
      }
      
      console.error(`[send-magic-link] [${requestId}] ZeptoMail error:`, {
        status: emailResponse.status,
        error: errorText
      });
      
      // Check for specific errors
      if (errorText.includes('sandbox')) {
        return res.status(400).json({
          error: 'Email service in sandbox mode. Please contact support.',
          code: 'SANDBOX_MODE',
          requestId
        });
      }
      
      if (emailResponse.status === 401) {
        return res.status(500).json({
          error: 'Email service authentication failed',
          code: 'AUTH_FAILED',
          requestId
        });
      }
      
      // Development fallback only in non-production
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[send-magic-link] [${requestId}] 🔗 DEV MAGIC LINK: ${magicLink}`);
        
        return res.status(200).json({
          success: true,
          messageId: `dev_${requestId}`,
          magicLink,
          message: 'Development mode - check console for magic link',
          provider: 'development',
          error: `ZeptoMail failed: ${errorText}`
        });
      }
      
      // Production error
      return res.status(500).json({
        error: 'Email delivery failed. Please try again.',
        code: 'EMAIL_FAILED',
        requestId
      });
    }

  } catch (error) {
    console.error(`[send-magic-link] [${requestId}] ERROR:`, error.message);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      requestId
    });
  }
}