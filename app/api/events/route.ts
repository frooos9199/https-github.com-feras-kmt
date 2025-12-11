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

    // Get user's marshal types
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { marshalTypes: true }
    })

    const userTypes = user?.marshalTypes ? user.marshalTypes.split(',').filter((t: string) => t) : []

    // Filter events based on user's marshal types
    // If user has no types, return no events
    if (userTypes.length === 0) {
      return NextResponse.json([])
    }

    // Get events that match at least one of the user's marshal types
    const allEvents = await prisma.event.findMany({
      where: {
        OR: userTypes.map((type: string) => ({
          marshalTypes: {
            contains: type.trim()
          }
        }))
      },
      orderBy: {
        date: "asc"
      },
      include: {
        attendances: true,
        _count: {
          select: {
            attendances: true
          }
        }
      }
    })
    return NextResponse.json(allEvents)
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
