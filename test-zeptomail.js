import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Test ZeptoMail configuration
const transporter = nodemailer.createTransporter({
  host: 'smtp.zeptomail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'emailapikey',
    pass: process.env.SMTP_PASS
  }
});

async function testZeptoMail() {
  try {
    console.log('Testing ZeptoMail connection...');
    
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection successful');
    
    // Send test email
    const result = await transporter.sendMail({
      from: 'TestingVala <info@testingvala.com>',
      to: 'test@example.com', // Replace with your email
      subject: 'ZeptoMail Test',
      html: '<h2>Test successful!</h2><p>ZeptoMail is working correctly.</p>'
    });
    
    console.log('✅ Test email sent:', result.messageId);
    
  } catch (error) {
    console.error('❌ ZeptoMail test failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('Authentication failed - check your API key');
    } else if (error.code === 'ECONNECTION') {
      console.log('Connection failed - check host and port');
    }
  }
}

testZeptoMail();