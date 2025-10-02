import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { getMagicLinkEmail, getVerificationEmail, getTestEmail } from './email-templates.js';

dotenv.config();

const app = express();
app.use(express.json());

// ZeptoMail SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Webhook endpoint for magic link emails
app.post('/send-magic-link', async (req, res) => {
  try {
    const { email, magic_link, user_metadata } = req.body;
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
    console.error('Email send error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Test email endpoint
app.post('/send-test-email', async (req, res) => {
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
    res.json({ success: true, message: 'Professional test email sent' });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ error: 'Failed to send test email' });
  }
});

app.listen(3001, () => {
  console.log('Email service running on port 3001');
});