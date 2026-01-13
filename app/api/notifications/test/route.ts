// API endpoint to send test notification
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        fcmToken: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.fcmToken) {
      return NextResponse.json({ 
        error: 'User has no FCM token', 
        message: 'User needs to login to the app first' 
      }, { status: 400 });
    }

    // Create notification in database
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'BROADCAST',
        titleEn: 'Background Test 🔔',
        titleAr: 'اختبار الخلفية 🔔',
        messageEn: 'Background notification test! Close the app and check if this appears.',
        messageAr: 'اختبار إشعار الخلفية! أغلق التطبيق وتحقق إذا يظهر.'
      }
    });

    // Send push notification
    const result = await sendPushNotification(
      [user.fcmToken],
      'Background Test 🔔',
      'Background notification test! Close the app and check if this appears.',
      { type: 'BROADCAST' }
    );

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email
      },
      result: {
        success: result.success,
        failure: result.failure
      },
      message: 'Notification sent! Close the app to test background delivery.'
    });

  } catch (error: any) {
    console.error('Error sending test notification:', error);
    return NextResponse.json({ 
      error: 'Failed to send notification',
      details: error.message 
    }, { status: 500 });
  }
}
