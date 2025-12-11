import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"

// GET - Fetch single event with registered marshals
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
      const user = await getUserFromToken(req)
      if (user) {
        userId = user.id
        userRole = user.role
      }
    }
    
    if (!userId || userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        attendances: {
          where: {
            status: 'approved' // Only show approved attendances
          },
          include: {
            user: {
              select: {
                id: true,
                employeeId: true,
                name: true,
                email: true,
                phone: true,
                image: true
              }
            }
          }
        },
        _count: {
          select: { 
            attendances: {
              where: {
                status: 'approved' // Only count approved attendances
              }
            }
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH - Update event
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
      const user = await getUserFromToken(req)
      if (user) {
        userId = user.id
        userRole = user.role
      }
    }
    
    if (!userId || userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { 
      titleEn, 
      titleAr, 
      descriptionEn, 
      descriptionAr, 
      date,
      endDate, 
      time, 
      endTime,
      location, 
      marshalTypes, 
      maxMarshals, 
      status 
    } = body

    const updateData: any = {}
    if (titleEn) updateData.titleEn = titleEn
    if (titleAr) updateData.titleAr = titleAr
    if (descriptionEn) updateData.descriptionEn = descriptionEn
    if (descriptionAr) updateData.descriptionAr = descriptionAr
    if (date) updateData.date = new Date(date)
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null
    if (time) updateData.time = time
    if (endTime !== undefined) updateData.endTime = endTime || null
    if (location) updateData.location = location
    if (marshalTypes !== undefined) updateData.marshalTypes = marshalTypes
    if (maxMarshals) updateData.maxMarshals = parseInt(maxMarshals)
    if (status) updateData.status = status

    const event = await prisma.event.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete event
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
      const user = await getUserFromToken(req)
      if (user) {
        userId = user.id
        userRole = user.role
      }
    }
    
    if (!userId || userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Delete all attendances first
    await prisma.attendance.deleteMany({
      where: { eventId: id }
    })

    // Delete the event
    await prisma.event.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
