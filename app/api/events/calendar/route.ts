import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    let userId: string | null = null
    let userRole: string | null = null

    // Try NextAuth session first
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

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only allow admin or marshal users
    if (userRole !== "admin" && userRole !== "marshal") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let events

    if (userRole === "admin") {
      // Admin can see all events (archived and non-archived)
      events = await prisma.event.findMany({
        select: {
          id: true,
          titleEn: true,
          titleAr: true,
          date: true,
          endDate: true,
          time: true,
          endTime: true,
          location: true,
          isArchived: true
        }
      })
    } else {
      // Marshal can see events that match their types (including archived ones for calendar view)
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { marshalTypes: true }
      })

      const userTypes = user?.marshalTypes ? user.marshalTypes.split(',').filter((t: string) => t) : []

      if (userTypes.length === 0) {
        return NextResponse.json([])
      }

      events = await prisma.event.findMany({
        where: {
          OR: userTypes.map((type: string) => ({
            marshalTypes: {
              contains: type.trim()
            }
          }))
        },
        select: {
          id: true,
          titleEn: true,
          titleAr: true,
          date: true,
          endDate: true,
          time: true,
          endTime: true,
          location: true,
          isArchived: true
        }
      })
    }

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

    return NextResponse.json(sortedEvents)
  } catch (error) {
    console.error("Error fetching calendar events:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}