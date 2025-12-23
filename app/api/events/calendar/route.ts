import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"

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
      // Try JWT token
      const user = await getUserFromToken(req)
      if (user) {
        userId = user.id
        userRole = user.role
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only allow admin or marshal users
    if (userRole !== "admin" && userRole !== "marshal") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let events

    if (userRole === "admin") {
      // Admin can see all events (archived and non-archived)
      events = await prisma.event.findMany({
        orderBy: { date: "asc" },
        select: {
          id: true,
          titleEn: true,
          titleAr: true,
          date: true,
          endDate: true,
          time: true,
          endTime: true,
          location: true,
          isArchived: true
        }
      })
    } else {
      // Marshal can see events that match their types (including archived ones for calendar view)
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { marshalTypes: true }
      })

      const userTypes = user?.marshalTypes ? user.marshalTypes.split(',').filter((t: string) => t) : []

      if (userTypes.length === 0) {
        return NextResponse.json([])
      }

      events = await prisma.event.findMany({
        where: {
          OR: userTypes.map((type: string) => ({
            marshalTypes: {
              contains: type.trim()
            }
          }))
        },
        orderBy: { date: "asc" },
        select: {
          id: true,
          titleEn: true,
          titleAr: true,
          date: true,
          endDate: true,
          time: true,
          endTime: true,
          location: true,
          isArchived: true
        }
      })
    }

    return NextResponse.json(events)
  } catch (error) {
    console.error("Error fetching calendar events:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}