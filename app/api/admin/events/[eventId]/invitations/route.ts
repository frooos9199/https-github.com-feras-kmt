import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getUserFromToken } from '@/lib/auth'

export async function GET(
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
      console.log('❌ Unauthorized - session:', !!session, 'role:', session?.user?.role)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { eventId } = await params
    console.log('📝 eventId:', eventId)

    // Get event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        titleEn: true,
        titleAr: true,
        marshalTypes: true,
        maxMarshals: true
      }
    })

    console.log('📋 Event found:', event)

    if (!event) {
      console.log('❌ Event not found')
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Get marshals with matching types
    const eventTypes = event.marshalTypes.split(',').filter(t => t.trim())
    console.log('🏷️ Event types:', eventTypes)

    if (eventTypes.length === 0) {
      console.log('⚠️ No event types found, returning empty list')
      return NextResponse.json({
        event,
        invitedMarshals: [],
        availableMarshals: []
      })
    }

    // Get marshals who match the event types
    const availableMarshals = await prisma.user.findMany({
      where: {
        role: 'marshal',
        isActive: true,
        marshalTypes: {
          not: ''
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        marshalTypes: true,
        employeeId: true
      }
    })

    console.log('👥 All marshals found:', availableMarshals.length)

    // Filter marshals who have matching types
    const matchingMarshals = availableMarshals.filter(marshal => {
      if (!marshal.marshalTypes) return false
      const marshalTypes = marshal.marshalTypes.split(',').map(t => t.trim())
      return eventTypes.some(eventType =>
        marshalTypes.includes(eventType.trim())
      )
    })

    console.log('✅ Matching marshals:', matchingMarshals.length)
    console.log('📊 Final result - availableMarshals count:', matchingMarshals.length)

    // Get already invited marshals for this event
    const invitedMarshals = await prisma.eventMarshal.findMany({
      where: { eventId },
      include: {
        marshal: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            marshalTypes: true,
            employeeId: true
          }
        }
      }
    })

    // Separate accepted and pending invitations
    const acceptedInvitations = invitedMarshals.filter(im => im.status === 'accepted')
    const pendingInvitations = invitedMarshals.filter(im => im.status === 'invited')

    // Get marshals who haven't been invited yet
    const invitedMarshalIds = invitedMarshals.map(im => im.marshalId)
    const notInvitedMarshals = matchingMarshals.filter(marshal =>
      !invitedMarshalIds.includes(marshal.id)
    )

    return NextResponse.json({
      event,
      acceptedInvitations: acceptedInvitations.map(im => ({
        id: im.id,
        status: im.status,
        invitedAt: im.invitedAt,
        respondedAt: im.respondedAt,
        marshal: im.marshal
      })),
      pendingInvitations: pendingInvitations.map(im => ({
        id: im.id,
        status: im.status,
        invitedAt: im.invitedAt,
        marshal: im.marshal
      })),
      availableMarshals: notInvitedMarshals
    })

  } catch (error) {
    console.error('Error fetching event marshals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Invite marshal to event
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

    // Check if already invited
    const existingInvitation = await prisma.eventMarshal.findUnique({
      where: {
        eventId_marshalId: {
          eventId,
          marshalId
        }
      }
    })

    if (existingInvitation) {
      return NextResponse.json({ error: 'Marshal already invited' }, { status: 400 })
    }

    // Check event capacity before inviting - use unified counting
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const { calculateMarshalCount } = await import('@/lib/marshal-count')
    const currentCount = await calculateMarshalCount(eventId)
    
    if (currentCount >= event.maxMarshals) {
      return NextResponse.json({ error: 'Event is at maximum capacity' }, { status: 400 })
    }

    // Check marshal type compatibility
    const eventTypes = event.marshalTypes.split(',').filter(t => t.trim())
    const marshal = await prisma.user.findUnique({
      where: { id: marshalId },
      select: { marshalTypes: true }
    })

    if (!marshal || !marshal.marshalTypes) {
      return NextResponse.json({ error: 'Marshal not found or has no types' }, { status: 400 })
    }

    const marshalTypes = marshal.marshalTypes.split(',').map(t => t.trim())
    const hasMatchingType = eventTypes.some(eventType =>
      marshalTypes.includes(eventType.trim())
    )

    if (!hasMatchingType) {
      return NextResponse.json({ error: 'Marshal type does not match event requirements' }, { status: 400 })
    }

    // Create invitation
    const invitation = await prisma.eventMarshal.create({
      data: {
        eventId,
        marshalId,
        status: 'invited'
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
        },
        event: {
          select: {
            titleEn: true,
            titleAr: true,
            date: true,
            time: true,
            location: true
          }
        }
      }
    })

    // Send notification to marshal
    try {
      // Create in-app notification
      await prisma.notification.create({
        data: {
          userId: marshalId,
          type: 'INVITATION',
          titleEn: 'Event Invitation',
          titleAr: 'دعوة فعالية',
          messageEn: `You have been invited to "${invitation.event.titleEn}" on ${new Date(invitation.event.date).toLocaleDateString()}.`,
          messageAr: `تم دعوتك إلى "${invitation.event.titleAr || invitation.event.titleEn}" في ${new Date(invitation.event.date).toLocaleDateString('ar-EG')}.`,
          eventId
        }
      })

      // Send push notification if marshal has FCM token
      const marshalWithToken = await prisma.user.findUnique({
        where: { id: marshalId },
        select: { fcmToken: true }
      })

      if (marshalWithToken?.fcmToken) {
        const { sendPushNotification } = await import('@/lib/firebase-admin')
        await sendPushNotification(
          [marshalWithToken.fcmToken],
          'Event Invitation',
          `You have been invited to "${invitation.event.titleEn}" on ${new Date(invitation.event.date).toLocaleDateString()}.`,
          {
            type: 'INVITATION',
            eventId,
            invitationId: invitation.id
          }
        )
      }
    } catch (notificationError) {
      console.error('Error sending invitation notification:', notificationError)
      // Don't fail the invitation if notification fails
    }

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        status: invitation.status,
        invitedAt: invitation.invitedAt,
        marshal: invitation.marshal
      }
    })

  } catch (error) {
    console.error('Error inviting marshal:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}