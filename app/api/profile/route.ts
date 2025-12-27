import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

// GET - Fetch user profile
export async function GET(req: NextRequest) {
  try {
    let userId: string | null = null

    // Try NextAuth session
    const session = await getServerSession(authOptions)
    if (session?.user?.id) {
      userId = session.user.id
    } else {
      // Try JWT from mobile app
      const authHeader = req.headers.get('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        try {
          // ✅ نفس الـ secret المستخدم في Login
          const jwtSecret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "dev-secret-key";
          const decoded = jwt.verify(token, jwtSecret) as { id: string }
          userId = decoded.id
        } catch (jwtError) {
          console.error('JWT verification failed:', jwtError)
        }
      }
    }
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        employeeId: true,
        name: true,
        email: true,
        phone: true,
        civilId: true,
        dateOfBirth: true,
        nationality: true,
        bloodType: true,
        image: true,
        civilIdImage: true,
        civilIdBackImage: true,
        licenseFrontImage: true,
        licenseBackImage: true,
        role: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Update request body:", body)
    const { name, phone, civilId, dateOfBirth, nationality, bloodType, image, currentPassword, newPassword } = body

    // Build update data
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (civilId !== undefined) updateData.civilId = civilId
    if (nationality !== undefined) updateData.nationality = nationality
    if (bloodType !== undefined) updateData.bloodType = bloodType
    if (dateOfBirth !== undefined) updateData.dateOfBirth = new Date(dateOfBirth)
    if (image !== undefined) updateData.image = image

    console.log("Update data:", updateData)

    // Handle password update
    if (currentPassword && newPassword) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id }
      })

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      const isValid = await bcrypt.compare(currentPassword, user.password)
      if (!isValid) {
        return NextResponse.json({ error: "Invalid current password" }, { status: 400 })
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10)
      updateData.password = hashedPassword
    }
    console.log("Update data:", updateData)

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
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
        bloodType: true,
        image: true,
        role: true,
      }
    })

    console.log("Updated user:", updatedUser)
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
