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

    // Get user's marshal types
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { marshalTypes: true }
    })

    const userTypes = user?.marshalTypes ? user.marshalTypes.split(',').filter((t: string) => t) : []

    // Filter events based on user's marshal types
    // Show events that match user's types AND are available for registration
    if (userTypes.length === 0) {
      return NextResponse.json([])
    }

    // Get events that match at least one of the user's marshal types
    // AND are not cancelled/completed, not full, and not in the past
    const allEvents = await prisma.event.findMany({
      where: {
        AND: [
          {
            OR: userTypes.map((type: string) => ({
              marshalTypes: {
                contains: type.trim()
              }
            }))
          },
          {
            status: {
              notIn: ['cancelled', 'completed']
            }
          },
          {
            isArchived: false // لا تظهر الأحداث المؤرشفة في القائمة المتاحة
          },
          {
            date: {
              gte: new Date() // Events in the future or today
            }
          }
        ]
      },
      include: {
        attendances: {
          where: {
            userId: userId
          }
        },
        eventMarshals: {
          where: {
            marshalId: userId
          },
          select: {
            marshalId: true,
            status: true
          }
        },
        _count: {
          select: {
            attendances: {
              where: {
                status: 'approved'
              }
            },
            eventMarshals: {
              where: {
                status: {
                  in: ['accepted', 'approved']
                }
              }
            }
          }
        }
      }
    })

    // Filter out events where user already has approved attendance or is invited
    const availableEvents = allEvents.filter(event => {
      // Check if user has approved attendance
      const hasApprovedAttendance = event.attendances.some(att => att.status === 'approved')

      // Check if user is invited (has eventMarshal record)
      const hasEventMarshal = event.eventMarshals?.some(em =>
        em.marshalId === userId && ['invited', 'accepted', 'approved'].includes(em.status)
      )

      // Include event only if user is not already approved/invited AND event is not full
      return !hasApprovedAttendance && !hasEventMarshal && (event._count.attendances + event._count.eventMarshals) < event.maxMarshals
    })

    // ترتيب الأحداث: اليوم أولاً، القادمة بعد ذلك، المنتهية في النهاية
    const today = new Date()
    today.setHours(0, 0, 0, 0) // بداية اليوم

    const sortedEvents = availableEvents.sort((a, b) => {
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
    console.error("Error fetching available events:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}