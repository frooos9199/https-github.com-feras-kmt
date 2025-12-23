import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attendanceId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 401 })
    }

    const { attendanceId } = await params

    // البحث عن طلب الحضور
    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: {
        event: true,
        user: true
      }
    })

    if (!attendance) {
      return NextResponse.json({ error: "طلب الحضور غير موجود" }, { status: 404 })
    }

    // التحقق من أن المستخدم هو صاحب الطلب
    if (attendance.userId !== session.user.id) {
      return NextResponse.json({ error: "لا يمكنك رفض طلب غير خاص بك" }, { status: 403 })
    }

    // التحقق من أن الطلب في حالة معلق
    if (attendance.status !== "pending") {
      return NextResponse.json({ error: "يمكن رفض الطلبات المعلقة فقط" }, { status: 400 })
    }

    // تحديث حالة الطلب إلى مرفوض
    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        status: "rejected"
      },
      include: {
        event: true,
        user: true
      }
    })

    return NextResponse.json({
      message: "تم رفض طلب الحضور بنجاح",
      attendance: updatedAttendance
    })

  } catch (error) {
    console.error("Error rejecting attendance:", error)
    return NextResponse.json({ error: "حدث خطأ في رفض الطلب" }, { status: 500 })
  }
}