import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET - Fetch marshal dashboard stats
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    console.log('🔐 Dashboard Stats - Session:', { 
      hasSession: !!session, 
      userId: session?.user?.id,
      userEmail: session?.user?.email 
    })
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Count upcoming events
    const today = new Date()
    today.setHours(0, 0, 0, 0) // بداية اليوم
    
    const upcomingEvents = await prisma.event.count({
      where: {
        date: {
          gte: today
        },
        status: "active"
      }
    })

    // Count user's total attendance (approved only)
    const myAttendance = await prisma.attendance.count({
      where: {
        userId: session.user.id,
        status: "approved"
      }
    })

    // Count pending requests for this user
    const pendingRequests = await prisma.attendance.count({
      where: {
        userId: session.user.id,
        status: "pending"
      }
    })

    console.log('📊 Dashboard Stats:', { upcomingEvents, myAttendance, pendingRequests, userId: session.user.id })

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
