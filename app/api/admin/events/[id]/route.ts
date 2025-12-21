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
    // Debug: log headers and params
    console.log('API EVENT GET', {
      url: req.url,
      headers: Object.fromEntries(req.headers.entries()),
      params: await params
    });

    if (req.headers.get("accept")?.includes("text/html")) {
      console.error('API called with Accept: text/html, returning JSON error');
      return NextResponse.json({ error: "API route expects JSON, not HTML" }, { status: 400 });
    }

    let userId: string | null = null;
    let userRole: string | null = null;

    // Try NextAuth session
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      userId = session.user.id;
      userRole = session.user.role;
    } else {
      // Try JWT token
      const user = await getUserFromToken(req);
      if (user) {
        userId = user.id;
        userRole = user.role;
      }
    }

    if (!userId || userRole !== "admin") {
      console.error('API unauthorized: userId or role missing', { userId, userRole });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      console.error('API event: missing id param', { id });
      return NextResponse.json({ error: "Event id is required" }, { status: 400 });
    }
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        attendances: {
          select: {
            id: true,
            userId: true,
            status: true,
            registeredAt: true,
            cancelledAt: true,
            cancellationReason: true,
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
          },
          orderBy: {
            registeredAt: 'desc'
          }
        },
        _count: {
          select: { attendances: true }
        }
      }
    });

    if (!event) {
      console.error('API event not found', { id });
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 });
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
    console.log('PATCH request body:', body)
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
    if (titleEn !== undefined) updateData.titleEn = titleEn
    if (titleAr !== undefined) updateData.titleAr = titleAr
    if (descriptionEn !== undefined) updateData.descriptionEn = descriptionEn
    if (descriptionAr !== undefined) updateData.descriptionAr = descriptionAr
    if (date !== undefined) updateData.date = new Date(date)
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null
    if (time !== undefined) updateData.time = time
    if (endTime !== undefined) updateData.endTime = endTime || null
    if (location !== undefined) updateData.location = location
    if (marshalTypes !== undefined) updateData.marshalTypes = marshalTypes
    if (maxMarshals !== undefined) updateData.maxMarshals = parseInt(maxMarshals)
    if (status !== undefined) updateData.status = status

    console.log('Update data:', updateData)

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
