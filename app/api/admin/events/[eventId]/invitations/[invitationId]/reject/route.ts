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
    console.log('🚫 REJECT API CALLED - params:', await params)
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      console.log('❌ REJECT UNAUTHORIZED - session:', !!session, 'role:', session?.user?.role)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { eventId, invitationId } = await params
    console.log('📝 REJECT - eventId:', eventId, 'invitationId:', invitationId)

    // Find the invitation
    const invitation = await prisma.eventMarshal.findUnique({
      where: { id: invitationId },
      include: { event: true, marshal: true }
    })

    console.log('🔍 REJECT - Found invitation:', !!invitation, 'status:', invitation?.status)

    if (!invitation) {
      console.log('❌ REJECT - Invitation not found')
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    if (invitation.eventId !== eventId) {
      console.log('❌ REJECT - Invitation does not belong to this event')
      return NextResponse.json({ error: 'Invitation does not belong to this event' }, { status: 400 })
    }

    // Delete the invitation completely
    console.log('🗑️ REJECT - Deleting invitation:', invitationId)
    await prisma.eventMarshal.delete({
      where: { id: invitationId }
    })
    console.log('✅ REJECT - Invitation deleted successfully')

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
      eventMarshals
    })

  } catch (error) {
    console.error('Error rejecting invitation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}