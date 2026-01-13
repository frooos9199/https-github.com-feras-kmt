// إرسال إشعار اختبار لمستخدم معين
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function sendTestNotification() {
  try {
    const email = 'summit_kw@hotmail.com';
    console.log(`🔍 Looking for user: ${email}\n`);

    // البحث عن المستخدم
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
    console.log(`   Role: ${user.role}`);
    console.log(`   Has FCM Token: ${user.fcmToken ? '✅ Yes' : '❌ No'}`);
    console.log('');

    if (!user.fcmToken) {
      console.log('⚠️ User has no FCM token. Please make sure you:');
      console.log('   1. Opened the app');
      console.log('   2. Logged in successfully');
      console.log('   3. Allowed notifications when prompted');
      return;
    }

    // إنشاء إشعار في قاعدة البيانات
    console.log('📝 Creating notification in database...');
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'BROADCAST',
        titleEn: 'Background Test 🔔',
        titleAr: 'اختبار الخلفية 🔔',
        messageEn: 'This is a background notification test. If you see this while the app is closed, it works! ✅',
        messageAr: 'هذا اختبار للإشعارات في الخلفية. إذا ظهر لك هذا والتطبيق مغلق، معناها يشتغل! ✅'
      }
    });
    console.log('✅ Notification created in database\n');

    // إرسال الإشعار عبر API
    console.log('📤 Sending push notification via API...\n');
    
    const response = await fetch('https://www.kmtsys.com/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        titleEn: 'Background Test 🔔',
        titleAr: 'اختبار الخلفية 🔔',
        messageEn: 'This is a background notification test. If you see this while the app is closed, it works! ✅',
        messageAr: 'هذا اختبار للإشعارات في الخلفية. إذا ظهر لك هذا والتطبيق مغلق، معناها يشتغل! ✅',
        type: 'BROADCAST',
        priority: 'high'
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS! Notification sent!');
      console.log('\n📱 Now test:');
      console.log('   1. Close the app completely (swipe up from app switcher)');
      console.log('   2. Wait 5-10 seconds');
      console.log('   3. You should see the notification appear! 🎉');
    } else {
      console.log('❌ Failed to send notification:');
      console.log(result);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

sendTestNotification();
