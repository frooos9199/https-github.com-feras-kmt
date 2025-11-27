import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's marshal types
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { marshalTypes: true }
    })

    const userTypes = user?.marshalTypes ? user.marshalTypes.split(',').filter((t: string) => t) : []

    // إرجاع جميع الأحداث من قاعدة البيانات بدون أي فلترة
    const allEvents = await prisma.event.findMany({
      orderBy: {
        date: "asc"
      },
      include: {
        attendances: true,
        _count: {
          select: {
            attendances: true
          }
        }
      }
    })
    return NextResponse.json(allEvents)
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
