import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { sendEmail, marshalCancellationEmailTemplate } from "@/lib/email"
import { createNotification } from "@/lib/notifications"
import { getUserFromToken } from "@/lib/auth"

export async function POST(req: NextRequest) {
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
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { attendanceId, reason } = await req.json()

    if (!attendanceId) {
      return NextResponse.json(
        { error: "Attendance ID is required" },
        { status: 400 }
      )
    }

    // Get attendance record
    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: {
        event: true,
        user: true
      }
    })

    if (!attendance) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 }
      )
    }

    // Verify the attendance belongs to the current user
    if (attendance.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized to cancel this registration" },
        { status: 403 }
      )
    }

    // Check if event has already passed
    const eventDate = new Date(attendance.event.date)
    const now = new Date()
    if (eventDate < now) {
      return NextResponse.json(
        { error: "Cannot cancel registration for past events" },
        { status: 400 }
      )
    }

    // Check if already cancelled
    if (attendance.status === "cancelled") {
      return NextResponse.json(
        { error: "Registration already cancelled" },
        { status: 400 }
      )
    }

    // Update attendance status to cancelled and add reason to notes
    await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        status: "cancelled",
        notes: `CANCELLED: ${reason || "No reason provided"}`
      }
    })

    // Get all admins
    const admins = await prisma.user.findMany({
      where: { role: "admin" }
    })

    // Format event date
    const eventDateFormatted = new Date(attendance.event.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Send email notifications to all admins
    const emailPromises = admins
      .filter((admin: any) => admin.email)
      .map((admin: any) =>
        sendEmail({
          to: admin.email!,
          subject: `Marshal Cancelled Registration: ${attendance.event.titleEn}`,
          html: marshalCancellationEmailTemplate(
            admin.name,
            attendance.user.name,
            attendance.user.email || 'No email',
            attendance.event.titleEn,
            eventDateFormatted,
            reason || "No reason provided"
          )
        }).catch(err => {
          console.error(`Failed to send cancellation email to admin ${admin.email}:`, err)
          return null
        })
      )

    await Promise.allSettled(emailPromises)

    // Create in-app notifications for all admins
    const reasonText = reason || "No reason provided"
    const notificationPromises = admins.map((admin: any) =>
      createNotification({
        userId: admin.id,
        type: "EVENT_UPDATED",
        titleEn: `Marshal Cancelled: ${attendance.event.titleEn}`,
        titleAr: `مارشال ألغى: ${attendance.event.titleAr}`,
        messageEn: `${attendance.user.name} cancelled their registration for ${attendance.event.titleEn}.\n\nReason: ${reasonText}`,
        messageAr: `${attendance.user.name} ألغى تسجيله في ${attendance.event.titleAr}.\n\nالسبب: ${reasonText}`
      })
    )

    await Promise.all(notificationPromises)

    return NextResponse.json({
      success: true,
      message: "Registration cancelled successfully"
    })

  } catch (error) {
    console.error("Cancel attendance error:", error)
    return NextResponse.json(
      { error: "Failed to cancel registration" },
      { status: 500 }
    )
  }
}
