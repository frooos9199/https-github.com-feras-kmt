import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET - Fetch pending requests for event
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { eventId } = await params

    // Get pending attendances
    const pendingAttendances = await prisma.attendance.findMany({
      where: { 
        eventId,
        status: 'pending'
      },
      select: {
        id: true,
        userId: true,
        status: true,
        registeredAt: true,
        user: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            email: true,
            phone: true,
            image: true
          }
        }
      },
      orderBy: {
        registeredAt: 'desc'
      }
    })

    // Get pending invitations
    const pendingInvitations = await prisma.eventMarshal.findMany({
      where: { 
        eventId,
        status: 'invited'
      },
      select: {
        id: true,
        status: true,
        invitedAt: true,
        respondedAt: true,
        marshal: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            email: true,
            phone: true,
            image: true,
            marshalTypes: true
          }
        }
      },
      orderBy: {
        invitedAt: 'desc'
      }
    })

    return NextResponse.json({
      pendingAttendances,
      pendingInvitations
    })

  } catch (error) {
    console.error("Error fetching pending requests:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}