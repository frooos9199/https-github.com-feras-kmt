import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"

export async function GET(req: NextRequest) {
  try {
    let userId: string | null = null
    let userRole: string | null = null

    // Try NextAuth session first
    const session = await getServerSession(authOptions)
    if (session?.user?.id) {
      userId = session.user.id
      userRole = session.user.role
    } else {
      // Try JWT from mobile app
      const authHeader = req.headers.get('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        try {
          // ✅ نفس الـ secret المستخدم في Login
          const jwtSecret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "dev-secret-key";
          const decoded = jwt.verify(token, jwtSecret) as { id: string, role: string }
          userId = decoded.id
          userRole = decoded.role
        } catch (jwtError) {
          console.error('JWT verification failed:', jwtError)
        }
      }
    }
    
    if (!userId || userRole !== "admin") {
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
