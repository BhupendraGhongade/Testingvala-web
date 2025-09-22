// Test script for the magic link API endpoint
async function testMagicLinkAPI() {
  console.log('🧪 Testing Magic Link API Endpoint\n');
  
  const baseUrl = 'http://localhost:3001';
  const testEmail = 'test@testingvala.com';
  
  try {
    console.log('📡 Sending POST request to /api/send-magic-link...');
    console.log('📧 Test email:', testEmail);
    
    const response = await fetch(`${baseUrl}/api/send-magic-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: testEmail,
        deviceId: 'test-device-' + Date.now()
      })
    });
    
    console.log('\n📊 Response Details:');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('\n✅ SUCCESS - Response Data:');
      console.log(JSON.stringify(data, null, 2));
      
      if (data.magicLink) {
        console.log('\n🔗 Magic Link (copy and paste in browser):');
        console.log(data.magicLink);
      }
    } else {
      const errorText = await response.text();
      console.log('\n❌ ERROR - Response:');
      console.log('Raw response:', errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        console.log('Parsed error:', JSON.stringify(errorJson, null, 2));
      } catch (parseError) {
        console.log('Could not parse error as JSON');
      }
    }
    
  } catch (error) {
    console.error('\n💥 FETCH ERROR:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testMagicLinkAPI();