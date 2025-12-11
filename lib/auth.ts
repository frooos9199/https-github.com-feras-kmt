import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

// Use NEXTAUTH_SECRET first (preferred), then JWT_SECRET as fallback
// This ensures consistency with NextAuth and login endpoint
const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "dev-secret-key"

interface DecodedToken {
  id: string
  email?: string
  name?: string
  role?: string
  [key: string]: any
}

export async function getUserFromToken(req: NextRequest): Promise<{
  id: string;
  role: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
} | undefined> {
  const authHeader = req.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return undefined;
  }
  
  const token = authHeader.replace("Bearer ", "")
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken
    if (!decoded?.id) {
      return undefined
    }
    // جلب المستخدم من قاعدة البيانات
    const user = await prisma.user.findUnique({ where: { id: decoded.id } })
    // طباعة بيانات المستخدم بعد فك التوكن
    console.log('Decoded user:', user);
    if (!user) {
      return undefined
    }
    // إرجاع بيانات المستخدم (admin أو marshal)
    return {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      image: user.image
    }
  } catch (e) {
    console.error('JWT verification error:', e);
    return undefined
  }
}
