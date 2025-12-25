import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { sendEmail, approvalEmailTemplate, rejectionEmailTemplate } from "@/lib/email"
import { getUserFromToken } from "@/lib/auth"

// GET - Fetch all attendance requests
export async function GET(request: NextRequest) {
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
    
    if (!userId || userRole !== "admin") {
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
    
    if (!userId || userRole !== "admin") {
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

    // If approving attendance, create EventMarshal record
    if (status === "approved") {
      try {
        // Check if EventMarshal record already exists
        const existingEventMarshal = await prisma.eventMarshal.findUnique({
          where: {
            eventId_marshalId: {
              eventId: attendance.eventId,
              marshalId: attendance.userId
            }
          }
        })

        if (!existingEventMarshal) {
          // Create EventMarshal record
          await prisma.eventMarshal.create({
            data: {
              eventId: attendance.eventId,
              marshalId: attendance.userId,
              status: "approved",
              notes: "Approved via attendance request"
            }
          })
          console.log(`✅ Created EventMarshal record for user ${attendance.userId} in event ${attendance.eventId}`)
        } else {
          // Update existing EventMarshal record if not already approved
          if (existingEventMarshal.status !== "approved") {
            await prisma.eventMarshal.update({
              where: {
                eventId_marshalId: {
                  eventId: attendance.eventId,
                  marshalId: attendance.userId
                }
              },
              data: {
                status: "approved",
                notes: "Approved via attendance request"
              }
            })
            console.log(`✅ Updated EventMarshal record for user ${attendance.userId} in event ${attendance.eventId}`)
          }
        }
      } catch (eventMarshalError) {
        console.error("Error creating/updating EventMarshal record:", eventMarshalError)
        // Don't fail the entire request if EventMarshal creation fails
      }
    }

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

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
