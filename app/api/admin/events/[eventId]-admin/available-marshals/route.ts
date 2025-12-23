import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET - Fetch available marshals for an event (not already registered)
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

    // Get event details to check marshal types
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        marshalTypes: true,
        attendances: {
          select: {
            userId: true
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Get registered user IDs
    const registeredUserIds = event.attendances.map((a: any) => a.userId)

    // Get available marshals (not registered for this event and match marshal types)
    const availableMarshals = await prisma.user.findMany({
      where: {
        role: "marshal",
        isActive: true,
        AND: [
          // Not already registered for this event
          {
            id: {
              notIn: registeredUserIds
            }
          },
          // Match marshal types (if event has specific types)
          ...(event.marshalTypes ? [{
            OR: event.marshalTypes.split(',').filter((t: string) => t.trim()).map((type: string) => ({
              marshalTypes: {
                contains: type.trim()
              }
            }))
          }] : [])
        ]
      },
      select: {
        id: true,
        employeeId: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        marshalTypes: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(availableMarshals)
  } catch (error) {
    console.error("Error fetching available marshals:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}