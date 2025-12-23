import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    let userId: string | null = null

    // Try NextAuth session
    const session = await getServerSession(authOptions)
    if (session?.user?.id) {
      userId = session.user.id
    } else {
      // Try JWT token
      const user = await getUserFromToken(req)
      if (user) {
        userId = user.id
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get events where the user has registered or been approved
    const events = await prisma.event.findMany({
      where: {
        attendances: {
          some: {
            userId: userId,
            status: {
              in: ["registered", "approved"]
            }
          }
        }
      },
      orderBy: {
        date: "asc"
      },
      include: {
        attendances: {
          where: {
            userId: userId
          }
        },
        _count: {
          select: {
            attendances: true
          }
        }
      }
    })

    // Add approved and rejected counts to each event
    const eventsWithCounts = await Promise.all(events.map(async (event) => {
      const approvedCount = await prisma.attendance.count({
        where: {
          eventId: event.id,
          status: "approved"
        }
      })
      const rejectedCount = await prisma.attendance.count({
        where: {
          eventId: event.id,
          status: "rejected"
        }
      })
      return {
        ...event,
        approvedCount,
        rejectedCount
      }
    }))

    return NextResponse.json(eventsWithCounts)
  } catch (error) {
    console.error("Error fetching my attendance events:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}