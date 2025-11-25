import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { notifyMatchingMarshalsAboutNewEvent } from "@/lib/notifications"
import { sendEmail, newEventEmailTemplate } from "@/lib/email"
import jwt from "jsonwebtoken"
// استخراج التوكن والتحقق منه
function verifyJWT(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  if (!token) return null;
  try {
    const jwtSecret = process.env.JWT_SECRET || "dev-secret-key";
    const decoded = jwt.verify(token, jwtSecret);
    if (typeof decoded === "string") return null;
    return decoded;
  } catch {
    return null;
  }
}

// GET - Fetch all events
export async function GET(request: NextRequest) {
  try {
    // تحقق من session (next-auth) للأدمن
    const session = await getServerSession(authOptions);
    if (session?.user?.role === "admin") {
      const events = await prisma.event.findMany({
        include: {
          _count: {
            select: {
              attendances: {
                where: { status: 'approved' }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" }
      });
      return NextResponse.json(events);
    }

    // تحقق من JWT (للأدمن أو المارشال)
    const user = verifyJWT(request);
    console.log("[DEBUG] Decoded user from JWT:", user);
    if (!user || !["admin", "marshal"].includes((user as any).role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const events = await prisma.event.findMany({
      include: {
        _count: {
          select: {
            attendances: {
              where: { status: 'approved' }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update event  
export async function PUT(request: NextRequest) {
  try {
    const user = verifyJWT(request);
    if (!user || (user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json()
    const { id, titleEn, titleAr, descriptionEn, descriptionAr, date, endDate, time, endTime, location, marshalTypes, maxMarshals, status } = body

    if (!id) {
      return NextResponse.json({ error: "Event ID required" }, { status: 400 })
    }

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
      data: updateData,
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH - Update event (same as PUT)
export async function PATCH(request: NextRequest) {
  return PUT(request)
}

// DELETE - Delete event
export async function DELETE(request: NextRequest) {
  try {
    const user = verifyJWT(request);
    if (!user || (user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Event ID required" }, { status: 400 })
    }

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
