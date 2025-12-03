import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

function verifyJWT(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader) {
    return null;
  }
  
  const token = authHeader.split(" ")[1];
  if (!token) {
    return null;
  }
  
  try {
    const jwtSecret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "dev-secret-key";
    const decoded = jwt.verify(token, jwtSecret);
    
    if (typeof decoded === "string") {
      return null;
    }
    
    return decoded;
  } catch (err) {
    console.error('[Profile verifyJWT] ERROR:', err instanceof Error ? err.message : String(err));
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    let userId = session?.user?.id;

    if (!userId) {
      const decoded = verifyJWT(request);
      if (decoded && (decoded as any).id) {
        userId = (decoded as any).id;
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
        civilIdFrontImage: true,
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

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, phone, civilId, dateOfBirth, nationality, bloodType, image, currentPassword, newPassword } = body
    
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (civilId !== undefined) updateData.civilId = civilId
    if (nationality !== undefined) updateData.nationality = nationality
    if (bloodType !== undefined) updateData.bloodType = bloodType
    if (dateOfBirth !== undefined) updateData.dateOfBirth = new Date(dateOfBirth)
    if (image !== undefined) updateData.image = image

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
        civilIdFrontImage: true,
        civilIdBackImage: true,
        licenseFrontImage: true,
        licenseBackImage: true,
        role: true,
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
