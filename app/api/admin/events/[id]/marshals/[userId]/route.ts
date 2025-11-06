import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// DELETE - Remove marshal from event
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, userId } = await params

    await prisma.attendance.deleteMany({
      where: {
        eventId: id,
        userId: userId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing marshal:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
