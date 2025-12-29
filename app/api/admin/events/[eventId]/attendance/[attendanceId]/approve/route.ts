import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// POST - Approve attendance request
export async function POST(
  req: Request,
  { params }: { params: Promise<{ eventId: string; attendanceId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { eventId, attendanceId } = await params

    // الحصول على بيانات الحدث
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // استخدام النظام الموحد لحساب المارشالات
    const { getEventMarshalCount } = await import('@/lib/marshal-count')
    const marshalCount = await getEventMarshalCount(eventId)
    
    if (marshalCount.accepted >= event.maxMarshals) {
      return NextResponse.json({ error: 'Event is at maximum capacity' }, { status: 400 })
    }

    // Update attendance status to approved
    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendanceId },
      data: { status: 'approved' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeId: true
          }
        },
        event: {
          select: {
            id: true,
            titleEn: true,
            titleAr: true
          }
        }
      }
    })

    // Create EventMarshal record for approved attendance
    await prisma.eventMarshal.upsert({
      where: {
        eventId_marshalId: {
          eventId: updatedAttendance.eventId,
          marshalId: updatedAttendance.userId
        }
      },
      update: {
        status: 'approved',
        respondedAt: new Date()
      },
      create: {
        eventId: updatedAttendance.eventId,
        marshalId: updatedAttendance.userId,
        status: 'approved',
        invitedAt: new Date(),
        respondedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      attendance: updatedAttendance
    })

  } catch (error) {
    console.error('Error approving attendance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}