// Direct ZeptoMail email sending - Run this to test real email
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.zeptomail.in',
  port: 587,
  secure: false,
  auth: {
    user: 'emailapikey',
    pass: 'PHtE6r0IE7i/iDJ+oxED56e7Ec6lMN4nrL5gLwUVuY8XAqRRGU1Wr98pwWTiokx+AKFBQPPNwNo6se+bsOmGLG68PWlPCWqyqK3sx/VYSPOZsbq6x00Yt1UbckzVUYLtd9Zu1STUvdbSNA=='
  }
});

async function sendTestEmail(toEmail) {
  try {
    const result = await transporter.sendMail({
      from: 'TestingVala <info@testingvala.com>',
      to: toEmail,
      subject: 'TestingVala - Email Test',
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto; background: white; border-radius: 8px;">
          <div style="background: linear-gradient(135deg, #0057B7, #004494); padding: 40px; text-align: center; color: white;">
            <h1 style="margin: 0;">🚀 TestingVala</h1>
            <p style="margin: 10px 0 0 0;">Email Test Successful!</p>
          </div>
          <div style="padding: 40px;">
            <h2>✅ ZeptoMail is Working!</h2>
            <p>This email was sent directly via ZeptoMail SMTP.</p>
            <p>Your email configuration is correct.</p>
          </div>
        </div>
      `
    });
    
    console.log('✅ Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Email failed:', error.message);
    throw error;
  }
}

// Test with your email
sendTestEmail('tbryorkie@gmail.com')
  .then(() => console.log('Test complete'))
  .catch(err => console.error('Test failed:', err));