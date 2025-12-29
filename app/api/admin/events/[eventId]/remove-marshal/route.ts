import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"

export async function DELETE(
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
    const { marshalId, reason } = await req.json()

    if (!marshalId) {
      return NextResponse.json({ error: "Marshal ID is required" }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx) => {
      const deleteResult = await tx.eventMarshal.deleteMany({
        where: {
          eventId: eventId,
          marshalId: marshalId
        }
      })

      const updateResult = await tx.attendance.updateMany({
        where: {
          eventId: eventId,
          userId: marshalId,
          status: { not: "cancelled" }
        },
        data: {
          status: "cancelled",
          cancelledAt: new Date(),
          cancellationReason: reason || "Removed by admin"
        }
      })

      return { deleteResult, updateResult }
    })

    return NextResponse.json({ success: true, result })

  } catch (error) {
    console.error("Error removing marshal:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}