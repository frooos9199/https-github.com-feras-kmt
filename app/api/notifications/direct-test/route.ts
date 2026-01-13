// تجربة إرسال مباشر من Vercel production بدون OAuth error
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendFCMNotification } from '@/lib/fcm-direct';

export async function POST(request: Request) {
  try {
    const { email, mode } = await request.json();
    const pushMode = (mode === 'silent' || mode === 'alert') ? mode : 'alert';

    console.log(`[TEST] Using direct FCM API (mode=${pushMode})`);

    // العثور على المستخدم
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        fcmToken: true
      }
    });

    if (!user || !user.fcmToken) {
      return NextResponse.json({
        error: 'User not found or no FCM token'
      }, { status: 404 });
    }

    console.log('[TEST] Attempting to send to token:', user.fcmToken.substring(0, 20) + '...');

    // محاولة الإرسال المباشر باستخدام FCM API
    try {
      const title = pushMode === 'silent' ? 'Silent Test' : 'Direct Test 🧪';
      const body = pushMode === 'silent'
        ? 'Background (content-available) test'
        : 'Testing notifications directly from Vercel';

      const response = await sendFCMNotification(
        pushMode === 'silent'
          ? {
              token: user.fcmToken,
              // Silent/background push: no notification payload.
              data: {
                type: 'DIRECT_TEST_SILENT',
                ts: new Date().toISOString(),
              },
              apns: {
                payload: {
                  aps: {
                    'content-available': 1,
                  },
                },
                headers: {
                  // Background pushes should be low priority.
                  'apns-priority': '5',
                  'apns-push-type': 'background',
                },
              },
            }
          : {
              token: user.fcmToken,
              notification: { title, body },
              apns: {
                payload: {
                  aps: {
                    alert: { title, body },
                    sound: 'default',
                    badge: 1,
                  },
                },
                headers: {
                  'apns-priority': '10',
                  'apns-push-type': 'alert',
                },
              },
            }
      );

      console.log('[TEST] ✅ Firebase response:', response);

      return NextResponse.json({
        success: true,
        message: 'Notification sent successfully!',
        messageId: response,
        mode: pushMode,
        user: {
          name: user.name,
          email: user.email
        }
      });

    } catch (firebaseError: any) {
      console.error('[TEST] ❌ Firebase error:', firebaseError);
      
      return NextResponse.json({
        error: 'Firebase send failed',
        code: firebaseError.code,
        message: firebaseError.message,
        details: firebaseError.toString()
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('[TEST] ❌ General error:', error);
    
    return NextResponse.json({
      error: 'Request failed',
      message: error.message
    }, { status: 500 });
  }
}
