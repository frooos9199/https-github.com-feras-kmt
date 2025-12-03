import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"

// Verify JWT token
export function verifyJWT(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  console.log('[JWT] Auth header:', authHeader ? 'present' : 'missing');
  
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  if (!token) {
    console.log('[JWT] Token extraction failed');
    return null;
  }

  try {
    const jwtSecret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "dev-secret-key";
    console.log('[JWT] Using secret:', jwtSecret.substring(0, 10) + '...');
    const decoded = jwt.verify(token, jwtSecret) as any;
    console.log('[JWT] Decoded payload:', decoded);
    return decoded;
  } catch (error: any) {
    console.error('[JWT] Verification failed:', error?.message || error);
    return null;
  }
}

// Get user from session or JWT
export async function getAuthUser(request: NextRequest) {
  // Try session first (web)
  const session = await getServerSession(authOptions);
  if (session?.user) {
    console.log('[AUTH] User from session:', session.user.email);
    return session.user;
  }

  // Try JWT (mobile)
  const jwtPayload = verifyJWT(request);
  console.log('[AUTH] JWT Payload:', jwtPayload);
  
  // JWT contains 'id' not 'userId'
  if (jwtPayload?.id) {
    const user = await prisma.user.findUnique({
      where: { id: jwtPayload.id },
      select: { id: true, email: true, role: true, name: true }
    });
    console.log('[AUTH] User from JWT:', user ? user.email : 'null');
    return user;
  }

  console.log('[AUTH] No user found');
  return null;
}
