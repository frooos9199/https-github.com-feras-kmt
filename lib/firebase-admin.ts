// Firebase Admin SDK for sending push notifications
import admin from 'firebase-admin';

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  try {
    // Use environment variables to create service account
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
    };

    // Validate required fields
    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
      throw new Error('Missing Firebase credentials');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      projectId: serviceAccount.project_id
    });

    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
  }
}

// Export messaging only if Firebase is initialized
export const messaging = admin.apps.length > 0 ? admin.messaging() : null;

/**
 * Send push notification to multiple devices
 */
export async function sendPushNotification(
  tokens: string[],
  title: string,
  body: string,
  data?: { [key: string]: string }
) {
  if (!messaging) {
    console.log('[FCM] ⚠️ Firebase messaging not initialized, skipping push notification');
    return { success: 0, failure: tokens.length };
  }

  if (!tokens || tokens.length === 0) {
    console.log('[FCM] No tokens to send to');
    return { success: 0, failure: 0 };
  }

  try {
    console.log(`[FCM] 📤 Preparing to send to ${tokens.length} devices...`);
    console.log(`[FCM] 📨 Title: "${title}"`);
    console.log(`[FCM] 📨 Body: "${body}"`);
    
    const message = {
      notification: {
        title,
        body,
      },
      data: data || {},
      // ⭐ إعدادات APNs للـ iOS
      apns: {
        payload: {
          aps: {
            alert: {
              title,
              body
            },
            sound: 'default',
            badge: 1,
            // ⚠️ لا نستخدم contentAvailable مع notification لأنه يمنع العرض!
          }
        },
        headers: {
          'apns-priority': '10', // أعلى أولوية
          'apns-push-type': 'alert'
        }
      },
      // ⭐ إعدادات Android
      android: {
        priority: 'high' as const,
        notification: {
          title,
          body,
          sound: 'default',
          channelId: 'default'
        }
      },
      tokens: tokens.filter(t => t && t.trim() !== ''), // Remove empty tokens
    };

    console.log('[FCM] 📨 Sending push notification with APNs config...');
    const response = await messaging.sendEachForMulticast(message);
    
    console.log(`[FCM] ✅ Success: ${response.successCount}, Failed: ${response.failureCount}`);
    
    // تفاصيل الأخطاء إن وجدت
    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`[FCM] ❌ Failed to send to token ${idx}:`, resp.error);
        }
      });
    }
    
    return {
      success: response.successCount,
      failure: response.failureCount,
      responses: response.responses
    };
  } catch (error) {
    console.error('[FCM] ❌ Error sending push notification:', error);
    return { success: 0, failure: tokens.length };
  }
}

export default admin;
