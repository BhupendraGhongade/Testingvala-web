import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Test 1: ZeptoMail SMTP Connection
async function testSMTPConnection() {
  console.log('🔍 Test 1: SMTP Connection');
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.zeptomail.in',
      port: 587,
      secure: false,
      auth: {
        user: 'emailapikey',
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.verify();
    console.log('✅ SMTP connection successful');
    return true;
  } catch (error) {
    console.log('❌ SMTP connection failed:', error.message);
    return false;
  }
}

// Test 2: Send actual email
async function testEmailDelivery() {
  console.log('\n🔍 Test 2: Email Delivery');
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.zeptomail.in',
      port: 587,
      secure: false,
      auth: {
        user: 'emailapikey',
        pass: process.env.SMTP_PASS
      }
    });

    const result = await transporter.sendMail({
      from: 'TestingVala <info@testingvala.com>',
      to: 'bghongade@gmail.com', // Your email
      subject: 'Magic Link Test - ' + new Date().toISOString(),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>🔧 Magic Link Diagnostic Test</h2>
          <p>This email confirms ZeptoMail is working correctly.</p>
          <p><strong>Test Time:</strong> ${new Date().toISOString()}</p>
          <p><strong>From:</strong> info@testingvala.com</p>
          <p><strong>SMTP Host:</strong> smtp.zeptomail.in</p>
          <p>If you receive this, the issue is NOT with ZeptoMail configuration.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            This is a diagnostic email for TestingVala magic link troubleshooting.
          </p>
        </div>
      `
    });

    console.log('✅ Email sent successfully');
    console.log('📧 Message ID:', result.messageId);
    console.log('📬 Check your email: bghongade@gmail.com');
    return true;
  } catch (error) {
    console.log('❌ Email delivery failed:', error.message);
    return false;
  }
}

// Test 3: Supabase Auth API
async function testSupabaseAuth() {
  console.log('\n🔍 Test 3: Supabase Auth API');
  try {
    const response = await fetch('https://qxsardezvxsquvejvsso.supabase.co/auth/v1/otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.VITE_SUPABASE_ANON_KEY || 'MISSING_SUPABASE_KEY',
        'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY || 'MISSING_SUPABASE_KEY'}`
      },
      body: JSON.stringify({
        email: 'bghongade@gmail.com',
        create_user: true,
        gotrue_meta_security: {}
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Supabase auth API working');
      console.log('📧 Magic link should be sent to: bghongade@gmail.com');
      return true;
    } else {
      console.log('❌ Supabase auth API failed');
      console.log('Status:', response.status);
      console.log('Error:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Supabase test failed:', error.message);
    return false;
  }
}

// Run all tests
async function runDiagnostics() {
  console.log('🚀 Starting Magic Link Diagnostics...\n');
  
  const results = {
    smtp: await testSMTPConnection(),
    email: await testEmailDelivery(),
    supabase: await testSupabaseAuth()
  };

  console.log('\n📊 DIAGNOSTIC RESULTS:');
  console.log('='.repeat(50));
  console.log(`SMTP Connection: ${results.smtp ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Email Delivery: ${results.email ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Supabase Auth: ${results.supabase ? '✅ PASS' : '❌ FAIL'}`);
  console.log('='.repeat(50));

  if (results.smtp && results.email && results.supabase) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ Magic link should work now');
    console.log('📧 Check your email for both test email and magic link');
  } else {
    console.log('\n⚠️  ISSUES FOUND:');
    if (!results.smtp) console.log('- SMTP connection failed - check ZeptoMail credentials');
    if (!results.email) console.log('- Email delivery failed - check domain verification');
    if (!results.supabase) console.log('- Supabase auth failed - check API configuration');
  }

  console.log('\n🔍 NEXT STEPS:');
  console.log('1. Check your email inbox AND spam folder');
  console.log('2. If no emails arrive, the issue is ZeptoMail sandbox mode');
  console.log('3. If test email arrives but magic link doesn\'t, check Supabase SMTP settings');
  console.log('4. Verify ZeptoMail domain is fully verified (not in sandbox)');
}

runDiagnostics();