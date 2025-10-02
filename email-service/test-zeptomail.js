import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Test ZeptoMail configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.zeptomail.in',
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
    console.log('Host:', process.env.SMTP_HOST);
    console.log('Port:', process.env.SMTP_PORT);
    console.log('From:', process.env.FROM_EMAIL);
    
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection successful');
    
  } catch (error) {
    console.error('❌ ZeptoMail test failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('Authentication failed - check your API key');
    } else if (error.code === 'ECONNECTION') {
      console.log('Connection failed - check host and port');
    } else if (error.responseCode === 535) {
      console.log('Authentication failed - invalid credentials');
    }
  }
}

testZeptoMail();