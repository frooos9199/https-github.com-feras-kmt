// Firebase Admin SDK for sending push notifications
import admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  try {
    let credential;
    
    // محاولة قراءة ملف service account أولاً
    const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      console.log('✅ Using Firebase service account file');
      const serviceAccountFile = fs.readFileSync(serviceAccountPath, 'utf8');
      const serviceAccount = JSON.parse(serviceAccountFile);
      credential = admin.credential.cert(serviceAccount);
    } else {
      // استخدام متغيرات البيئة كخيار ثاني
      console.log('⚠️ Service account file not found, using environment variables');
      console.log('🔍 FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
      console.log('🔍 FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL);
      console.log('🔍 FIREBASE_PRIVATE_KEY length:', process.env.FIREBASE_PRIVATE_KEY?.length || 0);
      console.log('🔍 FIREBASE_PRIVATE_KEY starts with:', process.env.FIREBASE_PRIVATE_KEY?.substring(0, 50));
      
      let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
      
      // Check if it's base64 encoded (no newlines, no BEGIN marker visible)
      if (!privateKey.includes('BEGIN') && !privateKey.includes('\n')) {
        console.log('🔄 Detected base64 encoded key, decoding...');
        // Decode from base64
        privateKey = Buffer.from(privateKey, 'base64').toString('utf-8');
        console.log('✅ Decoded key starts with:', privateKey.substring(0, 50));
      } else {
        console.log('🔄 Processing standard format key...');
        // Remove outer quotes if present
        privateKey = privateKey.replace(/^["']|["']$/g, '');
        // Replace escaped newlines with actual newlines
        privateKey = privateKey.replace(/\\n/g, '\n');
      }
      
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: privateKey,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`,
        universe_domain: "googleapis.com"
      };

      // Validate required fields
      if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
        console.error('❌ Missing Firebase credentials:', {
          project_id: !!serviceAccount.project_id,
          private_key: !!serviceAccount.private_key,
          client_email: !!serviceAccount.client_email,
          private_key_id: !!serviceAccount.private_key_id
        });
        throw new Error('Missing Firebase credentials');
      }
      
      credential = admin.credential.cert(serviceAccount as admin.ServiceAccount);
    }

    const projectId = serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID;
    
    admin.initializeApp({
      credential,
      projectId: projectId,
      databaseURL: `https://${projectId}-default-rtdb.firebaseio.com`
    });

    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    console.error('❌ Error details:', JSON.stringify(error, null, 2));
    if (error instanceof Error) {
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
    }
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
    console.log('[FCM] ⏭️ No tokens to send to (users have not installed the app)');
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
