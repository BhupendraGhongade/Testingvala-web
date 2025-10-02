import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.zeptomail.in',
  port: 587,
  secure: false,
  auth: {
    user: 'emailapikey',
    pass: process.env.SMTP_PASS
  }
});

async function sendTestEmail() {
  try {
    console.log('Sending test email...');
    
    const result = await transporter.sendMail({
      from: 'TestingVala <info@testingvala.com>',
      to: 'bghongade@gmail.com', // Replace with your email
      subject: 'Test Email - Magic Link Setup',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>🚀 Test Email from TestingVala</h2>
          <p>This is a test email to verify ZeptoMail is working correctly.</p>
          <p>If you receive this email, the SMTP configuration is working!</p>
          <p>Time sent: ${new Date().toISOString()}</p>
        </div>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('Check your email inbox and spam folder.');
    
  } catch (error) {
    console.error('❌ Failed to send test email:', error.message);
  }
}

sendTestEmail();