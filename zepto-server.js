import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import crypto from 'crypto';

const app = express();

// Fix CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Add request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// ZeptoMail transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.zeptomail.in',
  port: 587,
  secure: false,
  auth: {
    user: 'emailapikey',
    pass: 'PHtE6r0IE7i/iDJ+oxED56e7Ec6lMN4nrL5gLwUVuY8XAqRRGU1Wr98pwWTiokx+AKFBQPPNwNo6se+bsOmGLG68PWlPCWqyqK3sx/VYSPOZsbq6x00Yt1UbckzVUYLtd9Zu1STUvdbSNA=='
  }
});

// Store tokens in memory (use database in production)
const tokens = new Map();

// Send magic link
app.post('/api/send-magic-link', async (req, res) => {
  console.log('📧 Received email request:', req.body);
  
  const { email } = req.body;
  
  if (!email) {
    console.log('❌ No email provided');
    return res.status(400).json({ error: 'Email required' });
  }
  
  console.log('✅ Processing email:', email);

  try {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    
    // Store token
    tokens.set(token, { email, expiresAt });
    
    const magicLink = `http://localhost:5173/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;

    const mailOptions = {
      from: 'TestingVala <info@testingvala.com>',
      to: email,
      subject: 'Welcome to TestingVala - Verify Your Email',
      html: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial; padding: 20px; background: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #0057B7, #004494); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🚀 TestingVala</h1>
      <p style="color: #bfdbfe; margin: 10px 0 0 0;">Enterprise QA Excellence Platform</p>
    </div>
    <div style="padding: 40px;">
      <h2 style="color: #1f2937; margin: 0 0 20px 0;">🔐 Account Verification Required</h2>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px 0;">
        Welcome to TestingVala Professional Network! You're joining an exclusive community of senior QA engineers and test architects.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${magicLink}" style="display: inline-block; background: linear-gradient(135deg, #0057B7, #004494); color: white; text-decoration: none; padding: 18px 36px; border-radius: 12px; font-weight: bold; font-size: 18px;">
          🔐 Verify Account & Access Platform
        </a>
      </div>
      <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 30px 0;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #374151; font-weight: bold;">Can't click the button? Copy this link:</p>
        <p style="margin: 0; font-size: 12px; color: #6b7280; word-break: break-all; background: white; padding: 10px; border-radius: 4px;">${magicLink}</p>
      </div>
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 8px;">
        <p style="margin: 0; font-size: 14px; color: #1e40af;">🔒 <strong>Security:</strong> This link expires in 24 hours. Sent via ZeptoMail (no rate limits).</p>
      </div>
    </div>
    <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
      <p style="margin: 0; color: #6b7280; font-size: 14px;">© 2025 TestingVala - Enterprise QA Excellence Platform</p>
    </div>
  </div>
</body>
</html>`
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent via ZeptoMail:', result.messageId);
    
    res.json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error('❌ ZeptoMail error:', error.message);
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'ZeptoMail Server' });
});


// Verify token
app.post('/api/verify-token', (req, res) => {
  const { token, email } = req.body;
  
  if (!token || !email) {
    return res.status(400).json({ error: 'Token and email required' });
  }

  const tokenData = tokens.get(token);
  
  if (!tokenData) {
    return res.status(400).json({ error: 'Invalid token' });
  }
  
  if (Date.now() > tokenData.expiresAt) {
    tokens.delete(token);
    return res.status(400).json({ error: 'Token expired' });
  }
  
  if (tokenData.email !== email) {
    return res.status(400).json({ error: 'Email mismatch' });
  }
  
  // Token is valid, remove it
  tokens.delete(token);
  
  res.json({ success: true, email, message: 'Email verified successfully' });
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`🚀 ZeptoMail server running on http://localhost:${PORT}`);
  console.log('📧 Ready to send emails via ZeptoMail (no Supabase rate limits)');
});