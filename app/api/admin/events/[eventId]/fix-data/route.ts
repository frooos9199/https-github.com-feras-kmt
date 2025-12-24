import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { eventId } = await params

    // العثور على جميع الحضور المعتمد بدون مارشال مقابل
    const orphanedAttendances = await prisma.attendance.findMany({
      where: {
        eventId: eventId,
        status: "approved"
      },
      include: {
        user: true
      }
    })

    let fixed = 0
    for (const attendance of orphanedAttendances) {
      // فحص إذا كان المستخدم لا يزال موجوداً
      if (!attendance.user) {
        console.log(`حذف حضور محذوف للمستخدم: ${attendance.userId}`)
        await prisma.attendance.delete({
          where: { id: attendance.id }
        })
        fixed++
        continue
      }

      // فحص إذا كان المستخدم موجود في eventMarshals
      const existingMarshal = await prisma.eventMarshal.findUnique({
        where: {
          eventId_marshalId: {
            eventId: eventId,
            marshalId: attendance.userId
          }
        }
      })

      if (!existingMarshal) {
        console.log(`إضافة مارشال مفقود: ${attendance.user.employeeId} ${attendance.user.name}`)
        await prisma.eventMarshal.create({
          data: {
            eventId: eventId,
            marshalId: attendance.userId,
            status: "accepted",
            invitedAt: new Date(),
            respondedAt: new Date()
          }
        })
        fixed++
      }
    }

    return NextResponse.json({
      success: true,
      message: `تم إصلاح ${fixed} سجل`,
      fixed: fixed
    })

  } catch (error) {
    console.error("Error fixing event data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}