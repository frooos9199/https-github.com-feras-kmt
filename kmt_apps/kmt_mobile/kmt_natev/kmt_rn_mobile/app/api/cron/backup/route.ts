import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

// This endpoint creates a database backup
// Can be triggered manually by admin or automatically via Vercel Cron
export async function GET(request: NextRequest) {
  try {
    // Verify this is either from Vercel Cron or an authenticated admin
    const authHeader = request.headers.get('authorization');
    
    // Check if request is from Vercel Cron
    const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
    
    // If not from Vercel Cron, check if user is authenticated admin
    let isAdmin = false;
    if (!isVercelCron) {
      const session = await getServerSession(authOptions);
      isAdmin = session?.user?.role === 'admin';
    }

    if (!isVercelCron && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch all data from database
    const backupData = {
      timestamp: new Date().toISOString(),
      users: await prisma.user.findMany({
        include: {
          attendances: true,
          notifications: true,
        }
      }),
      events: await prisma.event.findMany({
        include: {
          attendances: true,
        }
      }),
      attendances: await prisma.attendance.findMany(),
      notifications: await prisma.notification.findMany(),
      broadcastMessages: await prisma.broadcastMessage.findMany(),
    };

    // Calculate statistics
    const stats = {
      totalUsers: backupData.users.length,
      totalEvents: backupData.events.length,
      totalAttendances: backupData.attendances.length,
      totalNotifications: backupData.notifications.length,
      totalBroadcasts: backupData.broadcastMessages.length,
    };

    // Convert to JSON string
    const backupJson = JSON.stringify(backupData, null, 2);
    const backupSize = (backupJson.length / 1024).toFixed(2); // Size in KB

    // Send backup via email to admin
    const adminEmail = process.env.ADMIN_EMAIL || 'summit_kw@hotmail.com';
    const backupDate = new Date().toLocaleString('en-US', { 
      timeZone: 'Asia/Kuwait',
      dateStyle: 'full',
      timeStyle: 'short'
    });

    // Send backup via email (backup data in email body since attachments not supported)
    await sendEmail({
      to: adminEmail,
      subject: `🗄️ KMT Database Backup - ${backupDate}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">📦 Database Backup Complete</h2>
          
          <p>Automatic monthly backup has been created successfully.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Backup Statistics:</h3>
            <ul style="color: #6b7280; line-height: 1.8;">
              <li>👥 Users: <strong>${stats.totalUsers}</strong></li>
              <li>📅 Events: <strong>${stats.totalEvents}</strong></li>
              <li>✅ Attendances: <strong>${stats.totalAttendances}</strong></li>
              <li>🔔 Notifications: <strong>${stats.totalNotifications}</strong></li>
              <li>📢 Broadcasts: <strong>${stats.totalBroadcasts}</strong></li>
              <li>📊 Backup Size: <strong>${backupSize} KB</strong></li>
            </ul>
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            <strong>Backup Date:</strong> ${backupDate}<br>
            <strong>Next Backup:</strong> Scheduled in 1 month
          </p>

          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>⚠️ Important:</strong> The backup data is included below. 
              Please save it securely in a file named: kmt-backup-${Date.now()}.json
            </p>
          </div>

          <div style="background-color: #1f2937; padding: 15px; border-radius: 8px; margin: 20px 0; overflow-x: auto;">
            <pre style="color: #10b981; margin: 0; font-size: 12px; white-space: pre-wrap; word-wrap: break-word;">${backupJson.substring(0, 1000)}...

[Full backup data available via admin panel]</pre>
          </div>

          <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
            Kuwait Motorsport Team - Marshal Management System
          </p>
        </div>
      `,
    });

    // Create notification for all admins
    const admins = await prisma.user.findMany({
      where: { role: 'admin' }
    });

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'general',
          titleEn: '🗄️ Monthly Backup Complete',
          titleAr: '🗄️ اكتملت النسخة الاحتياطية الشهرية',
          messageEn: `Database backup created successfully.\n\n${stats.totalUsers} users, ${stats.totalEvents} events, ${stats.totalAttendances} attendances.\n\nBackup sent to: ${adminEmail}`,
          messageAr: `تم إنشاء نسخة احتياطية من قاعدة البيانات بنجاح.\n\n${stats.totalUsers} مستخدم، ${stats.totalEvents} حدث، ${stats.totalAttendances} حضور.\n\nتم الإرسال إلى: ${adminEmail}`,
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Backup created successfully',
      stats,
      backupSize: `${backupSize} KB`,
      sentTo: adminEmail,
    });

  } catch (error) {
    console.error('Backup error:', error);
    
    // Send error notification to admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'summit_kw@hotmail.com';
      await sendEmail({
        to: adminEmail,
        subject: '⚠️ KMT Backup Failed',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">⚠️ Backup Failed</h2>
            <p>The monthly database backup failed to complete.</p>
            <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #991b1b; margin: 0;">
                <strong>Error:</strong> ${error instanceof Error ? error.message : 'Unknown error'}
              </p>
            </div>
            <p style="color: #6b7280;">Please check the system logs and try again.</p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send error notification:', emailError);
    }

    return NextResponse.json(
      { error: 'Backup failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
