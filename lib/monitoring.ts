import { prisma } from '@/lib/prisma';

// قاموس ترجمة العمليات
const operationTranslations = {
  'notification_send': {
    en: 'Send Notification',
    ar: 'إرسال إشعار'
  },
  'user_login': {
    en: 'User Login',
    ar: 'تسجيل دخول مستخدم'
  },
  'user_logout': {
    en: 'User Logout',
    ar: 'تسجيل خروج مستخدم'
  },
  'user_signup': {
    en: 'User Registration',
    ar: 'تسجيل مستخدم جديد'
  },
  'event_create': {
    en: 'Create Event',
    ar: 'إنشاء حدث'
  },
  'event_update': {
    en: 'Update Event',
    ar: 'تحديث حدث'
  },
  'event_delete': {
    en: 'Delete Event',
    ar: 'حذف حدث'
  },
  'event_cancel': {
    en: 'Cancel Event',
    ar: 'إلغاء حدث'
  },
  'attendance_register': {
    en: 'Register Attendance',
    ar: 'تسجيل حضور'
  },
  'attendance_cancel': {
    en: 'Cancel Attendance',
    ar: 'إلغاء حضور'
  },
  'attendance_approve': {
    en: 'Approve Attendance',
    ar: 'اعتماد حضور'
  },
  'attendance_reject': {
    en: 'Reject Attendance',
    ar: 'رفض حضور'
  },
  'admin_action': {
    en: 'Admin Action',
    ar: 'إجراء إداري'
  },
  'backup_create': {
    en: 'Create Backup',
    ar: 'إنشاء نسخة احتياطية'
  },
  'backup_restore': {
    en: 'Restore Backup',
    ar: 'استعادة نسخة احتياطية'
  },
  'report_generate': {
    en: 'Generate Report',
    ar: 'إنشاء تقرير'
  },
  'broadcast_send': {
    en: 'Send Broadcast',
    ar: 'إرسال إذاعة'
  },
  'email_send': {
    en: 'Send Email',
    ar: 'إرسال بريد إلكتروني'
  },
  'push_send': {
    en: 'Send Push Notification',
    ar: 'إرسال إشعار فوري'
  },
  'user_update': {
    en: 'Update User Profile',
    ar: 'تحديث ملف المستخدم'
  },
  'password_reset': {
    en: 'Password Reset',
    ar: 'إعادة تعيين كلمة المرور'
  },
  'file_upload': {
    en: 'File Upload',
    ar: 'رفع ملف'
  },
  'api_call': {
    en: 'API Call',
    ar: 'استدعاء API'
  }
};

// دالة للحصول على ترجمة العملية حسب اللغة
export function getOperationTranslation(operation: string, language: 'en' | 'ar' = 'ar'): string {
  const translation = operationTranslations[operation as keyof typeof operationTranslations];
  if (translation) {
    return translation[language];
  }
  // إذا لم توجد ترجمة، أعد العملية كما هي
  return operation;
}

// تسجيل العمليات
export async function logOperation(
  operation: string,
  userId?: string,
  targetId?: string,
  metadata?: any
) {
  try {
    const startTime = Date.now();

    // تسجيل بداية العملية
    const logEntry = await prisma.operationLog.create({
      data: {
        operation,
        userId,
        targetId,
        status: 'pending',
        metadata
      }
    });

    return {
      logId: logEntry.id,
      startTime,
      complete: async (status: 'success' | 'error', errorMessage?: string, additionalMetadata?: any) => {
        const duration = Date.now() - startTime;
        await prisma.operationLog.update({
          where: { id: logEntry.id },
          data: {
            status,
            duration,
            errorMessage,
            metadata: { ...metadata, ...additionalMetadata }
          }
        });
      }
    };
  } catch (error) {
    console.error('Failed to log operation:', error);
    // لا نرمي خطأ هنا لأن تسجيل العمليات لا يجب أن يعطل العمليات الأساسية
    return {
      logId: null,
      startTime: Date.now(),
      complete: async () => {} // لا تفعل شيء
    };
  }
}

// تسجيل الأخطاء
export async function logError(
  type: string,
  message: string,
  operation?: string,
  userId?: string,
  url?: string,
  stack?: string,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
  metadata?: any
) {
  try {
    await prisma.errorLog.create({
      data: {
        type,
        operation,
        message,
        stack,
        userId,
        url,
        severity,
        metadata
      }
    });
  } catch (error) {
    console.error('Failed to log error:', error);
    // لا نرمي خطأ هنا
  }
}

// تحديث وقت آخر تسجيل دخول للمستخدم
export async function updateLastLogin(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() }
    });
  } catch (error) {
    console.error('Failed to update last login:', error);
  }
}

// حساب إحصائيات النظام اليومية
export async function updateDailyStats() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // التحقق من وجود إحصائيات لهذا اليوم
    const existingStats = await prisma.systemStats.findUnique({
      where: { date: today }
    });

    if (existingStats) {
      // تحديث الإحصائيات الموجودة
      const totalUsers = await prisma.user.count();
      const activeUsers = await prisma.user.count({
        where: {
          lastLogin: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // آخر أسبوع
          }
        }
      });
      const totalEvents = await prisma.event.count();
      const totalAttendances = await prisma.attendance.count();
      const pendingRequests = await prisma.attendance.count({
        where: { status: 'pending' }
      });

      // إحصائيات العمليات لليوم
      const todayOperations = await prisma.operationLog.findMany({
        where: {
          createdAt: { gte: today }
        }
      });

      const successfulOperations = todayOperations.filter(op => op.status === 'success').length;
      const failedOperations = todayOperations.filter(op => op.status === 'error').length;

      const completedOperations = todayOperations.filter(op => op.duration && op.status === 'success');
      const averageResponseTime = completedOperations.length > 0
        ? completedOperations.reduce((sum, op) => sum + (op.duration || 0), 0) / completedOperations.length
        : 0;

      // إحصائيات الإيميلات والإشعارات
      const emailOperations = todayOperations.filter(op => op.operation === 'email_send');
      const notificationOperations = todayOperations.filter(op => op.operation === 'notification_send');

      const emailsSent = emailOperations.filter(op => op.status === 'success').length;
      const notificationsSent = notificationOperations.filter(op => op.status === 'success').length;

      await prisma.systemStats.update({
        where: { date: today },
        data: {
          totalUsers,
          activeUsers,
          totalEvents,
          totalAttendances,
          pendingRequests,
          totalOperations: todayOperations.length,
          successfulOperations,
          failedOperations,
          averageResponseTime,
          emailsSent,
          notificationsSent
        }
      });
    } else {
      // إنشاء إحصائيات جديدة لليوم
      const totalUsers = await prisma.user.count();
      const activeUsers = await prisma.user.count({
        where: {
          lastLogin: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      });
      const totalEvents = await prisma.event.count();
      const totalAttendances = await prisma.attendance.count();
      const pendingRequests = await prisma.attendance.count({
        where: { status: 'pending' }
      });

      await prisma.systemStats.create({
        data: {
          date: today,
          totalUsers,
          activeUsers,
          totalEvents,
          totalAttendances,
          pendingRequests,
          totalOperations: 0,
          successfulOperations: 0,
          failedOperations: 0,
          averageResponseTime: 0,
          emailsSent: 0,
          notificationsSent: 0,
          serverUptime: 100
        }
      });
    }
  } catch (error) {
    console.error('Failed to update daily stats:', error);
  }
}