import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the professional email template
const templatePath = path.join(__dirname, 'templates', 'professional-email.html');
const baseTemplate = fs.readFileSync(templatePath, 'utf8');

// Template replacement function
function replaceTemplateVars(template, variables) {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value || '');
  }
  // Remove unused template variables
  result = result.replace(/{{[^}]+}}/g, '');
  return result;
}

// Magic Link Email Template
export function getMagicLinkEmail(email, magicLink) {
  const variables = {
    subject: 'Sign in to TestingVala',
    preheader: 'Complete your sign-in to access your TestingVala account',
    icon: '🔐',
    title: 'Secure Sign-In',
    message: 'Welcome to TestingVala Professional Network! Click the button below to securely sign in to your account and access our QA excellence platform.',
    additional_content: 'This secure link will automatically sign you in without requiring a password.',
    cta_url: magicLink,
    cta_text: 'Sign In Securely',
    security_message: 'This link expires in 1 hour for your security. If you didn\'t request this sign-in, please ignore this email.'
  };
  
  return {
    subject: variables.subject,
    html: replaceTemplateVars(baseTemplate, variables)
  };
}

// Account Verification Email Template
export function getVerificationEmail(email, verificationLink) {
  const variables = {
    subject: 'Verify your TestingVala account',
    preheader: 'Complete your account setup by verifying your email address',
    icon: '✅',
    title: 'Verify Your Account',
    message: 'Thank you for joining TestingVala! To complete your account setup and start accessing our professional QA community, please verify your email address.',
    additional_content: 'Once verified, you\'ll have full access to contests, resources, and our global QA network.',
    cta_url: verificationLink,
    cta_text: 'Verify Email Address',
    security_message: 'This verification link expires in 24 hours. If you didn\'t create a TestingVala account, you can safely ignore this email.'
  };
  
  return {
    subject: variables.subject,
    html: replaceTemplateVars(baseTemplate, variables)
  };
}

// Password Reset Email Template
export function getPasswordResetEmail(email, resetLink) {
  const variables = {
    subject: 'Reset your TestingVala password',
    preheader: 'Reset your password to regain access to your account',
    icon: '🔑',
    title: 'Password Reset',
    message: 'We received a request to reset your TestingVala account password. Click the button below to create a new password.',
    additional_content: 'If you didn\'t request a password reset, your account is still secure and you can ignore this email.',
    cta_url: resetLink,
    cta_text: 'Reset Password',
    security_message: 'This reset link expires in 1 hour for security. Only use this link if you requested a password reset.'
  };
  
  return {
    subject: variables.subject,
    html: replaceTemplateVars(baseTemplate, variables)
  };
}

// Welcome Email Template
export function getWelcomeEmail(email, userName = '') {
  const variables = {
    subject: 'Welcome to TestingVala!',
    preheader: 'Your journey to QA excellence starts here',
    icon: '🎉',
    title: `Welcome${userName ? `, ${userName}` : ''}!`,
    message: 'Congratulations on joining TestingVala, the premier platform for QA professionals! You\'re now part of a global community dedicated to testing excellence.',
    additional_content: 'Explore our monthly contests, daily QA tips, and connect with fellow testing professionals worldwide.',
    cta_url: 'https://testingvala.com/dashboard',
    cta_text: 'Explore Platform',
    security_message: 'Your account is now active and secure. Start exploring our features and join the conversation!'
  };
  
  return {
    subject: variables.subject,
    html: replaceTemplateVars(baseTemplate, variables)
  };
}

// Contest Notification Email Template
export function getContestNotificationEmail(email, contestTitle, deadline) {
  const variables = {
    subject: `New Contest: ${contestTitle}`,
    preheader: 'Join our latest QA contest and win exciting prizes',
    icon: '🏆',
    title: 'New Contest Alert',
    message: `Exciting news! Our latest contest "${contestTitle}" is now live. Show off your QA skills and compete for amazing prizes.`,
    additional_content: `Submission deadline: ${deadline}. Don't miss this opportunity to showcase your expertise!`,
    cta_url: 'https://testingvala.com/contests',
    cta_text: 'Join Contest',
    security_message: 'Contest submissions are reviewed by our expert panel. Good luck!'
  };
  
  return {
    subject: variables.subject,
    html: replaceTemplateVars(baseTemplate, variables)
  };
}

// Test Email Template
export function getTestEmail(email) {
  const variables = {
    subject: 'TestingVala Email Service Test',
    preheader: 'Testing email delivery and template rendering',
    icon: '🧪',
    title: 'Email Test Successful',
    message: 'This is a test email to verify that our professional email template is working correctly with ZeptoMail.',
    additional_content: 'If you receive this email, the integration is functioning perfectly!',
    cta_url: 'https://testingvala.com',
    cta_text: 'Visit TestingVala',
    security_message: 'This is a diagnostic email sent for testing purposes only.'
  };
  
  return {
    subject: variables.subject,
    html: replaceTemplateVars(baseTemplate, variables)
  };
}