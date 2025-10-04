// Simple API endpoint without external dependencies initially
const rateLimitStore = new Map();
const MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;

// Log environment variables
console.log('[send-magic-link] Environment check:', {
  hasNodemailer: typeof require !== 'undefined',
  hasZeptoKey: !!process.env.ZEPTO_API_KEY,
  hasSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
  nodeVersion: process.version
});

function getEmailTemplate(email, magicLink) {
  console.log('[send-magic-link] Generating email template for:', email.substring(0, 3) + '***');
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>TestingVala Verification</title></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
<div style="background:#1e40af;color:white;padding:30px;text-align:center;border-radius:10px 10px 0 0">
<h1 style="margin:0">🚀 TestingVala</h1>
<p style="margin:10px 0 0 0">Professional QA Platform</p>
</div>
<div style="background:white;padding:30px;border:1px solid #ddd;border-top:none;border-radius:0 0 10px 10px">
<h2 style="color:#1e40af">Verify Your Account</h2>
<p>Click below to verify your email and access TestingVala:</p>
<div style="text-align:center;margin:20px 0">
<a href="${magicLink}" style="background:#1e40af;color:white;padding:15px 30px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block">Verify Account</a>
</div>
<p style="font-size:12px;color:#666">Link expires in 24 hours. © ${new Date().getFullYear()} TestingVala</p>
</div></body></html>`;
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
    console.log(`[send-magic-link] [${requestId}] Headers:`, {
      origin: req.headers.origin,
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent']?.substring(0, 50)
    });
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');
    
    console.log(`[send-magic-link] [${requestId}] CORS headers set`);
    
    if (req.method === 'OPTIONS') {
      console.log(`[send-magic-link] [${requestId}] OPTIONS request - returning 200`);
      return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
      console.log(`[send-magic-link] [${requestId}] Invalid method: ${req.method}`);
      return res.status(405).json({ error: 'Method not allowed', method: req.method });
    }

    console.log(`[send-magic-link] [${requestId}] Parsing request body...`);
    const { email, deviceId } = req.body || {};
    
    console.log(`[send-magic-link] [${requestId}] Request data:`, {
      email: email ? email.substring(0, 3) + '***' + email.substring(email.indexOf('@')) : 'missing',
      deviceId: deviceId ? deviceId.substring(0, 8) + '...' : 'missing',
      bodyType: typeof req.body,
      bodyKeys: req.body ? Object.keys(req.body) : 'no body'
    });
    
    if (!email) {
      console.log(`[send-magic-link] [${requestId}] Email missing`);
      return res.status(400).json({ error: 'Email required', received: { email, deviceId } });
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log(`[send-magic-link] [${requestId}] Invalid email format: ${email}`);
      return res.status(400).json({ error: 'Invalid email format', email });
    }

    console.log(`[send-magic-link] [${requestId}] Email validation passed`);

    // Rate limiting
    const key = `${email}_${deviceId || 'unknown'}`;
    const now = Date.now();
    const stored = rateLimitStore.get(key);
    
    if (stored && (now - stored.firstRequest < RATE_LIMIT_WINDOW) && stored.count >= MAX_REQUESTS) {
      console.log(`[send-magic-link] [${requestId}] Rate limit exceeded for ${email}`);
      return res.status(429).json({ 
        error: `Rate limit exceeded. Try again after ${new Date(stored.firstRequest + RATE_LIMIT_WINDOW).toLocaleTimeString()}`,
        resetTime: new Date(stored.firstRequest + RATE_LIMIT_WINDOW)
      });
    }
    
    if (!stored || (now - stored.firstRequest > RATE_LIMIT_WINDOW)) {
      rateLimitStore.set(key, { count: 1, firstRequest: now });
    } else {
      stored.count++;
    }

    console.log(`[send-magic-link] [${requestId}] Rate limiting passed`);

    // Generate token and magic link
    console.log(`[send-magic-link] [${requestId}] Generating crypto token...`);
    
    let token;
    try {
      // Use built-in crypto if available, fallback to simple random
      if (typeof crypto !== 'undefined' && crypto.randomBytes) {
        token = crypto.randomBytes(32).toString('hex');
      } else {
        token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + Date.now().toString(36);
      }
      console.log(`[send-magic-link] [${requestId}] Token generated: ${token.substring(0, 8)}...`);
    } catch (cryptoError) {
      console.error(`[send-magic-link] [${requestId}] Crypto error:`, cryptoError.message);
      token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      console.log(`[send-magic-link] [${requestId}] Fallback token generated`);
    }
    
    const magicLink = `${req.headers.origin || 'https://testingvala.com'}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;
    console.log(`[send-magic-link] [${requestId}] Magic link generated`);

    // Try ZeptoMail API first (simpler than SMTP)
    console.log(`[send-magic-link] [${requestId}] Attempting ZeptoMail API...`);
    
    try {
      const emailPayload = {
        from: { address: 'info@testingvala.com', name: 'TestingVala' },
        to: [{ email_address: { address: email } }],
        subject: 'Verify Your TestingVala Account',
        htmlbody: getEmailTemplate(email, magicLink)
      };
      
      console.log(`[send-magic-link] [${requestId}] Email payload prepared`);
      
      const emailResponse = await fetch('https://api.zeptomail.in/v1.1/email', {
        method: 'POST',
        headers: {
          'Authorization': `Zoho-enczapikey ${process.env.ZEPTO_API_KEY || 'MISSING_API_KEY'}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailPayload)
      });

      console.log(`[send-magic-link] [${requestId}] ZeptoMail API response status: ${emailResponse.status}`);

      if (emailResponse.ok) {
        const result = await emailResponse.json();
        const duration = Date.now() - startTime;
        
        console.log(`[send-magic-link] [${requestId}] ✅ EMAIL SENT VIA ZEPTOMAIL API:`, {
          messageId: result.data?.[0]?.message_id,
          duration: `${duration}ms`
        });
        
        return res.status(200).json({
          success: true,
          messageId: result.data?.[0]?.message_id || requestId,
          message: 'Verification email sent successfully',
          provider: 'zeptomail-api',
          duration: `${duration}ms`
        });
      } else {
        const errorText = await emailResponse.text();
        console.error(`[send-magic-link] [${requestId}] ZeptoMail API error:`, {
          status: emailResponse.status,
          statusText: emailResponse.statusText,
          error: errorText
        });
        throw new Error(`ZeptoMail API error: ${emailResponse.status} - ${errorText}`);
      }
    } catch (apiError) {
      console.error(`[send-magic-link] [${requestId}] ZeptoMail API failed:`, apiError.message);
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
      duration: `${duration}ms`
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[send-magic-link] [${requestId}] ❌ CRITICAL ERROR:`, {
      message: error.message,
      stack: error.stack,
      duration: `${duration}ms`,
      name: error.name,
      cause: error.cause
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