// تجربة إرسال مباشر من Vercel production بدون OAuth error
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// استيراد Firebase بشكل مباشر لتجربة
import admin from 'firebase-admin';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // التحقق من Firebase initialization
    console.log('[TEST] Firebase apps count:', admin.apps.length);
    console.log('[TEST] Firebase initialized:', admin.apps.length > 0);

    if (admin.apps.length === 0) {
      return NextResponse.json({
        error: 'Firebase not initialized',
        details: 'Admin SDK not set up'
      }, { status: 500 });
    }

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

    // محاولة الإرسال المباشر
    try {
      const response = await admin.messaging().send({
        token: user.fcmToken,
        notification: {
          title: 'Direct Test 🧪',
          body: 'Testing background notifications directly from Vercel'
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: 'Direct Test 🧪',
                body: 'Testing background notifications directly from Vercel'
              },
              sound: 'default',
              badge: 1
            }
          },
          headers: {
            'apns-priority': '10',
            'apns-push-type': 'alert'
          }
        },
        android: {
          priority: 'high',
          notification: {
            title: 'Direct Test 🧪',
            body: 'Testing background notifications directly from Vercel',
            sound: 'default'
          }
        }
      });

      console.log('[TEST] ✅ Firebase response:', response);

      return NextResponse.json({
        success: true,
        message: 'Notification sent successfully!',
        messageId: response,
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
