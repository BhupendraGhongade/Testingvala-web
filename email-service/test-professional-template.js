import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { getMagicLinkEmail, getTestEmail, getVerificationEmail, getWelcomeEmail } from './email-templates.js';

dotenv.config();

const transporter = nodemailer.createTransporter({
  host: 'smtp.zeptomail.in',
  port: 587,
  secure: false,
  auth: {
    user: 'emailapikey',
    pass: process.env.SMTP_PASS
  }
});

async function testProfessionalTemplates() {
  const testEmail = 'bghongade@gmail.com';
  
  console.log('🚀 Testing Professional Email Templates...\n');

  try {
    // Test 1: Magic Link Email
    console.log('📧 Test 1: Magic Link Email');
    const magicLinkTemplate = getMagicLinkEmail(testEmail, 'https://testingvala.com/auth/callback?token=test123');
    
    await transporter.sendMail({
      from: 'TestingVala <info@testingvala.com>',
      to: testEmail,
      subject: magicLinkTemplate.subject,
      html: magicLinkTemplate.html
    });
    console.log('✅ Magic link email sent successfully\n');

    // Test 2: Test Email
    console.log('📧 Test 2: Professional Test Email');
    const testTemplate = getTestEmail(testEmail);
    
    await transporter.sendMail({
      from: 'TestingVala <info@testingvala.com>',
      to: testEmail,
      subject: testTemplate.subject,
      html: testTemplate.html
    });
    console.log('✅ Test email sent successfully\n');

    // Test 3: Verification Email
    console.log('📧 Test 3: Account Verification Email');
    const verificationTemplate = getVerificationEmail(testEmail, 'https://testingvala.com/verify?token=verify123');
    
    await transporter.sendMail({
      from: 'TestingVala <info@testingvala.com>',
      to: testEmail,
      subject: verificationTemplate.subject,
      html: verificationTemplate.html
    });
    console.log('✅ Verification email sent successfully\n');

    // Test 4: Welcome Email
    console.log('📧 Test 4: Welcome Email');
    const welcomeTemplate = getWelcomeEmail(testEmail, 'QA Professional');
    
    await transporter.sendMail({
      from: 'TestingVala <info@testingvala.com>',
      to: testEmail,
      subject: welcomeTemplate.subject,
      html: welcomeTemplate.html
    });
    console.log('✅ Welcome email sent successfully\n');

    console.log('🎉 ALL PROFESSIONAL TEMPLATES TESTED SUCCESSFULLY!');
    console.log('📬 Check your email inbox for 4 professional emails');
    console.log('📱 Templates are optimized for mobile, desktop, Gmail, Outlook, and Apple Mail');
    
  } catch (error) {
    console.error('❌ Template test failed:', error.message);
  }
}

testProfessionalTemplates();