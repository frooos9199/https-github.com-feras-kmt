// ملف util لمساعدة إرسال التوكن للسيرفر
export async function sendFcmTokenToServer(token, email) {
  try {
    const response = await fetch('https://www.kmtsys.com/api/auth/save-fcm-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, email }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ FCM Token sent successfully to server');
      return true;
    } else {
      console.error('❌ Failed to save FCM Token:', data.error);
      return false;
    }
  } catch (err) {
    console.error('❌ Error sending FCM Token to server:', err.message);
    return false;
  }
}
