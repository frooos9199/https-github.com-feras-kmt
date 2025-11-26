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
  if (!JWT_SECRET) {
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
    if (!user) {
      return undefined
    }
    // فقط تحقق من role = 'admin' بدون أي شروط إضافية
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
