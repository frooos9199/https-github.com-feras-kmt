import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// GET - Get marshal's invitations
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const invitations = await prisma.eventMarshal.findMany({
      where: {
        marshalId: session.user.id,
        status: { in: ['invited', 'accepted', 'declined'] }
      },
      include: {
        event: {
          select: {
            id: true,
            titleEn: true,
            titleAr: true,
            date: true,
            time: true,
            location: true,
            marshalTypes: true,
            status: true
          }
        }
      },
      orderBy: {
        invitedAt: 'desc'
      }
    })

    return NextResponse.json({
      invitations: invitations.map((inv: any) => ({
        id: inv.id,
        status: inv.status,
        invitedAt: inv.invitedAt,
        respondedAt: inv.respondedAt,
        event: inv.event
      }))
    })

  } catch (error) {
    console.error('Error fetching marshal invitations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Respond to invitation (accept/decline)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { invitationId, action } = await request.json()

    if (!invitationId || !['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Get the invitation
    const invitation = await prisma.eventMarshal.findUnique({
      where: { id: invitationId },
      include: {
        event: true,
        marshal: true
      }
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    if (invitation.marshalId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (invitation.status !== 'invited') {
      return NextResponse.json({ error: 'Invitation already responded to' }, { status: 400 })
    }

    const newStatus = action === 'accept' ? 'accepted' : 'declined'

    // Update invitation status
    const updatedInvitation = await prisma.eventMarshal.update({
      where: { id: invitationId },
      data: {
        status: newStatus,
        respondedAt: new Date()
      },
      include: {
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

    // If accepted, create attendance record
    if (action === 'accept') {
      await prisma.attendance.create({
        data: {
          userId: session.user.id,
          eventId: invitation.eventId,
          status: 'approved' // Auto-approve when marshal accepts invitation
        }
      })
    }

    return NextResponse.json({
      success: true,
      invitation: {
        id: updatedInvitation.id,
        status: updatedInvitation.status,
        respondedAt: updatedInvitation.respondedAt,
        event: updatedInvitation.event
      }
    })

  } catch (error) {
    console.error('Error responding to invitation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}