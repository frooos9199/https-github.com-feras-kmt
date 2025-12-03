import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"

// Verify JWT token
function verifyJWT(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  if (!token) return null;
  try {
    const jwtSecret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "dev-secret-key";
    const decoded = jwt.verify(token, jwtSecret);
    if (typeof decoded === "string") return null;
    return decoded;
  } catch {
    return null;
  }
}

// Get user from session or JWT
async function getUser(request: NextRequest) {
  // Try session first (web)
  const session = await getServerSession(authOptions);
  if (session?.user) {
    return session.user;
  }
  
  // Try JWT (mobile)
  const jwtUser = verifyJWT(request);
  if (jwtUser) {
    // JWT payload has { id, email, role } directly
    return {
      id: jwtUser.id,
      email: jwtUser.email,
      role: jwtUser.role,
      name: jwtUser.name,
    };
  }
  
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    
    if (!user || (user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get total marshals
    const totalMarshals = await prisma.user.count({
      where: { role: "marshal" }
    })

    // Get total events
    const totalEvents = await prisma.event.count()

    // Get pending attendance requests
    const pendingAttendance = await prisma.attendance.count({
      where: { status: "pending" }
    })

    // Get upcoming events
    const upcomingEvents = await prisma.event.count({
      where: {
        date: { gte: new Date() },
        status: "active"
      }
    })

    // Get recent activity (last 10 attendance requests)
    const recentActivity = await prisma.attendance.findMany({
      take: 10,
      orderBy: { registeredAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            employeeId: true,
          }
        },
        event: {
          select: {
            titleEn: true,
            titleAr: true,
          }
        }
      }
    })

    return NextResponse.json({
      totalMarshals,
      totalEvents,
      pendingAttendance,
      upcomingEvents,
      recentActivity,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
