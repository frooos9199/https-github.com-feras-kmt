// تعديل بسيط لاختبار git push
// آخر تحديث: 26-11-2025 - تعديل اختباري للتأكيد على تحديث git
// POST - Create new event
export async function POST(request: NextRequest) {
  try {
    // تحقق من session (next-auth) للأدمن فقط
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
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
      maxMarshals
    } = body;

    // Validate required fields
    if (!titleEn || !titleAr || !descriptionEn || !descriptionAr ||
        !date || !time || !location || !marshalTypes || !maxMarshals) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        titleEn,
        titleAr,
        descriptionEn,
        descriptionAr,
        date: new Date(date),
        endDate: endDate ? new Date(endDate) : null,
        time,
        endTime: endTime || null,
        location,
        marshalTypes: Array.isArray(marshalTypes) ? marshalTypes.join(",") : marshalTypes,
        maxMarshals: parseInt(maxMarshals),
        status: "active"
      }
    });

    // Send notifications to matching marshals
    await notifyMatchingMarshalsAboutNewEvent(
      event.id,
      event.titleEn,
      event.titleAr,
      event.marshalTypes
    );

    // Send email only to matching marshals
    const eventTypes = event.marshalTypes.split(',').filter((t: string) => t)
    
    const allMarshals = await prisma.user.findMany({
      where: { 
        role: 'marshal',
        isActive: true
      },
      select: { 
        name: true, 
        email: true, 
        marshalTypes: true 
      }
    });

    // Filter marshals who have matching types
    const matchingMarshals = allMarshals.filter((marshal: any) => {
      if (!marshal.marshalTypes) return false
      const marshalTypes = marshal.marshalTypes.split(',').filter((t: string) => t)
      return eventTypes.some((eventType: string) => marshalTypes.includes(eventType.trim()))
    })

    // Send emails only to matching marshals (in parallel, continue even if some fail)
    const emailPromises = matchingMarshals
      .filter((marshal: any) => marshal.email)
      .map((marshal: any) =>
        sendEmail({
          to: marshal.email!,
          subject: `🏁 New Event Available - ${event.titleEn}`,
          html: newEventEmailTemplate(
            marshal.name,
            event.titleEn,
            new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            event.time,
            event.location,
            event.descriptionEn,
            event.endDate ? new Date(event.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : undefined,
            event.endTime || undefined
          )
        }).catch(error => {
          console.error(`Failed to send email to ${marshal.email}:`, error);
          return { success: false, error };
        })
      );

    // Wait for all emails to be sent (or fail)
    const emailResults = await Promise.allSettled(emailPromises);
    const successCount = emailResults.filter(r => r.status === 'fulfilled').length;
    console.log(`Sent new event emails: ${successCount}/${matchingMarshals.length} successful (out of ${allMarshals.length} total marshals)`);

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
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
    const jwtSecret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "dev-secret-key";
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
    let userId: string | null = null
    let userRole: string | null = null

    // Try NextAuth session first
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      userId = session.user.id
      userRole = session.user.role
    } else {
      // Try JWT from mobile app
      const authHeader = request.headers.get('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        try {
          // ✅ نفس الـ secret المستخدم في Login
          const jwtSecret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "dev-secret-key";
          const decoded = jwt.verify(token, jwtSecret) as { id: string, role: string }
          userId = decoded.id
          userRole = decoded.role
        } catch (jwtError) {
          console.error('JWT verification failed:', jwtError)
        }
      }
    }

    if (!userId || userRole !== "admin") {
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
    if (marshalTypes !== undefined) updateData.marshalTypes = Array.isArray(marshalTypes) ? marshalTypes.join(",") : marshalTypes
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
