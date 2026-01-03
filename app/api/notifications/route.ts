/**
 * Notifications API - In-App Notifications for Mobile & Web
 * Authentication: NextAuth Session (Web) + JWT Token (Mobile App)
 * Performance: Cached responses, optimized queries
 * Last Updated: December 21, 2025
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"
import { unstable_cache, revalidatePath } from 'next/cache'

// Cached function to get notifications - يقلل من الاستعلامات لقاعدة البيانات
const getNotificationsCached = unstable_cache(
  async (userId: string, unreadOnly: boolean) => {
    return await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { isRead: false })
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { // نحدد الحقول المطلوبة فقط لتحسين الأداء
        id: true,
        type: true,
        titleEn: true,
        titleAr: true,
        messageEn: true,
        messageAr: true,
        eventId: true,
        isRead: true,
        createdAt: true
      },
      include: {
        event: {
          select: {
            id: true,
            date: true,
            startDate: true,
            titleEn: true,
            titleAr: true
          }
        }
      }
    })
  },
  ['notifications'],
  { revalidate: 30 } // Cache for 30 seconds
)

// GET - Fetch user notifications
export async function GET(request: NextRequest) {
  try {
    let userId: string | null = null

    // Try NextAuth session first (web)
    const session = await getServerSession(authOptions)
    if (session?.user?.id) {
      userId = session.user.id
    } else {
      // Try JWT token (mobile app)
      const user = await getUserFromToken(request)
      if (user) {
        userId = user.id
      }
    }
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get("unreadOnly") === "true"

    // استخدام الدالة المحسنة مع caching
    const notifications = await getNotificationsCached(userId, unreadOnly)

    return NextResponse.json(notifications)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH - Mark notification(s) as read
export async function PATCH(request: NextRequest) {
  try {
    let userId: string | null = null

    // Try NextAuth session first (web)
    const session = await getServerSession(authOptions)
    if (session?.user?.id) {
      userId = session.user.id
    } else {
      // Try JWT token (mobile app)
      const user = await getUserFromToken(request)
      if (user) {
        userId = user.id
      }
    }
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { notificationId, markAllAsRead } = body

    if (markAllAsRead) {
      // Mark all user notifications as read
      await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false
        },
        data: { isRead: true }
      })
    } else if (notificationId) {
      // Mark specific notification as read
      await prisma.notification.update({
        where: {
          id: notificationId,
          userId
        },
        data: { isRead: true }
      })
    } else {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    // Invalidate cache بعد التحديث
    revalidatePath('/api/notifications')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete notification
export async function DELETE(request: NextRequest) {
  try {
    let userId: string | null = null

    // Try NextAuth session first (web)
    const session = await getServerSession(authOptions)
    if (session?.user?.id) {
      userId = session.user.id
    } else {
      // Try JWT token (mobile app)
      const user = await getUserFromToken(request)
      if (user) {
        userId = user.id
      }
    }
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let notificationId: string | null = null
    
    // Try to read body first (for mobile app)
    try {
      const contentType = request.headers.get("content-type")
      if (contentType?.includes("application/json")) {
        const body = await request.json()
        notificationId = body.notificationId
        console.log('[DELETE API] Got notificationId from body:', notificationId)
      }
    } catch (e) {
      console.log('[DELETE API] No JSON body found')
    }
    
    // If not in body, try query params (for web)
    if (!notificationId) {
      const { searchParams } = new URL(request.url)
      notificationId = searchParams.get("id")
      if (notificationId) {
        console.log('[DELETE API] Got notificationId from query:', notificationId)
      }
    }

    if (!notificationId) {
      console.error('[DELETE API] ❌ Notification ID required')
      return NextResponse.json({ error: "Notification ID required" }, { status: 400 })
    }

    console.log('[DELETE API] 🗑️ Deleting notification:', notificationId, 'for user:', userId)
    
    // First check if notification exists and belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { userId: true }
    })
    
    if (!notification) {
      console.log('[DELETE API] ⚠️ Notification was already deleted')
      return NextResponse.json({ success: true })
    }
    
    if (notification.userId !== userId) {
      console.error('[DELETE API] ❌ Unauthorized: notification does not belong to user')
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    
    // Now delete the notification
    await prisma.notification.delete({
      where: {
        id: notificationId
      }
    })

    // Invalidate cache بعد الحذف
    revalidatePath('/api/notifications')

    console.log('[DELETE API] ✅ Notification deleted successfully')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[DELETE API] 💥 Error deleting notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
