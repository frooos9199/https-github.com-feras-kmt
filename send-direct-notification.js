// إرسال إشعار مباشر باستخدام Firebase Admin SDK
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function sendDirectNotification() {
  try {
    // Initialize Firebase
    if (!admin.apps.length) {
      const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
      console.log('✅ Firebase initialized\n');
    }

    const email = 'summit_kw@hotmail.com';
    console.log(`🔍 Looking for user: ${email}\n`);

    // Get user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        fcmToken: true,
        role: true
      }
    });

    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    console.log('✅ User found:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Has FCM Token: ${user.fcmToken ? '✅ Yes' : '❌ No'}`);
    console.log('');

    if (!user.fcmToken) {
      console.log('⚠️ No FCM token found!');
      return;
    }

    // Create notification in DB
    console.log('📝 Creating notification in database...');
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'BROADCAST',
        titleEn: 'Background Test 🔔',
        titleAr: 'اختبار الخلفية 🔔',
        messageEn: 'This notification should work in background! Close the app and check.',
        messageAr: 'هذا الإشعار يجب أن يعمل في الخلفية! أغلق التطبيق وتحقق.'
      }
    });
    console.log('✅ Notification saved in database\n');

    // Send push notification
    console.log('📤 Sending push notification via Firebase...\n');
    
    const message = {
      notification: {
        title: 'Background Test 🔔',
        body: 'This notification should work in background! Close the app and check.'
      },
      data: {
        type: 'BROADCAST',
        titleAr: 'اختبار الخلفية 🔔',
        messageAr: 'هذا الإشعار يجب أن يعمل في الخلفية! أغلق التطبيق وتحقق.'
      },
      // iOS config
      apns: {
        payload: {
          aps: {
            alert: {
              title: 'Background Test 🔔',
              body: 'This notification should work in background! Close the app and check.'
            },
            sound: 'default',
            badge: 1
          }
        },
        headers: {
          'apns-priority': '10',
          'apns-push-type': 'alert'
        }
      },
      // Android config
      android: {
        priority: 'high',
        notification: {
          title: 'Background Test 🔔',
          body: 'This notification should work in background! Close the app and check.',
          sound: 'default',
          channelId: 'default'
        }
      },
      token: user.fcmToken
    };

    const response = await admin.messaging().send(message);
    
    console.log('✅ SUCCESS! Push notification sent!');
    console.log('   Message ID:', response);
    console.log('\n📱 Testing steps:');
    console.log('   1. ✅ Close the app COMPLETELY (swipe up from app switcher)');
    console.log('   2. ⏱️  Wait 5-10 seconds');
    console.log('   3. 🎉 You should see the notification!');
    console.log('\n💡 If you see it while app is closed = Background notifications work! ✅');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
  } finally {
    await prisma.$disconnect();
  }
}

sendDirectNotification();
