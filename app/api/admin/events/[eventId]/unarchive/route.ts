import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"

export const dynamic = 'force-dynamic'

// PATCH - Unarchive event
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    let userId: string | null = null
    let userRole: string | null = null

    const session = await getServerSession(authOptions)
    if (session?.user?.id) {
      userId = session.user.id
      userRole = session.user.role
    } else {
      const user = await getUserFromToken(req)
      if (user) {
        userId = user.id
        userRole = user.role
      }
    }
    
    if (!userId || userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { eventId } = await params

    const event = await prisma.event.update({
      where: { id: eventId },
      data: { isArchived: false }
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error("Error unarchiving event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}