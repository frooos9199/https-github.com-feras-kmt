import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-utils"

// GET - Fetch user's attendance history
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const attendances = await prisma.attendance.findMany({
      where: { userId: user.id },
      include: {
        event: {
          select: {
            id: true,
            titleEn: true,
            titleAr: true,
            descriptionEn: true,
            descriptionAr: true,
            date: true,
            time: true,
            location: true,
            marshalTypes: true,
          }
        }
      },
      orderBy: { registeredAt: "desc" }
    })

    return NextResponse.json(attendances)
  } catch (error) {
    console.error("Error fetching attendance:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
