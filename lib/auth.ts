import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

const JWT_SECRET = process.env.NEXTAUTH_SECRET as string

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
    console.log('[getUserFromToken] No Authorization header or not Bearer');
    return undefined;
  }
  if (!JWT_SECRET) {
    console.log('[getUserFromToken] No JWT_SECRET');
    return undefined;
  }
  const token = authHeader.replace("Bearer ", "")
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken
    console.log('[getUserFromToken] Decoded JWT:', decoded)
    if (!decoded?.id) {
      console.log('[getUserFromToken] No id in token')
      return undefined
    }
    // جلب المستخدم من قاعدة البيانات للتأكد من الصلاحيات
    const user = await prisma.user.findUnique({ where: { id: decoded.id } })
    console.log('[getUserFromToken] DB user:', user)
    if (!user) {
      console.log('[getUserFromToken] User not found in DB')
      return undefined
    }
    if (user.role !== 'admin') {
      console.log('[getUserFromToken] User is not admin')
      return undefined
    }
    // أرجع فقط الحقول المطلوبة مثل session.user
    return {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      image: user.image
    }
  } catch (e) {
    console.log('[getUserFromToken] JWT error:', e)
    return undefined
  }
}
