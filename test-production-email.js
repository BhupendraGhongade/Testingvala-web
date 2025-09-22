#!/usr/bin/env node

// Test script for production email system
const testEmail = process.argv[2] || 'test@example.com';

console.log('🧪 Testing production email system...');
console.log(`📧 Test email: ${testEmail}`);

fetch('https://testingvala.com/api/send-magic-link', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: testEmail,
    deviceId: 'test-device'
  })
})
.then(response => response.json())
.then(data => {
  console.log('📊 Response:', data);
  
  if (data.success) {
    console.log('✅ Email sent successfully!');
    console.log(`📨 Message ID: ${data.messageId}`);
  } else {
    console.log('❌ Email failed:', data.error);
    console.log(`🔍 Request ID: ${data.requestId}`);
  }
})
.catch(error => {
  console.error('❌ Test failed:', error.message);
});
