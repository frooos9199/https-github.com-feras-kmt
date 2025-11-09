import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { sendEmail, approvalEmailTemplate, rejectionEmailTemplate } from "@/lib/email"

// GET - Fetch all attendance requests
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "all"
    const eventId = searchParams.get("eventId")

    const whereClause: any = {}
    if (status !== "all") {
      whereClause.status = status
    }
    if (eventId) {
      whereClause.eventId = eventId
    }

    const attendances = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            civilId: true,
            employeeId: true,
          }
        },
        event: {
          select: {
            id: true,
            titleEn: true,
            titleAr: true,
            date: true,
            time: true,
            location: true,
          }
        }
      },
      orderBy: { registeredAt: "desc" }
    })

    return NextResponse.json(attendances)
  } catch (error) {
    console.error("Error fetching attendances:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Update attendance status (approve/reject)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { attendanceId, status, notes } = body

    if (!attendanceId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // If approving, check if event is already full
    if (status === "approved") {
      const currentAttendance = await prisma.attendance.findUnique({
        where: { id: attendanceId },
        select: { eventId: true, status: true }
      })

      if (!currentAttendance) {
        return NextResponse.json({ 
          error: "Attendance record not found",
          errorAr: "سجل الحضور غير موجود"
        }, { status: 404 })
      }

      // Check event capacity (only if status is changing to approved)
      if (currentAttendance.status !== "approved") {
        const event = await prisma.event.findUnique({
          where: { id: currentAttendance.eventId },
          select: {
            id: true,
            maxMarshals: true,
            titleEn: true,
            titleAr: true,
            _count: {
              select: {
                attendances: {
                  where: { status: "approved" }
                }
              }
            }
          }
        })

        if (!event) {
          return NextResponse.json({ 
            error: "Event not found",
            errorAr: "الفعالية غير موجودة"
          }, { status: 404 })
        }

        // Check if event is already full
        if (event._count.attendances >= event.maxMarshals) {
          return NextResponse.json({
            error: "Event is full - Cannot approve more marshals. Please reject an existing marshal or increase event capacity.",
            errorAr: "الفعالية مكتملة - لا يمكن قبول المزيد من المارشالات. الرجاء رفض أحد المارشالات الحاليين أو زيادة سعة الفعالية.",
            currentApproved: event._count.attendances,
            maxMarshals: event.maxMarshals,
            eventTitle: event.titleAr,
            remainingSlots: 0
          }, { status: 400 })
        }
      }
    }

    const attendance = await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        status,
        notes: notes || null,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        },
        event: {
          select: {
            titleEn: true,
            titleAr: true,
            date: true,
            time: true,
            location: true,
            endDate: true,
            endTime: true,
          }
        }
      }
    })

    // Send email notification to user
    if (attendance.user.email) {
      if (status === "approved") {
        await sendEmail({
          to: attendance.user.email,
          subject: `✅ Request Approved - ${attendance.event.titleEn}`,
          html: approvalEmailTemplate(
            attendance.user.name,
            attendance.event.titleEn,
            new Date(attendance.event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            attendance.event.time,
            attendance.event.location,
            attendance.event.endDate ? new Date(attendance.event.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : undefined,
            attendance.event.endTime || undefined
          )
        })
      } else if (status === "rejected") {
        await sendEmail({
          to: attendance.user.email,
          subject: `📋 Request Status Update - ${attendance.event.titleEn}`,
          html: rejectionEmailTemplate(
            attendance.user.name,
            attendance.event.titleEn,
            notes || undefined
          )
        })
      }
    }

    return NextResponse.json(attendance)
  } catch (error) {
    console.error("Error updating attendance:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
