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

    // Get attendance details before deletion for email
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

    // Send removal notification email BEFORE deletion
    if (attendance?.user.email) {
      await sendEmail({
        to: attendance.user.email,
        subject: `⚠️ Removed from Event - ${attendance.event.titleEn}`,
        html: removalEmailTemplate(
          attendance.user.name,
          attendance.event.titleEn,
          new Date(attendance.event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          undefined // notes - can be added later if needed
        )
      })
    }

    // Delete the attendance record AFTER sending email
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
