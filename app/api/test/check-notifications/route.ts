import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Get all notifications
    const notifications = await prisma.notification.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    // Get counts
    const total = await prisma.notification.count()
    const unread = await prisma.notification.count({
      where: { isRead: false }
    })

    return NextResponse.json({
      success: true,
      total,
      unread,
      notifications: notifications.map((n: any) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        isRead: n.isRead,
        createdAt: n.createdAt,
        user: {
          name: n.user.name,
          email: n.user.email,
          role: n.user.role
        }
      }))
    })
  } catch (error) {
    console.error("Error checking notifications:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}
