// ملف util لمساعدة إرسال التوكن للسيرفر
export async function sendFcmTokenToServer(token, email) {
  try {
    await fetch('https://www.kmtsys.com/api/auth/save-fcm-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, email }),
    });
  } catch (err) {
    // يمكن تجاهل الخطأ أو طباعته
    console.log('فشل إرسال FCM Token للسيرفر:', err.message);
  }
}
