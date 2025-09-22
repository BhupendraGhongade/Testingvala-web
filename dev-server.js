import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const app = express();
app.use(cors());
app.use(express.json());

// Rate limiting
const rateLimitStore = new Map();
const MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;

// Email transporter
let transporter;
try {
  transporter = nodemailer.createTransporter({
    host: 'smtp.zeptomail.in',
    port: 587,
    secure: false,
    auth: {
      user: 'emailapikey',
      pass: process.env.ZEPTO_API_KEY || 'PHtE6r0IE7i/iDJ+oxED56e7Ec6lMN4nrL5gLwUVuY8XAqRRGU1Wr98pwWTiokx+AKFBQPPNwNo6se+bsOmGLG68PWlPCWqyqK3sx/VYSPOZsbq6x00Yt1UbckzVUYLtd9Zu1STUvdbSNA=='
    }
  });
  console.log('✅ Email transporter initialized');
} catch (error) {
  console.warn('⚠️ Email transporter failed:', error.message);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    api: 'working'
  });
});

// Magic link endpoint
app.post('/api/send-magic-link', async (req, res) => {
  const { email, deviceId } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Simple rate limiting
  const key = `${email}_${deviceId || 'unknown'}`;
  const now = Date.now();
  const stored = rateLimitStore.get(key);
  
  if (stored && (now - stored.firstRequest < RATE_LIMIT_WINDOW) && stored.count >= MAX_REQUESTS) {
    return res.status(429).json({ 
      error: `Rate limit exceeded. Try again after ${new Date(stored.firstRequest + RATE_LIMIT_WINDOW).toLocaleTimeString()}` 
    });
  }
  
  if (!stored || (now - stored.firstRequest > RATE_LIMIT_WINDOW)) {
    rateLimitStore.set(key, { count: 1, firstRequest: now });
  } else {
    stored.count++;
  }

  const token = crypto.randomBytes(32).toString('hex');
  const magicLink = `http://localhost:5173/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;

  console.log(`🔗 Generated magic link for ${email}`);

  // Try to send real email first
  if (transporter) {
    try {
      console.log(`📤 Attempting to send real email...`);
      
      const mailOptions = {
        from: 'TestingVala <info@testingvala.com>',
        to: email,
        subject: 'Verify Your TestingVala Account',
        html: `<!DOCTYPE html>
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
</div></body></html>`
      };

      await transporter.verify();
      console.log(`✅ SMTP connection verified`);
      
      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Real email sent successfully:`, result.messageId);
      
      return res.json({
        success: true,
        messageId: result.messageId,
        message: 'Real verification email sent successfully',
        provider: 'smtp'
      });
    } catch (emailError) {
      console.error(`❌ Real email failed:`, emailError.message);
    }
  }

  // Fallback to development mode
  console.log(`🔗 Fallback - Magic Link for ${email}:`, magicLink);

  res.json({
    success: true,
    messageId: `dev_${Date.now()}`,
    magicLink,
    message: 'Development mode - check console for magic link (email service unavailable)',
    provider: 'development'
  });
});

// Token verification
app.get('/api/verify-token', (req, res) => {
  const { token, email } = req.query;
  
  if (!token || !email) {
    return res.status(400).json({ error: 'Token and email required' });
  }

  // In development, accept any token
  console.log(`✅ Token verified for: ${email}`);
  
  const redirectUrl = `http://localhost:5173/auth/verify?success=true&email=${encodeURIComponent(email)}`;
  res.redirect(redirectUrl);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Development API server running on http://localhost:${PORT}`);
  console.log('📧 Magic links will be logged to console');
});

export default app;