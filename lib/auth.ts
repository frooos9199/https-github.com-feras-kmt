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
    return undefined;
  }
  // استخدم نفس secret المستخدم في تسجيل الدخول (NEXTAUTH_SECRET)
  const jwtSecret = process.env.NEXTAUTH_SECRET || "dev-secret-key";
  if (!jwtSecret) {
    return undefined;
  }
  const token = authHeader.replace("Bearer ", "")
  try {
    const decoded = jwt.verify(token, jwtSecret) as DecodedToken
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
    // تحقق من صلاحية الأدمن فقط
    if (user.role === 'admin') {
      return {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        image: user.image
      }
    }
    return undefined;
  } catch (e) {
    return undefined
  }
}
