import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get total marshals
    const totalMarshals = await prisma.user.count({
      where: { role: "marshal" }
    })

    // Get total events
    const totalEvents = await prisma.event.count()

    // Get pending attendance requests
    const pendingAttendance = await prisma.attendance.count({
      where: { status: "pending" }
    })

    // Get upcoming events
    const upcomingEvents = await prisma.event.count({
      where: {
        date: { gte: new Date() },
        status: "active"
      }
    })

    // Get recent activity (last 10 attendance requests)
    const recentActivity = await prisma.attendance.findMany({
      take: 10,
      orderBy: { registeredAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            employeeId: true,
          }
        },
        event: {
          select: {
            titleEn: true,
            titleAr: true,
          }
        }
      }
    })

    return NextResponse.json({
      totalMarshals,
      totalEvents,
      pendingAttendance,
      upcomingEvents,
      recentActivity,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
