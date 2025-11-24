import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET - Fetch all marshals
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== "admin") {
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
