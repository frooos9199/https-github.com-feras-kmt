import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { sendEmail, removalEmailTemplate } from "@/lib/email"

// DELETE - Remove marshal from event
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string; userId: string }> }
) {
  try {
    console.log('[API] Remove Marshal from Event', { params: await params, body: await req.clone().json() });
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
  console.error('[API] Unauthorized remove marshal', { session });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { eventId, userId } = await params
    const body = await req.json()
    const { reason } = body

    // Get attendance details before update for email
    const attendance = await prisma.attendance.findFirst({
      where: {
        eventId: eventId,
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
  console.error('[API] Attendance record not found', { eventId, userId });
      return NextResponse.json({ error: "Attendance record not found" }, { status: 404 })
    }

    // Send removal notification email BEFORE update
    if (attendance.user.email) {
  console.log('[API] Sending removal email', { to: attendance.user.email });
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
    console.log('[API] Cancelling attendance', { eventId: eventId, userId });
    await prisma.attendance.updateMany({
      where: {
        eventId: eventId,
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
