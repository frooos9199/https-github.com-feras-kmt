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
  console.log('[AUTH] Authorization header:', authHeader ? 'Present' : 'Missing');
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log('[AUTH] Invalid authorization header format');
    return undefined;
  }
  
  const token = authHeader.replace("Bearer ", "")
  console.log('[AUTH] Token length:', token.length);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken
    console.log('[AUTH] Token decoded:', {
      id: decoded.id,
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    });
    
    // تجربة عدة مفاتيح ممكنة للمعرف
    const userId = decoded.userId || decoded.id || decoded.sub;
    if (!userId) {
      console.log('[AUTH] No user ID found in token');
      return undefined
    }
    
    console.log('[AUTH] Looking up user with ID:', userId);
    
    // جلب المستخدم من قاعدة البيانات
    const user = await prisma.user.findUnique({ where: { id: userId } })
    
    if (!user) {
      console.log('[AUTH] User not found in database for ID:', userId);
      return undefined
    }
    
    console.log('[AUTH] User found:', {
      id: user.id,
      email: user.email,
      role: user.role
    });
    
    // إرجاع بيانات المستخدم (admin أو marshal)
    return {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      image: user.image
    }
  } catch (e) {
    console.error('[AUTH] JWT verification error:', e.message);
    return undefined
  }
}
