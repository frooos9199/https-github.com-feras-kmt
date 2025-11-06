import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { notifyAdminsAboutNewRegistration } from "@/lib/notifications"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { eventId } = await req.json()

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

    return NextResponse.json(attendance, { status: 201 })
  } catch (error) {
    console.error("Error registering attendance:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
