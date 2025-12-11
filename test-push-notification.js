/**
 * Test Script for Push Notifications
 * هذا السكريبت لاختبار إرسال Push Notification مباشرة
 */

const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const messaging = admin.messaging();

/**
 * أدخل FCM Token هنا (سيتم طباعته في Console عند تشغيل التطبيق)
 */
const FCM_TOKEN = process.argv[2] || 'PASTE_TOKEN_HERE';

async function testPushNotification() {
  console.log('🧪 Testing Push Notification...\n');
  console.log('📱 Target Token:', FCM_TOKEN.substring(0, 30) + '...\n');

  try {
    const message = {
      notification: {
        title: '🧪 اختبار النظام',
        body: 'هذه رسالة اختبار من Firebase Admin SDK',
      },
      data: {
        type: 'TEST',
        timestamp: new Date().toISOString()
      },
      // APNs Configuration for iOS
      apns: {
        payload: {
          aps: {
            alert: {
              title: '🧪 اختبار النظام',
              body: 'هذه رسالة اختبار من Firebase Admin SDK'
            },
            sound: 'default',
            badge: 1,
            contentAvailable: true
          }
        },
        headers: {
          'apns-priority': '10',
          'apns-push-type': 'alert'
        }
      },
      // Android Configuration
      android: {
        priority: 'high',
        notification: {
          title: '🧪 اختبار النظام',
          body: 'هذه رسالة اختبار من Firebase Admin SDK',
          sound: 'default',
          channelId: 'default'
        }
      },
      token: FCM_TOKEN
    };

    console.log('📤 Sending notification...\n');
    
    const response = await messaging.send(message);
    
    console.log('✅ SUCCESS!');
    console.log('📨 Message ID:', response);
    console.log('\n✨ Check your device now!');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('\nDetails:', error);
  }
}

// Run test
testPushNotification();
