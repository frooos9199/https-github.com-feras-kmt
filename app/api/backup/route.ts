import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const users = await prisma.user.findMany()
    const events = await prisma.event.findMany()
    const attendances = await prisma.attendance.findMany()
    const notifications = await prisma.notification.findMany()

    const backup = {
      timestamp: new Date().toISOString(),
      data: {
        users: users.length,
        events: events.length,
        attendances: attendances.length,
        notifications: notifications.length,
      },
      users,
      events,
      attendances,
      notifications
    }

    return NextResponse.json(backup)
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 })
  }
}
