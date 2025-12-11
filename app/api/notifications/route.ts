/**
 * Notifications API - In-App Notifications for Mobile & Web
 * Authentication: NextAuth Session (Web) + JWT Token (Mobile App)
 * Last Updated: December 9, 2025
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"

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

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { isRead: false })
      },
      orderBy: { createdAt: "desc" },
      take: 50
    })

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
    
    await prisma.notification.delete({
      where: {
        id: notificationId,
        userId
      }
    })

    console.log('[DELETE API] ✅ Notification deleted successfully')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[DELETE API] 💥 Error deleting notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
