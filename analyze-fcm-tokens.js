#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function analyzeFCMTokens() {
  try {
    console.log('🔍 Analyzing FCM Token Issues...\n');
    
    // Get all marshals
    const allMarshals = await prisma.user.findMany({
      where: { role: 'marshal' },
      select: {
        id: true,
        name: true,
        email: true,
        employeeId: true,
        fcmToken: true,
        isActive: true,
        createdAt: true,
        lastLogin: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📊 Total Marshals: ${allMarshals.length}`);
    
    // Analyze FCM token status
    const withTokens = allMarshals.filter(m => m.fcmToken && m.fcmToken.trim() !== '');
    const withoutTokens = allMarshals.filter(m => !m.fcmToken || m.fcmToken.trim() === '');
    const inactiveMarshals = allMarshals.filter(m => !m.isActive);
    
    console.log(`✅ With FCM Tokens: ${withTokens.length}`);
    console.log(`❌ Without FCM Tokens: ${withoutTokens.length}`);
    console.log(`⚠️ Inactive Marshals: ${inactiveMarshals.length}\n`);
    
    // Check token validity patterns
    const validTokenPattern = /^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/;
    const invalidTokens = withTokens.filter(m => !validTokenPattern.test(m.fcmToken));
    
    console.log(`🔍 Token Analysis:`);
    console.log(`   Valid Format Tokens: ${withTokens.length - invalidTokens.length}`);
    console.log(`   Invalid Format Tokens: ${invalidTokens.length}\n`);
    
    // Recent vs Old users
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUsers = allMarshals.filter(m => m.createdAt >= thirtyDaysAgo);
    const oldUsers = allMarshals.filter(m => m.createdAt < thirtyDaysAgo);
    
    const recentWithTokens = recentUsers.filter(m => m.fcmToken);
    const oldWithTokens = oldUsers.filter(m => m.fcmToken);
    
    console.log(`📅 User Age Analysis:`);
    console.log(`   Recent Users (30 days): ${recentUsers.length} (${recentWithTokens.length} with tokens)`);
    console.log(`   Older Users: ${oldUsers.length} (${oldWithTokens.length} with tokens)\n`);
    
    // Login activity
    const usersWithLogin = allMarshals.filter(m => m.lastLogin);
    const usersWithoutLogin = allMarshals.filter(m => !m.lastLogin);
    
    console.log(`🔐 Login Activity:`);
    console.log(`   Ever Logged In: ${usersWithLogin.length}`);
    console.log(`   Never Logged In: ${usersWithoutLogin.length}\n`);
    
    // Sample of users without tokens
    console.log(`📋 Sample Users Without FCM Tokens (First 10):`);
    withoutTokens.slice(0, 10).forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.employeeId}) - Created: ${user.createdAt.toLocaleDateString()}`);
    });
    
    console.log('\n📋 Sample Users With FCM Tokens (First 5):');
    withTokens.slice(0, 5).forEach((user, index) => {
      const tokenPreview = user.fcmToken.substring(0, 20) + '...';
      console.log(`   ${index + 1}. ${user.name} (${user.employeeId}) - Token: ${tokenPreview}`);
    });
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    
    if (withoutTokens.length > withTokens.length) {
      console.log('   1. Most marshals don\'t have FCM tokens - Mobile app not widely used');
    }
    
    if (usersWithoutLogin.length > 50) {
      console.log('   2. Many users never logged in - Need user activation campaign');
    }
    
    if (recentWithTokens.length / recentUsers.length > oldWithTokens.length / oldUsers.length) {
      console.log('   3. Recent users more likely to have tokens - Mobile app adoption improving');
    }
    
    if (invalidTokens.length > 0) {
      console.log('   4. Some tokens have invalid format - Need token validation');
    }
    
    console.log('\n🔧 SOLUTIONS:');
    console.log('   • Send email/SMS to users without tokens to download mobile app');
    console.log('   • Add FCM token registration prompts in mobile app');
    console.log('   • Clean up invalid/expired tokens');
    console.log('   • Monitor token refresh and update mechanisms');

  } catch (error) {
    console.error('❌ Error analyzing FCM tokens:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeFCMTokens();