import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"

// Verify JWT token
export function verifyJWT(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  if (!token) return null;

  try {
    const jwtSecret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "dev-secret-key";
    const decoded = jwt.verify(token, jwtSecret) as any;
    return decoded;
  } catch (error: any) {
    return null;
  }
}

// Get user from session or JWT
export async function getAuthUser(request: NextRequest) {
  // Try session first (web)
  const session = await getServerSession(authOptions);
  if (session?.user) {
    return session.user;
  }

  // Try JWT (mobile)
  const jwtPayload = verifyJWT(request);
  
  // JWT contains 'id' not 'userId'
  if (jwtPayload?.id) {
    const user = await prisma.user.findUnique({
      where: { id: jwtPayload.id },
      select: { id: true, email: true, role: true, name: true }
    });
    return user;
  }

  return null;
}
