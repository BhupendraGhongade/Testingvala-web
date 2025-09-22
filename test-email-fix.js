// Test the complete email flow
async function testEmailFlow() {
  console.log('🧪 Testing Complete Email Flow...\n');

  try {
    // Test the API endpoint
    console.log('📧 Testing API endpoint...');
    const response = await fetch('http://localhost:3000/api/send-magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bghongade@gmail.com' })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ API Response:', result);

    console.log('\n🎉 EMAIL FLOW TEST COMPLETE!');
    console.log('📬 Check your email for the professional verification email');
    console.log('🔗 Click the verification link to complete the flow');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure your dev server is running on port 3000');
    console.log('2. Check that the API endpoint exists at /api/send-magic-link.js');
    console.log('3. Verify ZeptoMail credentials are correct');
  }
}

testEmailFlow();