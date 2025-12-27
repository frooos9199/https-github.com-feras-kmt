import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"
import bcrypt from "bcryptjs"

// PUT - Update user profile (marshal only)
export async function PUT(request: NextRequest) {
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
      const user = await getUserFromToken(request)
      if (user) {
        userId = user.id
        userRole = user.role
      }
    }

    if (!userId || userRole !== "marshal") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { employeeId, nationality, currentPassword, newPassword, marshalTypes } = await request.json()

    // Validate required fields
    if (!employeeId || !nationality) {
      return NextResponse.json({
        error: "Employee ID and nationality are required"
      }, { status: 400 })
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if employee ID is already taken by another user
    if (employeeId !== currentUser.employeeId) {
      const existingUser = await prisma.user.findUnique({
        where: { employeeId }
      })

      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json({
          error: "Employee ID already exists"
        }, { status: 400 })
      }
    }

    // Prepare update data
    const updateData: any = {
      employeeId,
      nationality,
    }

    // Handle marshal types if provided
    if (marshalTypes !== undefined) {
      // Convert array to comma-separated string for mobile app compatibility
      updateData.marshalTypes = Array.isArray(marshalTypes) 
        ? marshalTypes.join(',') 
        : marshalTypes
    }

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({
          error: "Current password is required to change password"
        }, { status: 400 })
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, currentUser.password)
      if (!isValidPassword) {
        return NextResponse.json({
          error: "Current password is incorrect"
        }, { status: 400 })
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12)
      updateData.password = hashedPassword
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        employeeId: true,
        nationality: true,
        phone: true,
        role: true,
        marshalTypes: true,
      }
    })

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser
    })

  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}