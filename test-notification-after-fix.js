// اختبار إرسال إشعارات Firebase بعد الإصلاح
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testNotificationSend() {
  try {
    console.log('🔍 Testing notification send with fixed Firebase authentication...\n');

    // الحصول على جميع المستخدمين الذين لديهم FCM tokens
    const usersWithTokens = await prisma.user.findMany({
      where: {
        fcmToken: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        fcmToken: true
      },
      take: 5 // اختبار 5 مستخدمين فقط
    });

    console.log(`📋 Found ${usersWithTokens.length} users with FCM tokens for testing\n`);

    if (usersWithTokens.length === 0) {
      console.log('⚠️ No users with FCM tokens found. Cannot test notification sending.');
      return;
    }

    // إرسال طلب HTTP إلى API الخاص بك
    const apiUrl = 'https://www.kmtsys.com/api/notifications/send';
    
    for (const user of usersWithTokens) {
      console.log(`📤 Testing notification for ${user.name} (${user.email})...`);
      
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            title: 'Firebase Auth Test',
            titleAr: 'اختبار مصادقة Firebase',
            message: 'Testing Firebase authentication fix',
            messageAr: 'اختبار إصلاح مصادقة Firebase',
            type: 'general',
            priority: 'high'
          })
        });

        const result = await response.json();
        
        if (response.ok) {
          console.log(`  ✅ Success! Response:`, result);
        } else {
          console.log(`  ❌ Failed! Status: ${response.status}, Response:`, result);
        }
      } catch (error) {
        console.log(`  ❌ Error:`, error.message);
      }
      
      console.log('');
    }

    console.log('✅ Test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNotificationSend();
