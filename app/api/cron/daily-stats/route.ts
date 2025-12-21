import { NextRequest, NextResponse } from 'next/server';
import { updateDailyStats } from '@/lib/monitoring';

export async function GET(request: NextRequest) {
  try {
    // التحقق من الـ secret للأمان
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET || 'dev-cron-secret';

    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.substring(7) !== expectedSecret) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // تحديث الإحصائيات اليومية
    await updateDailyStats();

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الإحصائيات اليومية',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error updating daily stats:', error);
    return NextResponse.json({ error: 'خطأ في تحديث الإحصائيات' }, { status: 500 });
  }
}

// يمكن استدعاء هذا عبر cron job مثل:
// curl -H "Authorization: Bearer YOUR_SECRET" https://your-domain.com/api/cron/daily-stats