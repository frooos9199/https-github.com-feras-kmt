/**
 * Clear all FCM tokens from database
 * Use this when tokens are invalid or corrupted
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function clearFcmTokens() {
  console.log('🗑️  Clearing all FCM tokens from database...\n');

  try {
    // Update all users to set fcmToken to null
    const result = await prisma.user.updateMany({
      where: {
        fcmToken: {
          not: null
        }
      },
      data: {
        fcmToken: null
      }
    });

    console.log(`✅ Successfully cleared ${result.count} FCM tokens\n`);
    console.log('💡 Users need to login again via mobile app to save new tokens');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run
clearFcmTokens();
