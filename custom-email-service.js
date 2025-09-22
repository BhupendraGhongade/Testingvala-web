// CUSTOM EMAIL SERVICE - BYPASS SUPABASE RATE LIMITS
// This sends emails directly via ZeptoMail without Supabase auth

import nodemailer from 'nodemailer';

// ZeptoMail configuration
const transporter = nodemailer.createTransporter({
  host: 'smtp.zeptomail.in',
  port: 587,
  secure: false,
  auth: {
    user: 'emailapikey',
    pass: 'PHtE6r0IE7i/iDJ+oxED56e7Ec6lMN4nrL5gLwUVuY8XAqRRGU1Wr98pwWTiokx+AKFBQPPNwNo6se+bsOmGLG68PWlPCWqyqK3sx/VYSPOZsbq6x00Yt1UbckzVUYLtd9Zu1STUvdbSNA=='
  }
});

// Generate magic link token
function generateMagicToken() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Send magic link email directly
export async function sendMagicLinkDirect(email) {
  try {
    const token = generateMagicToken();
    const magicLink = `http://localhost:5173/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;
    
    const mailOptions = {
      from: 'TestingVala <info@testingvala.com>',
      to: email,
      subject: 'Welcome to TestingVala - Verify Your Email',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial; padding: 20px; background: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #0057B7, #004494); padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0;">🚀 TestingVala</h1>
            </div>
            <div style="padding: 40px;">
              <h2>Verify Your Email</h2>
              <p>Click the button below to verify your email and join TestingVala:</p>
              <a href="${magicLink}" style="display: inline-block; background: #0057B7; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Verify Email
              </a>
              <p style="margin-top: 30px; font-size: 12px; color: #666;">
                This link expires in 24 hours. If you didn't request this, ignore this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    
    // Store token in database for verification
    // You'll need to implement token storage and verification
    
    return { success: true, token, messageId: result.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}

// Test the service
async function testEmailService() {
  try {
    const result = await sendMagicLinkDirect('test@example.com');
    console.log('Test successful:', result);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Uncomment to test
// testEmailService();