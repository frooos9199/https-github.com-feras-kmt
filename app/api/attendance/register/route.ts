import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { notifyAdminsAboutNewRegistration } from "@/lib/notifications"
import { sendEmail, registrationEmailTemplate } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
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
          userId: session.user.id,
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
        userId: session.user.id,
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
        subject: `Registration Confirmation - ${attendance.event.titleEn}`,
        html: registrationEmailTemplate(
          attendance.user.name,
          attendance.event.titleEn,
          new Date(attendance.event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          attendance.event.time,
          'en'
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
