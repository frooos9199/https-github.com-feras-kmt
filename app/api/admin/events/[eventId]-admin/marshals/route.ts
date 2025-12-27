import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { sendEmail, addedToEventEmailTemplate } from "@/lib/email"
import { getUserFromToken } from "@/lib/auth"

// POST - Add marshal to event
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    console.log('[API] Add Marshal to Event', { params: await params, body: await req.clone().json() });
    let authUserId: string | null = null
    let userRole: string | null = null

    // Try NextAuth session
    const session = await getServerSession(authOptions)
    if (session?.user?.id) {
      authUserId = session.user.id
      userRole = session.user.role
    } else {
      // Try JWT token
      const user = await getUserFromToken(req)
      if (user) {
        authUserId = user.id
        userRole = user.role
      }
    }
    
    if (!authUserId || userRole !== "admin") {
  console.error('[API] Unauthorized add marshal', { session });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { eventId } = await params
    const body = await req.json()
    const { userId } = body

    if (!userId) {
  console.error('[API] No userId provided', { body });
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Check if user is already registered for this event
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        eventId: eventId,
        userId: userId
      }
    })

    if (existingAttendance) {
  console.error('[API] Marshal already registered', { eventId, userId });
      return NextResponse.json({ error: "Marshal is already registered for this event" }, { status: 400 })
    }

    // Get event and user details for email
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        titleEn: true,
        titleAr: true,
        date: true,
        time: true,
        location: true
      }
    })

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true
      }
    })

    if (!event || !user) {
  console.error('[API] Event or user not found', { event, user });
      return NextResponse.json({ error: "Event or user not found" }, { status: 404 })
    }

    // Create attendance record
    console.log('[API] Creating attendance', { userId, eventId: eventId });
    await prisma.attendance.create({
      data: {
        userId: userId,
        eventId: eventId,
        status: "approved" // Auto-approve when added by admin
      }
    })

    // Send notification email to marshal
    if (user.email) {
  console.log('[API] Sending add-to-event email', { to: user.email });
      await sendEmail({
        to: user.email,
        subject: `✅ Added to Event - ${event.titleEn}`,
        html: addedToEventEmailTemplate(
          user.name,
          event.titleEn,
          new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          event.time,
          event.location
        )
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
  console.error("Error adding marshal to event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}