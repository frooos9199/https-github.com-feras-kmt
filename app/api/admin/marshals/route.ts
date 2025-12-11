import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"

// GET - Fetch all marshals
export async function GET(req: NextRequest) {
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
      const user = await getUserFromToken(req)
      if (user) {
        userId = user.id
        userRole = user.role
      }
    }
    
    if (!userId || userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const marshals = await prisma.user.findMany({
      where: { role: "marshal" },
      select: {
        id: true,
        employeeId: true,
        name: true,
        email: true,
        phone: true,
        civilId: true,
        dateOfBirth: true,
        nationality: true,
        image: true,
        createdAt: true,
        isActive: true,
        marshalTypes: true,
        _count: {
          select: { attendances: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(marshals)
  } catch (error) {
    console.error("Error fetching marshals:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
