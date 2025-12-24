import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; invitationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { eventId, invitationId } = await params

    // Find the invitation
    const invitation = await prisma.eventMarshal.findUnique({
      where: { id: invitationId },
      include: { event: true, marshal: true }
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    if (invitation.eventId !== eventId) {
      return NextResponse.json({ error: 'Invitation does not belong to this event' }, { status: 400 })
    }

    // Update the invitation status to accepted (allow updates even if already responded)

    // Update the invitation status to accepted
    const updatedInvitation = await prisma.eventMarshal.update({
      where: { id: invitationId },
      data: {
        status: 'accepted',
        respondedAt: new Date()
      },
      include: {
        marshal: true
      }
    })

    // Get updated event marshals for the response
    const eventMarshals = await prisma.eventMarshal.findMany({
      where: { eventId },
      include: {
        marshal: true
      },
      orderBy: { invitedAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      invitation: updatedInvitation,
      eventMarshals
    })

  } catch (error) {
    console.error('Error accepting invitation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}