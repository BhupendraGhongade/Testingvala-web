import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { getMagicLinkEmail, getTestEmail } from './email-templates.js';

dotenv.config();

const app = express();
app.use(express.json());

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    status: 'Email service running',
    env: {
      smtp_host: process.env.SMTP_HOST,
      smtp_port: process.env.SMTP_PORT,
      from_email: process.env.FROM_EMAIL
    }
  });
});

// ZeptoMail SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Test email endpoint
app.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    const emailTemplate = getTestEmail(email);
    
    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Professional test email sent successfully' });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ error: 'Failed to send test email', details: error.message });
  }
});

// Magic link endpoint
app.post('/send-magic-link', async (req, res) => {
  try {
    const { email, magic_link } = req.body;
    const emailTemplate = getMagicLinkEmail(email, magic_link);

    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (error) {
    console.error('Magic link email error:', error);
    res.status(500).json({ error: 'Failed to send magic link email', details: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Email service running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/test`);
});