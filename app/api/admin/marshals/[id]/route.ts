import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { sendEmail, marshalAccountRemovalEmailTemplate } from "@/lib/email"
import * as jwt from "jsonwebtoken"

// Verify Bearer token for mobile app
async function verifyBearerToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        role: true,
        email: true,
        name: true
      }
    });

    return user;
  } catch (error) {
    console.error("Bearer token verification failed:", error);
    return null;
  }
}

// GET - Fetch single marshal
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Try Bearer token first (for mobile app)
    let user = await verifyBearerToken(req);
    
    // Fallback to session (for web)
    if (!user) {
      const session = await getServerSession(authOptions);
      user = session?.user;
    }

    if (!user || user.role !== "admin") {
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
    // Try Bearer token first (for mobile app)
    let user = await verifyBearerToken(req);
    
    // Fallback to session (for web)
    if (!user) {
      const session = await getServerSession(authOptions);
      user = session?.user;
    }

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { isActive, name, email, phone, nationality, bloodType, marshalTypes, employeeId } = body

    const updateData: any = {}
    if (typeof isActive === "boolean") updateData.isActive = isActive
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (phone) updateData.phone = phone
    if (nationality !== undefined) updateData.nationality = nationality
    if (bloodType !== undefined) updateData.bloodType = bloodType
    if (marshalTypes !== undefined) updateData.marshalTypes = marshalTypes
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
    // Try Bearer token first (for mobile app)
    let user = await verifyBearerToken(req);
    
    // Fallback to session (for web)
    if (!user) {
      const session = await getServerSession(authOptions);
      user = session?.user;
    }

    if (!user || user.role !== "admin") {
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
