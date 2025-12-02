import { createAuthHeaders } from './apiConfig';
import { Alert } from 'react-native';

/**
 * إرسال FCM Token للسيرفر مع JWT Authentication
 * @param {string} fcmToken - Firebase Cloud Messaging Token
 * @param {string} userToken - JWT Token للمستخدم
 */
export async function sendFcmTokenToServer(fcmToken, userToken) {
  try {
    console.log('[FCM API] Sending FCM token to server...');
    
    const response = await fetch('https://www.kmtsys.com/api/user/fcm-token', {
      method: 'PUT',
      headers: createAuthHeaders(userToken),
      body: JSON.stringify({ fcmToken }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('[FCM API] ✅ FCM Token saved successfully');
      // عرض رسالة للمستخدم عشان نتأكد إنه اشتغل
      Alert.alert('✅ Success', 'FCM Token saved successfully!');
      return true;
    } else {
      console.error('[FCM API] ❌ Failed to save FCM Token:', data.error);
      Alert.alert('❌ Error', `Failed to save FCM Token: ${data.error}`);
      return false;
    }
  } catch (err) {
    console.error('[FCM API] ❌ Error sending FCM Token:', err.message);
    Alert.alert('❌ Network Error', err.message);
    return false;
  }
}

/**
 * إرسال FCM Token عند تسجيل الدخول (نسخة قديمة للتوافق)
 */
export async function sendFcmTokenWithEmail(token, email) {
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

