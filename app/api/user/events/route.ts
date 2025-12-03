import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import jwt from "jsonwebtoken";

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
    // تحقق من الجلسة (المستخدم مسجل الدخول)
    const user = await getUser(request);
    if (!user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // جلب الفعاليات المرتبطة بالمستخدم (عن طريق الحضور)
    const attendances = await prisma.attendance.findMany({
      where: { userId: user.id },
      include: { event: true }
    });

    // تجهيز قائمة الفعاليات
    const events = attendances.map((a) => ({
      id: a.event.id,
      title: a.event.titleAr || a.event.titleEn,
      date: a.event.date,
      location: a.event.location,
      status: a.status
    }));

    return NextResponse.json({ success: true, events });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
