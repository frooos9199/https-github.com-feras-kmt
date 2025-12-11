import { NextRequest, NextResponse } from 'next/server'
import { createNotification } from '@/lib/notifications'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { userId, titleEn, titleAr, messageEn, messageAr } = await req.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Check if user exists and has FCM token
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        name: true, 
        fcmToken: true 
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Send notification
    await createNotification({
      userId,
      type: 'NEW_EVENT',
      titleEn: titleEn || 'Test Notification',
      titleAr: titleAr || 'إشعار تجريبي',
      messageEn: messageEn || 'This is a test push notification from KMT System',
      messageAr: messageAr || 'هذا إشعار تجريبي من نظام KMT',
    })

    return NextResponse.json({
      success: true,
      message: 'Test notification sent successfully',
      user: {
        id: user.id,
        name: user.name,
        hasFcmToken: !!user.fcmToken
      }
    })
  } catch (error) {
    console.error('Error sending test notification:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}
