import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    let userId: string | null = null;
    let userRole: string | null = null;

    // Try NextAuth session first
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      userId = session.user.id;
      userRole = session.user.role;
    } else {
      // Try JWT from mobile app
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          const jwtSecret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'dev-secret-key';
          const decoded = jwt.verify(token, jwtSecret) as { id: string; role: string };
          userId = decoded.id;
          userRole = decoded.role;
        } catch (jwtError) {
          console.error('JWT verification failed:', jwtError);
        }
      }
    }

    if (!userId || userRole !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '24h'; // 24h, 7d, 30d

    // حساب التاريخ حسب الفترة
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // إحصائيات المستخدمين
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: {
        lastLogin: {
          gte: startDate
        }
      }
    });

    // إحصائيات الأحداث
    const totalEvents = await prisma.event.count();
    const recentEvents = await prisma.event.count({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    });

    // إحصائيات الحضور
    const totalAttendances = await prisma.attendance.count();
    const pendingRequests = await prisma.attendance.count({
      where: {
        status: 'pending'
      }
    });

    // إحصائيات العمليات
    const operations = await prisma.operationLog.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      select: {
        status: true,
        duration: true,
        operation: true
      }
    });

    const totalOperations = operations.length;
    const successfulOperations = operations.filter((op: any) => op.status === 'success').length;
    const failedOperations = operations.filter((op: any) => op.status === 'error').length;

    // متوسط وقت الاستجابة
    const completedOperations = operations.filter((op: any) => op.duration && op.status === 'success');
    const averageResponseTime = completedOperations.length > 0
      ? completedOperations.reduce((sum: number, op: any) => sum + (op.duration || 0), 0) / completedOperations.length
      : 0;

    // إحصائيات الإشعارات والإيميلات
    const emailOperations = operations.filter((op: any) => op.operation === 'email_send');
    const notificationOperations = operations.filter((op: any) => op.operation === 'notification_send');

    const emailsSent = emailOperations.filter((op: any) => op.status === 'success').length;
    const notificationsSent = notificationOperations.filter((op: any) => op.status === 'success').length;

    // إحصائيات الأخطاء
    const errors = await prisma.errorLog.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      select: {
        type: true,
        severity: true
      }
    });

    const errorStats = {
      total: errors.length,
      critical: errors.filter((e: any) => e.severity === 'critical').length,
      high: errors.filter((e: any) => e.severity === 'high').length,
      medium: errors.filter((e: any) => e.severity === 'medium').length,
      low: errors.filter((e: any) => e.severity === 'low').length
    };

    // إحصائيات العمليات حسب النوع
    const operationStats = operations.reduce((acc: any, op: any) => {
      if (!acc[op.operation]) {
        acc[op.operation] = { total: 0, success: 0, error: 0 };
      }
      acc[op.operation].total++;
      if (op.status === 'success') acc[op.operation].success++;
      if (op.status === 'error') acc[op.operation].error++;
      return acc;
    }, {} as Record<string, { total: number; success: number; error: number }>);

    return NextResponse.json({
      period,
      systemHealth: {
        totalUsers,
        activeUsers,
        totalEvents,
        recentEvents,
        totalAttendances,
        pendingRequests,
        totalOperations,
        successfulOperations,
        failedOperations,
        averageResponseTime: Math.round(averageResponseTime),
        emailsSent,
        notificationsSent,
        serverUptime: 99.9 // يمكن حسابه من logs
      },
      errors: errorStats,
      operations: operationStats,
      lastUpdated: now.toISOString()
    });

  } catch (error) {
    console.error('Error fetching monitoring stats:', error);
    return NextResponse.json({ error: 'خطأ في جلب الإحصائيات' }, { status: 500 });
  }
}