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

// PUT - Update FCM token
export async function PUT(request: NextRequest) {
  try {
    const user = await getUser(request);
    
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fcmToken } = body;

    if (!fcmToken) {
      return NextResponse.json({ error: "FCM token is required" }, { status: 400 });
    }

    // Update user's FCM token
    await prisma.user.update({
      where: { id: user.id },
      data: { fcmToken },
    });

    return NextResponse.json({ success: true, message: "FCM token updated successfully" });
  } catch (error) {
    console.error("Error updating FCM token:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Alternative method for backward compatibility
export async function POST(request: NextRequest) {
  return PUT(request);
}
