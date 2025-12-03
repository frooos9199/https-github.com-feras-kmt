import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-utils"

/**
 * GET /api/dashboard/events
 * Returns all events for marshals
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Marshal can see all active events
    const events = await prisma.event.findMany({
      where: {
        status: {
          in: ["active", "completed"]
        }
      },
      orderBy: {
        date: "asc"
      },
      include: {
        attendances: {
          select: {
            id: true,
            userId: true,
            status: true
          }
        }
      }
    })

    // Add registration status for current user
    const eventsWithStatus = events.map(event => {
      const userAttendance = event.attendances.find(a => a.userId === user.id)
      return {
        ...event,
        registrationStatus: userAttendance?.status || null,
        attendanceId: userAttendance?.id || null,
        registeredCount: event.attendances.filter(a => a.status === 'approved').length,
        totalAttendances: event.attendances.length
      }
    })

    return NextResponse.json(eventsWithStatus)
  } catch (error) {
    console.error("[Dashboard Events] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
