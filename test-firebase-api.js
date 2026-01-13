// اختبار Firebase authentication من خلال API endpoint
async function testFirebaseAPI() {
  console.log('🔍 Testing Firebase authentication via API...\n');

  try {
    // اختبار endpoint بسيط
    const response = await fetch('https://www.kmtsys.com/api/test-firebase', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('\n✅ Firebase authentication is working!');
    } else {
      console.log('\n❌ Firebase authentication failed!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFirebaseAPI();
