// Fallback email service using multiple providers
import crypto from 'crypto';

// Simple email service using fetch (works with Resend, SendGrid, etc.)
async function sendEmailWithResend(email, magicLink, requestId) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'TestingVala <noreply@testingvala.com>',
      to: email,
      subject: 'Verify Your TestingVala Account',
      html: getProfessionalTemplate(email, magicLink)
    })
  });
  
  if (!response.ok) {
    throw new Error(`Resend API error: ${response.status}`);
  }
  
  return await response.json();
}

// Simple SMTP-free email template
function getProfessionalTemplate(email, magicLink) {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your TestingVala Account</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">🚀 TestingVala</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Professional QA Excellence Platform</p>
    </div>
    
    <div style="background: white; padding: 40px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: #fbbf24; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 20px; line-height: 60px; font-size: 24px;">🔐</div>
            <h2 style="color: #1e40af; margin: 0;">Account Verification Required</h2>
        </div>
        
        <p>Welcome to TestingVala! Click the button below to verify your email address and access our platform:</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${magicLink}" style="background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Verify Account & Sign In
            </a>
        </div>
        
        <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #0369a1;">
                <strong>🔒 Security Notice:</strong> This link expires in 24 hours. If you didn't create a TestingVala account, you can safely ignore this email.
            </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <div style="text-align: center; color: #666; font-size: 12px;">
            <p>TestingVala - Professional QA Excellence Platform</p>
            <p>© ${new Date().getFullYear()} TestingVala. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
}

export default async function handler(req, res) {
  const requestId = Math.random().toString(36).substring(2, 15);
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  try {
    const token = crypto.randomBytes(32).toString('hex');
    const magicLink = `${req.headers.origin || 'https://testingvala.com'}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;

    console.log(`📧 [${requestId}] Sending fallback email to:`, email);

    // Try Resend first (if API key is available)
    if (process.env.RESEND_API_KEY) {
      const result = await sendEmailWithResend(email, magicLink, requestId);
      console.log(`✅ [${requestId}] Email sent via Resend:`, result.id);
      
      return res.status(200).json({
        success: true,
        messageId: result.id,
        provider: 'resend',
        requestId
      });
    }

    // Fallback: Return success with instructions (for development)
    console.log(`⚠️ [${requestId}] No email provider configured, returning mock success`);
    
    return res.status(200).json({
      success: true,
      messageId: `mock_${requestId}`,
      provider: 'mock',
      requestId,
      magicLink, // Include for development testing
      message: 'Email would be sent in production'
    });

  } catch (error) {
    console.error(`❌ [${requestId}] Fallback email failed:`, error);
    
    return res.status(500).json({
      error: 'Failed to send verification email',
      requestId,
      details: error.message
    });
  }
}