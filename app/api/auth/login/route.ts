import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

  const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    const isCorrectPassword = await bcrypt.compare(password, user.password);
    if (!isCorrectPassword) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    // توليد JWT - استخدام JWT_SECRET للتناسق مع التحقق
    const jwtSecret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "dev-secret-key";
    const accessToken = jwt.sign(
      {
        userId: user.id,
        id: user.id,
        email: user.email,
        role: user.role
      },
      jwtSecret,
      { expiresIn: "7d" }
    );
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        image: user.image,
        employee_number: user.employeeId,
        phone: user.phone,
        bloodType: user.bloodType,
        civilId: user.civilId,
        nationality: user.nationality,
        birthdate: user.dateOfBirth
      },
      accessToken
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
