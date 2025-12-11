/**
 * Check FCM Tokens in Database
 * هذا السكريبت للتحقق من FCM Tokens المحفوظة في قاعدة البيانات
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function checkFcmTokens() {
  console.log('🔍 Checking FCM Tokens in Database...\n');

  try {
    // Get all users with their FCM tokens
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        fcmToken: true
      },
      orderBy: {
        email: 'asc'
      }
    });

    console.log(`📊 Total Users: ${users.length}\n`);

    // Count users with/without FCM tokens
    const withTokens = users.filter(u => u.fcmToken && u.fcmToken.trim() !== '');
    const withoutTokens = users.filter(u => !u.fcmToken || u.fcmToken.trim() === '');

    console.log(`✅ Users with FCM Token: ${withTokens.length}`);
    console.log(`❌ Users without FCM Token: ${withoutTokens.length}\n`);

    // Show users with tokens
    if (withTokens.length > 0) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Users with FCM Tokens:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      withTokens.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name || 'No Name'}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   👤 Role: ${user.role}`);
        console.log(`   🔑 Token: ${user.fcmToken.substring(0, 40)}...`);
        console.log('');
      });
    }

    // Show users without tokens
    if (withoutTokens.length > 0) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Users WITHOUT FCM Tokens:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      withoutTokens.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name || 'No Name'}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   👤 Role: ${user.role}`);
        console.log('');
      });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 Tip: Users need to login via mobile app to save FCM token');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run check
checkFcmTokens();
