// Test notification via deployed API
async function testViaAPI() {
  try {
    console.log('📤 Sending test notification via deployed API...\n');
    
    const response = await fetch('https://www.kmtsys.com/api/notifications/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'summit_kw@hotmail.com'
      })
    });

    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (response.ok && result.success) {
      console.log('\n✅ SUCCESS!');
      console.log('\n📱 Now test background notifications:');
      console.log('   1. Close the KMT app COMPLETELY (swipe up from app switcher)');
      console.log('   2. Wait 5-10 seconds');
      console.log('   3. You should see the notification appear! 🎉');
      console.log('\n💡 If you see it while app is closed = Background works! ✅');
    } else {
      console.log('\n❌ Failed:', result.error || result.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testViaAPI();
