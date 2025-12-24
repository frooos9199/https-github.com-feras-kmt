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

    const { eventId: eventIdWithAdmin, userId } = await params
    // Remove '-admin' suffix from eventId for database queries
    const eventId = eventIdWithAdmin.replace('-admin', '')
    const body = await req.json()
    const { reason } = body

    console.log('[API] Remove Marshal Debug:', {
      eventId,
      eventIdWithAdmin,
      userId,
      reason,
      params: await params
    })

    // Always try to remove from both tables to ensure complete cleanup
    let removedFromEventMarshals = false
    let removedFromAttendances = false

    // First, try to find and remove from eventMarshals table
    const eventMarshals = await prisma.eventMarshal.findMany({
      where: {
        eventId: eventId,
        marshalId: userId
      },
      include: {
        marshal: {
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

    console.log('[API] EventMarshal search result:', {
      found: eventMarshals.length > 0,
      count: eventMarshals.length,
      eventMarshal: eventMarshals[0] ? {
        id: eventMarshals[0].id,
        status: eventMarshals[0].status,
        marshalId: eventMarshals[0].marshalId,
        eventId: eventMarshals[0].eventId
      } : null
    })

    // If found in eventMarshals, remove it and send email
    if (eventMarshals.length > 0) {
      const eventMarshal = eventMarshals[0]
      console.log('[API] Removing marshal from eventMarshals', { eventId, userId });

      // Send removal notification email BEFORE deletion
      if (eventMarshal.marshal.email) {
        console.log('[API] Sending removal email', { to: eventMarshal.marshal.email });
        await sendEmail({
          to: eventMarshal.marshal.email,
          subject: `⚠️ Removed from Event - ${eventMarshal.event.titleEn}`,
          html: removalEmailTemplate(
            eventMarshal.marshal.name,
            eventMarshal.event.titleEn,
            new Date(eventMarshal.event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            reason || undefined // Pass the removal reason
          )
        })
      }

      // Delete the eventMarshal record
      await prisma.eventMarshal.deleteMany({
        where: {
          eventId: eventId,
          marshalId: userId
        }
      })

      removedFromEventMarshals = true
      console.log('[API] Successfully removed marshal from eventMarshals');
    }

    // Now check attendances table and update status to cancelled
    const attendances = await prisma.attendance.findMany({
      where: {
        eventId: eventId,
        userId: userId,
        status: {
          not: "cancelled" // Only update if not already cancelled
        }
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

    console.log('[API] Attendance search result:', {
      found: attendances.length > 0,
      count: attendances.length,
      attendance: attendances[0] ? {
        id: attendances[0].id,
        status: attendances[0].status,
        userId: attendances[0].userId,
        eventId: attendances[0].eventId
      } : null
    })

    // If found in attendances and not already cancelled, update it
    if (attendances.length > 0) {
      const attendance = attendances[0]
      console.log('[API] Cancelling attendance', { eventId: eventId, userId });

      // Send removal notification email BEFORE update (only if not already sent for eventMarshals)
      if (!removedFromEventMarshals && attendance.user.email) {
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
      await prisma.attendance.updateMany({
        where: {
          eventId: eventId,
          userId: userId,
          status: {
            not: "cancelled" // Only update if not already cancelled
          }
        },
        data: {
          status: "cancelled",
          cancelledAt: new Date(),
          cancellationReason: reason || "Removed by admin"
        }
      })

      removedFromAttendances = true
      console.log('[API] Successfully cancelled attendance');
    }

    // Check if we actually removed/cancelled anything
    if (!removedFromEventMarshals && !removedFromAttendances) {
      console.log('[API] Marshal not found - may have already been removed or never existed', { eventId, userId });
      // Instead of returning 404, return success since the marshal is not in the event (desired state)
      return NextResponse.json({ success: true, message: "Marshal is not assigned to this event" })
    }

    console.log('[API] Marshal removal completed successfully', {
      removedFromEventMarshals,
      removedFromAttendances
    });

    return NextResponse.json({ success: true })
  } catch (error) {
  console.error("Error removing marshal:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
