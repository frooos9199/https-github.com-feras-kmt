#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function generateSystemReport() {
  try {
    console.log('📊 GENERATING COMPREHENSIVE SYSTEM REPORT');
    console.log('='.repeat(60));
    console.log(`Report Generated: ${new Date().toLocaleString()}\n`);
    
    // 1. User Statistics
    console.log('👥 USER STATISTICS:');
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { isActive: true } });
    const adminUsers = await prisma.user.count({ where: { role: 'admin' } });
    const marshalUsers = await prisma.user.count({ where: { role: 'marshal' } });
    const usersWithFCM = await prisma.user.count({ where: { fcmToken: { not: null } } });
    
    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   Active Users: ${activeUsers}`);
    console.log(`   Admin Users: ${adminUsers}`);
    console.log(`   Marshal Users: ${marshalUsers}`);
    console.log(`   Users with FCM Tokens: ${usersWithFCM}\n`);
    
    // 2. Event Statistics
    console.log('🏁 EVENT STATISTICS:');
    const totalEvents = await prisma.event.count();
    const activeEvents = await prisma.event.count({ where: { status: 'active' } });
    const archivedEvents = await prisma.event.count({ where: { isArchived: true } });
    const upcomingEvents = await prisma.event.count({ 
      where: { 
        date: { gte: new Date() },
        status: 'active',
        isArchived: false
      } 
    });
    
    console.log(`   Total Events: ${totalEvents}`);
    console.log(`   Active Events: ${activeEvents}`);
    console.log(`   Archived Events: ${archivedEvents}`);
    console.log(`   Upcoming Events: ${upcomingEvents}\n`);
    
    // 3. Attendance Statistics
    console.log('📋 ATTENDANCE STATISTICS:');
    const totalAttendances = await prisma.attendance.count();
    const approvedAttendances = await prisma.attendance.count({ where: { status: 'approved' } });
    const pendingAttendances = await prisma.attendance.count({ where: { status: 'pending' } });
    const rejectedAttendances = await prisma.attendance.count({ where: { status: 'rejected' } });
    
    console.log(`   Total Attendance Requests: ${totalAttendances}`);
    console.log(`   Approved: ${approvedAttendances}`);
    console.log(`   Pending: ${pendingAttendances}`);
    console.log(`   Rejected: ${rejectedAttendances}\n`);
    
    // 4. Event Marshal Statistics
    console.log('🎯 EVENT MARSHAL STATISTICS:');
    const totalEventMarshals = await prisma.eventMarshal.count();
    const acceptedInvitations = await prisma.eventMarshal.count({ where: { status: 'accepted' } });
    const pendingInvitations = await prisma.eventMarshal.count({ where: { status: 'invited' } });
    const declinedInvitations = await prisma.eventMarshal.count({ where: { status: 'declined' } });
    
    console.log(`   Total Event Marshal Records: ${totalEventMarshals}`);
    console.log(`   Accepted Invitations: ${acceptedInvitations}`);
    console.log(`   Pending Invitations: ${pendingInvitations}`);
    console.log(`   Declined Invitations: ${declinedInvitations}\n`);
    
    // 5. Notification Statistics
    console.log('🔔 NOTIFICATION STATISTICS:');
    const totalNotifications = await prisma.notification.count();
    const readNotifications = await prisma.notification.count({ where: { isRead: true } });
    const unreadNotifications = await prisma.notification.count({ where: { isRead: false } });
    
    // Notification types breakdown
    const notificationTypes = await prisma.notification.groupBy({
      by: ['type'],
      _count: { type: true }
    });
    
    console.log(`   Total Notifications: ${totalNotifications}`);
    console.log(`   Read: ${readNotifications}`);
    console.log(`   Unread: ${unreadNotifications}`);
    console.log('   By Type:');
    notificationTypes.forEach(type => {
      console.log(`     ${type.type}: ${type._count.type}`);
    });
    console.log('');
    
    // 6. Marshal Types Distribution
    console.log('🏎️ MARSHAL TYPES DISTRIBUTION:');
    const marshals = await prisma.user.findMany({
      where: { role: 'marshal', isActive: true },
      select: { marshalTypes: true }
    });
    
    const typeCount = {};
    marshals.forEach(marshal => {
      if (marshal.marshalTypes) {
        const types = marshal.marshalTypes.split(',').map(t => t.trim());
        types.forEach(type => {
          typeCount[type] = (typeCount[type] || 0) + 1;
        });
      }
    });
    
    Object.entries(typeCount).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} marshals`);
    });
    console.log('');
    
    // 7. Recent Activity (Last 7 days)
    console.log('📈 RECENT ACTIVITY (Last 7 days):');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentUsers = await prisma.user.count({
      where: { createdAt: { gte: sevenDaysAgo } }
    });
    const recentEvents = await prisma.event.count({
      where: { createdAt: { gte: sevenDaysAgo } }
    });
    const recentAttendances = await prisma.attendance.count({
      where: { registeredAt: { gte: sevenDaysAgo } }
    });
    const recentNotifications = await prisma.notification.count({
      where: { createdAt: { gte: sevenDaysAgo } }
    });
    
    console.log(`   New Users: ${recentUsers}`);
    console.log(`   New Events: ${recentEvents}`);
    console.log(`   New Attendance Requests: ${recentAttendances}`);
    console.log(`   New Notifications: ${recentNotifications}\n`);
    
    // 8. System Health Indicators
    console.log('🏥 SYSTEM HEALTH INDICATORS:');
    const approvalRate = totalAttendances > 0 ? ((approvedAttendances / totalAttendances) * 100).toFixed(1) : 0;
    const invitationAcceptanceRate = totalEventMarshals > 0 ? ((acceptedInvitations / totalEventMarshals) * 100).toFixed(1) : 0;
    const notificationReadRate = totalNotifications > 0 ? ((readNotifications / totalNotifications) * 100).toFixed(1) : 0;
    const fcmAdoptionRate = totalUsers > 0 ? ((usersWithFCM / totalUsers) * 100).toFixed(1) : 0;
    
    console.log(`   Attendance Approval Rate: ${approvalRate}%`);
    console.log(`   Invitation Acceptance Rate: ${invitationAcceptanceRate}%`);
    console.log(`   Notification Read Rate: ${notificationReadRate}%`);
    console.log(`   FCM Token Adoption Rate: ${fcmAdoptionRate}%\n`);
    
    // 9. Potential Issues
    console.log('⚠️ POTENTIAL ISSUES:');
    const issues = [];
    
    if (usersWithFCM === 0) {
      issues.push('No users have FCM tokens - Push notifications will not work');
    }
    
    if (pendingAttendances > approvedAttendances) {
      issues.push('More pending attendance requests than approved - Review backlog');
    }
    
    if (unreadNotifications > readNotifications) {
      issues.push('More unread notifications than read - Users may not be engaging');
    }
    
    if (upcomingEvents === 0) {
      issues.push('No upcoming events scheduled');
    }
    
    if (issues.length === 0) {
      console.log('   ✅ No critical issues detected');
    } else {
      issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }
    
    console.log('');
    console.log('='.repeat(60));
    console.log('📊 SYSTEM REPORT COMPLETE');
    
  } catch (error) {
    console.error('❌ Error generating system report:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateSystemReport();