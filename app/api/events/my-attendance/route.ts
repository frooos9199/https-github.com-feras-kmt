import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    let userId: string | null = null

    // Try NextAuth session
    const session = await getServerSession(authOptions)
    if (session?.user?.id) {
      userId = session.user.id
    } else {
      // Try JWT token
      const user = await getUserFromToken(req)
      if (user) {
        userId = user.id
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get events where the user has been approved for attendance
    const events = await prisma.event.findMany({
      where: {
        attendances: {
          some: {
            userId: userId,
            status: "approved"
          }
        }
      },
      include: {
        attendances: {
          where: {
            userId: userId
          }
        },
        _count: {
          select: {
            attendances: true
          }
        }
      }
    })

    // ترتيب الأحداث: الحالية أولاً، القادمة بعد ذلك، المنتهية في النهاية
    const today = new Date()
    today.setHours(0, 0, 0, 0) // بداية اليوم

    const sortedEvents = events.sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)

      // إذا كان الحدث A منتهي والحدث B غير منتهي، B أولاً
      const isAFinished = dateA < today
      const isBFinished = dateB < today

      if (!isAFinished && isBFinished) return -1
      if (isAFinished && !isBFinished) return 1

      // إذا كان كلا الحدثين منتهيين أو غير منتهيين، رتب حسب التاريخ
      return dateA.getTime() - dateB.getTime()
    })

    // Add approved and rejected counts to each event
    const eventsWithCounts = await Promise.all(sortedEvents.map(async (event) => {
      const approvedCount = await prisma.attendance.count({
        where: {
          eventId: event.id,
          status: "approved"
        }
      })
      const rejectedCount = await prisma.attendance.count({
        where: {
          eventId: event.id,
          status: "rejected"
        }
      })
      return {
        ...event,
        approvedCount,
        rejectedCount
      }
    }))

    return NextResponse.json(eventsWithCounts)
  } catch (error) {
    console.error("Error fetching my attendance events:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}