import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Total marshals
    const totalMarshals = await prisma.user.count({
      where: { role: "marshal" }
    })

    // Total events
    const totalEvents = await prisma.event.count()

    // Total attendances
    const totalAttendances = await prisma.attendance.count()

    // Approved attendances
    const approvedAttendances = await prisma.attendance.count({
      where: { status: "approved" }
    })

    // Pending attendances
    const pendingAttendances = await prisma.attendance.count({
      where: { status: "pending" }
    })

    // Rejected attendances
    const rejectedAttendances = await prisma.attendance.count({
      where: { status: "rejected" }
    })

    // Active events
    const activeEvents = await prisma.event.count({
      where: { status: "active" }
    })

    // Upcoming events (future dates)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const upcomingEvents = await prisma.event.count({
      where: {
        date: { gte: today },
        status: "active"
      }
    })

    // Past events
    const pastEvents = await prisma.event.count({
      where: {
        date: { lt: today }
      }
    })

    // Top marshals (by attendance count)
    const topMarshalsData = await prisma.user.findMany({
      where: { role: "marshal" },
      select: {
        name: true,
        employeeId: true,
        _count: {
          select: { attendances: true }
        }
      },
      orderBy: {
        attendances: {
          _count: "desc"
        }
      },
      take: 10
    })

    const topMarshals = topMarshalsData.map((m: any) => ({
      name: m.name,
      employeeId: m.employeeId,
      attendanceCount: m._count.attendances
    }))

    return NextResponse.json({
      totalMarshals,
      totalEvents,
      totalAttendances,
      approvedAttendances,
      pendingAttendances,
      rejectedAttendances,
      activeEvents,
      upcomingEvents,
      pastEvents,
      topMarshals,
    })
  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
