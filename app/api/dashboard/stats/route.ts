import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET - Fetch marshal dashboard stats
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Count upcoming events
    const upcomingEvents = await prisma.event.count({
      where: {
        date: {
          gte: new Date().toISOString().split('T')[0]
        },
        status: "active"
      }
    })

    // Count user's total attendance
    const myAttendance = await prisma.attendance.count({
      where: {
        userId: session.user.id
      }
    })

    // Count pending requests for this user
    const pendingRequests = await prisma.attendance.count({
      where: {
        userId: session.user.id,
        status: "pending"
      }
    })

    return NextResponse.json({
      upcomingEvents,
      myAttendance,
      pendingRequests
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
