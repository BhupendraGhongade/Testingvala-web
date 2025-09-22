// Check ZeptoMail configuration
const nodemailer = require('nodemailer');

async function checkZeptoConfig() {
  console.log('🔍 Checking ZeptoMail configuration...');
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.zeptomail.in',
    port: 587,
    secure: false,
    auth: {
      user: 'emailapikey',
      pass: 'PHtE6r0IE7i/iDJ+oxED56e7Ec6lMN4nrL5gLwUVuY8XAqRRGU1Wr98pwWTiokx+AKFBQPPNwNo6se+bsOmGLG68PWlPCWqyqK3sx/VYSPOZsbq6x00Yt1UbckzVUYLtd9Zu1STUvdbSNA=='
    }
  });

  try {
    console.log('📡 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful');
    
    console.log('📧 Sending test email...');
    const result = await transporter.sendMail({
      from: 'info@testingvala.com',
      to: 'tbryorkie@gmail.com',
      subject: 'TestingVala - Magic Link Verification',
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
              <a href="http://localhost:5173/auth/verify?token=test123&email=tbryorkie@gmail.com" style="background: #0057B7; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Verify Account & Access Platform
              </a>
            </div>
            <p style="font-size: 12px; color: #666;">This is a test email. ZeptoMail is working correctly!</p>
          </div>
        </div>
      `
    });
    
    console.log('✅ Email sent successfully!');
    console.log('📨 Message ID:', result.messageId);
    console.log('📬 Check your inbox (and spam folder)');
    
  } catch (error) {
    console.error('❌ ZeptoMail Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('🔑 Authentication failed - check your ZeptoMail credentials');
    } else if (error.code === 'ECONNECTION') {
      console.log('🌐 Connection failed - check internet/firewall');
    } else {
      console.log('🔧 Error details:', error);
    }
  }
}

checkZeptoConfig();