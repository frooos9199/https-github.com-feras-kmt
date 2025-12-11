import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { notifyAdminsAboutNewRegistration } from "@/lib/notifications"
import { sendEmail, registrationEmailTemplate } from "@/lib/email"
import { getUserFromToken } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    let userId: string | null = null
    let userEmail: string | null = null

    // Try NextAuth session
    const session = await getServerSession(authOptions)
    if (session?.user?.id) {
      userId = session.user.id
      userEmail = session.user.email || null
    } else {
      // Try JWT token
      const user = await getUserFromToken(req)
      if (user) {
        userId = user.id
        userEmail = user.email || null
      }
    }
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { eventId } = await req.json()

    // Get event details with max marshals
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        maxMarshals: true,
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

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check if event is full (only approved attendances count)
    if (event._count.attendances >= event.maxMarshals) {
      return NextResponse.json(
        { 
          error: "Event is full - Cannot register more marshals",
          errorAr: "الفعالية مكتملة - لا يمكن التسجيل",
          currentCount: event._count.attendances,
          maxMarshals: event.maxMarshals
        },
        { status: 400 }
      )
    }

    // Check if already registered
    const existing = await prisma.attendance.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId: eventId
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: "Already registered for this event" },
        { status: 400 }
      )
    }

    // Create attendance
    const attendance = await prisma.attendance.create({
      data: {
        userId,
        eventId: eventId,
        status: "pending"
      },
      include: {
        user: true,
        event: true
      }
    })

    // Notify admins about new registration
    await notifyAdminsAboutNewRegistration(
      attendance.user.name,
      attendance.event.titleEn,
      attendance.event.titleAr,
      eventId
    )

    // Send confirmation email to user
    if (attendance.user.email) {
      await sendEmail({
        to: attendance.user.email,
        subject: `📋 Registration Confirmation - ${attendance.event.titleEn}`,
        html: registrationEmailTemplate(
          attendance.user.name,
          attendance.event.titleEn,
          new Date(attendance.event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          attendance.event.time,
          attendance.event.endDate ? new Date(attendance.event.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : undefined,
          attendance.event.endTime || undefined
        )
      })
    }

    return NextResponse.json(attendance, { status: 201 })
  } catch (error) {
    console.error("Error registering attendance:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
