// التحقق من حالة FCM tokens للمستخدمين
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFCMTokens() {
  try {
    console.log('🔍 Analyzing FCM tokens...\n');

    // إجمالي المستخدمين
    const totalUsers = await prisma.user.count();
    console.log(`👥 Total users: ${totalUsers}`);

    // مستخدمين لديهم FCM token
    const usersWithToken = await prisma.user.count({
      where: {
        fcmToken: {
          not: null,
          not: ''
        }
      }
    });
    console.log(`✅ Users with FCM token: ${usersWithToken}`);

    // مستخدمين بدون FCM token
    const usersWithoutToken = await prisma.user.count({
      where: {
        OR: [
          { fcmToken: null },
          { fcmToken: '' }
        ]
      }
    });
    console.log(`❌ Users without FCM token: ${usersWithoutToken}`);

    // التفاصيل حسب الدور
    console.log('\n📊 Breakdown by role:');
    
    const roles = ['marshal', 'admin', 'superadmin'];
    for (const role of roles) {
      const total = await prisma.user.count({ where: { role } });
      const withToken = await prisma.user.count({
        where: {
          role,
          fcmToken: { not: null, not: '' }
        }
      });
      const withoutToken = total - withToken;
      
      console.log(`  ${role.padEnd(12)}: ${total.toString().padStart(3)} total | ${withToken.toString().padStart(3)} with token | ${withoutToken.toString().padStart(3)} without token`);
    }

    // عرض بعض المستخدمين بدون token
    console.log('\n📋 Sample users without FCM token:');
    const sampleUsers = await prisma.user.findMany({
      where: {
        OR: [
          { fcmToken: null },
          { fcmToken: '' }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      take: 10,
      orderBy: { createdAt: 'desc' }
    });

    sampleUsers.forEach((user, index) => {
      const date = new Date(user.createdAt).toLocaleDateString('en-GB');
      console.log(`  ${(index + 1).toString().padStart(2)}. ${user.name.padEnd(25)} | ${user.email.padEnd(30)} | ${user.role.padEnd(10)} | Created: ${date}`);
    });

    // إحصائيات إضافية
    console.log('\n📈 Statistics:');
    console.log(`  Token coverage: ${((usersWithToken / totalUsers) * 100).toFixed(1)}%`);
    console.log(`  Missing tokens: ${((usersWithoutToken / totalUsers) * 100).toFixed(1)}%`);

    if (usersWithoutToken === 86) {
      console.log('\n✅ CONFIRMED: The 86 users who failed to receive notifications are those WITHOUT FCM tokens!');
      console.log('   These users have NOT installed/logged into the mobile app yet.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFCMTokens();
