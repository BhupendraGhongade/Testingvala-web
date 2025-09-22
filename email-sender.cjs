const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: 'smtp.zeptomail.in',
  port: 587,
  secure: false,
  auth: {
    user: 'emailapikey',
    pass: 'PHtE6r0IE7i/iDJ+oxED56e7Ec6lMN4nrL5gLwUVuY8XAqRRGU1Wr98pwWTiokx+AKFBQPPNwNo6se+bsOmGLG68PWlPCWqyqK3sx/VYSPOZsbq6x00Yt1UbckzVUYLtd9Zu1STUvdbSNA=='
  }
});

app.post('/send-email', async (req, res) => {
  const { email } = req.body;
  
  try {
    const result = await transporter.sendMail({
      from: 'info@testingvala.com',
      to: email,
      subject: 'TestingVala - Verify Your Email',
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto; background: white; border-radius: 8px;">
          <div style="background: linear-gradient(135deg, #0057B7, #004494); padding: 40px; text-align: center; color: white;">
            <h1 style="margin: 0;">🚀 TestingVala</h1>
            <p style="margin: 10px 0 0 0;">Enterprise QA Excellence Platform</p>
          </div>
          <div style="padding: 40px;">
            <h2>🔐 Account Verification Required</h2>
            <p>Welcome to TestingVala Professional Network! Click below to verify:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:5173/verified" style="background: #0057B7; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Verify Account & Access Platform
              </a>
            </div>
            <p style="font-size: 12px; color: #666;">Link expires in 24 hours. Real email via ZeptoMail!</p>
          </div>
        </div>
      `
    });
    
    console.log('✅ Real email sent:', result.messageId);
    res.json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error('❌ Email error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => console.log('📧 Real email server running on port 3001'));