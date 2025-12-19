import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { sendEmail, removalEmailTemplate } from "@/lib/email"

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
    const body = await req.json()
    const { reason } = body

    // Get attendance details before update for email
    const attendance = await prisma.attendance.findFirst({
      where: {
        eventId: id,
        userId: userId
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        },
        event: {
          select: {
            titleEn: true,
            titleAr: true,
            date: true,
          }
        }
      }
    })

    if (!attendance) {
      return NextResponse.json({ error: "Attendance record not found" }, { status: 404 })
    }

    // Send removal notification email BEFORE update
    if (attendance.user.email) {
      await sendEmail({
        to: attendance.user.email,
        subject: `⚠️ Removed from Event - ${attendance.event.titleEn}`,
        html: removalEmailTemplate(
          attendance.user.name,
          attendance.event.titleEn,
          new Date(attendance.event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          reason || undefined // Pass the removal reason
        )
      })
    }

    // Update the attendance record to cancelled status with reason
    await prisma.attendance.updateMany({
      where: {
        eventId: id,
        userId: userId
      },
      data: {
        status: "cancelled",
        cancelledAt: new Date(),
        cancellationReason: reason || "Removed by admin"
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing marshal:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
