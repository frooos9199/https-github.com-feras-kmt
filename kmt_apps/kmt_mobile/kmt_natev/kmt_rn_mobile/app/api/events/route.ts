import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's marshal types
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { marshalTypes: true }
    })

    const userTypes = user?.marshalTypes ? user.marshalTypes.split(',').filter((t: string) => t) : []

    // Get all upcoming active events
    const allEvents = await prisma.event.findMany({
      where: {
        date: {
          gte: new Date()
        },
        status: "active"
      },
      orderBy: {
        date: "asc"
      },
      include: {
        attendances: {
          where: {
            userId: session.user.id
          }
        },
        _count: {
          select: {
            attendances: {
              where: {
                status: "approved"
              }
            }
          }
        }
      }
    })

    // Filter events based on user's marshal types
    const filteredEvents = allEvents.filter((event: any) => {
      if (!event.marshalTypes) return false
      const eventTypes = event.marshalTypes.split(',').filter((t: string) => t)
      // Check if user has at least one matching type
      return eventTypes.some((eventType: string) => userTypes.includes(eventType))
    })

    return NextResponse.json(filteredEvents)
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
