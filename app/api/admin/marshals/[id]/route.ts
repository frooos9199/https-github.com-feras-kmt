import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { sendEmail, marshalAccountRemovalEmailTemplate } from "@/lib/email"
import jwt from "jsonwebtoken"

// GET - Fetch single marshal
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let userRole: string | null = null

    // Try to get user role from NextAuth session
    const session = await getServerSession(authOptions)
    if (session?.user?.role) {
      userRole = session.user.role
    } else {
      // Try JWT from mobile app
      const authHeader = req.headers.get('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        try {
          const jwtSecret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "dev-secret-key"
          const decoded = jwt.verify(token, jwtSecret) as { role: string }
          userRole = decoded.role
        } catch (jwtError) {
          console.error('[MARSHALS] JWT verification failed:', jwtError)
        }
      }
    }

    if (!userRole || userRole !== "admin") {
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
        bloodType: true,
        image: true,
        licenseFrontImage: true,
        licenseBackImage: true,
        civilIdImage: true,
        civilIdBackImage: true,
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
    let userRole: string | null = null

    // Try NextAuth session first (for web)
    const session = await getServerSession(authOptions)
    if (session?.user?.role) {
      userRole = session.user.role
    } else {
      // Try JWT from mobile app
      const authHeader = req.headers.get('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        try {
          const jwtSecret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "dev-secret-key"
          const decoded = jwt.verify(token, jwtSecret) as { role: string }
          userRole = decoded.role
        } catch (jwtError) {
          console.error('[MARSHALS] JWT verification failed:', jwtError)
        }
      }
    }

    if (!userRole || userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { isActive, name, email, phone, civilId, dateOfBirth, nationality, bloodType, marshalTypes, employeeId } = body

    const updateData: any = {}
    if (typeof isActive === "boolean") updateData.isActive = isActive
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (phone) updateData.phone = phone
    if (civilId !== undefined) updateData.civilId = civilId
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null
    if (nationality !== undefined) updateData.nationality = nationality
    if (bloodType !== undefined) updateData.bloodType = bloodType
    if (marshalTypes !== undefined) {
      // Convert array to comma-separated string for mobile app compatibility
      updateData.marshalTypes = Array.isArray(marshalTypes) 
        ? marshalTypes.join(',') 
        : marshalTypes
    }
    if (employeeId !== undefined) {
      // Validate employeeId format
      if (!employeeId.startsWith('KMT-')) {
        return NextResponse.json({ error: "Employee ID must start with KMT-" }, { status: 400 })
      }
      // Check if employeeId is already used by another marshal
      const existingMarshal = await prisma.user.findFirst({
        where: {
          employeeId,
          id: { not: id }
        }
      })
      if (existingMarshal) {
        return NextResponse.json({ error: "Employee ID already in use" }, { status: 400 })
      }
      updateData.employeeId = employeeId
    }

  console.log('[DEBUG] updateData to be sent to Prisma:', updateData)
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
        bloodType: true,
        image: true,
        licenseFrontImage: true,
        licenseBackImage: true,
        civilIdImage: true,
        civilIdBackImage: true,
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

    // جلب بيانات المارشال قبل الحذف
    const deletedMarshal = await prisma.user.findUnique({
      where: { id },
      select: { name: true, email: true }
    })

    // حذف جميع الحضور أولاً
    await prisma.attendance.deleteMany({
      where: { userId: id }
    })

    // حذف المارشال
    await prisma.user.delete({
      where: { 
        id,
        role: "marshal"
      }
    })

    // إرسال الإيميل بعد الحذف
    if (deletedMarshal?.email) {
      // استدعاء دالة الإيميل
      // استيراد الدوال في أعلى الملف:
      // import { sendEmail, marshalAccountRemovalEmailTemplate } from "@/lib/email"
      await sendEmail({
        to: deletedMarshal.email,
        subject: "Account Removed",
        html: marshalAccountRemovalEmailTemplate(deletedMarshal.name)
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting marshal:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
