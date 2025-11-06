import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET - Fetch single marshal
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const marshal = await prisma.user.findUnique({
      where: { 
        id,
        role: "marshal"
      },
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
        isActive: true,
        marshalTypes: true,
        createdAt: true,
        _count: {
          select: { attendances: true }
        }
      }
    })

    if (!marshal) {
      return NextResponse.json({ error: "Marshal not found" }, { status: 404 })
    }

    return NextResponse.json(marshal)
  } catch (error) {
    console.error("Error fetching marshal:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH - Update marshal or toggle status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { isActive, name, email, phone, nationality, marshalTypes } = body

    const updateData: any = {}
    if (typeof isActive === "boolean") updateData.isActive = isActive
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (phone) updateData.phone = phone
    if (nationality !== undefined) updateData.nationality = nationality
    if (marshalTypes !== undefined) updateData.marshalTypes = marshalTypes

    const marshal = await prisma.user.update({
      where: { 
        id,
        role: "marshal"
      },
      data: updateData,
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
        isActive: true,
        marshalTypes: true,
        createdAt: true,
        _count: {
          select: { attendances: true }
        }
      }
    })

    return NextResponse.json(marshal)
  } catch (error) {
    console.error("Error updating marshal:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete marshal
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Delete all attendances first
    await prisma.attendance.deleteMany({
      where: { userId: id }
    })

    // Delete the marshal
    await prisma.user.delete({
      where: { 
        id,
        role: "marshal"
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting marshal:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
