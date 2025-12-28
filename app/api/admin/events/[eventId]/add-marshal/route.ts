import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getUserFromToken } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    let userId: string | null = null
    let userRole: string | null = null

    // Try NextAuth session
    const session = await getServerSession(authOptions)
    if (session?.user?.id) {
      userId = session.user.id
      userRole = session.user.role
    } else {
      // Try JWT token
      const user = await getUserFromToken(request)
      if (user) {
        userId = user.id
        userRole = user.role
      }
    }
    
    if (!userId || userRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { eventId } = await params
    const { marshalId } = await request.json()

    if (!marshalId) {
      return NextResponse.json({ error: 'Marshal ID is required' }, { status: 400 })
    }

    // التحقق من وجود الحدث والحد الأقصى
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

    // التحقق من وجود المارشال
    const marshal = await prisma.user.findUnique({
      where: { id: marshalId },
      select: { id: true, name: true, marshalTypes: true }
    })

    if (!marshal) {
      return NextResponse.json({ error: 'Marshal not found' }, { status: 404 })
    }

    // التحقق من توافق أنواع المارشال مع الحدث
    const eventTypes = event.marshalTypes.split(',').filter(t => t.trim())
    const marshalTypes = marshal.marshalTypes ? marshal.marshalTypes.split(',').map(t => t.trim()) : []

    const hasMatchingType = eventTypes.some(eventType =>
      marshalTypes.includes(eventType)
    )

    if (!hasMatchingType) {
      return NextResponse.json({
        error: 'Marshal type does not match event requirements'
      }, { status: 400 })
    }

    // التحقق من عدم وجود المارشال مسبقاً في الحدث
    const existingEntry = await prisma.eventMarshal.findUnique({
      where: {
        eventId_marshalId: {
          eventId,
          marshalId
        }
      }
    })

    if (existingEntry) {
      return NextResponse.json({
        error: 'Marshal is already added to this event'
      }, { status: 400 })
    }

    // إضافة المارشال مباشرة مع حالة "accepted"
    const eventMarshal = await prisma.eventMarshal.create({
      data: {
        eventId,
        marshalId,
        status: 'accepted', // إضافة مباشرة وليس دعوة
        invitedAt: new Date(),
        respondedAt: new Date()
      },
      include: {
        marshal: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            marshalTypes: true,
            employeeId: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      eventMarshal: {
        id: eventMarshal.id,
        status: eventMarshal.status,
        invitedAt: eventMarshal.invitedAt,
        respondedAt: eventMarshal.respondedAt,
        marshal: eventMarshal.marshal
      }
    })

  } catch (error) {
    console.error('Error adding marshal directly:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}