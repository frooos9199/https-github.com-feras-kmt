import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function POST(req: NextRequest) {
  try {
    let userEmail: string | null = null

    // Try to get user from NextAuth session (web)
    const session = await getServerSession()
    if (session?.user?.email) {
      userEmail = session.user.email
      console.log('[FCM-TOKEN] ✅ User from NextAuth session:', userEmail)
    } else {
      // Try to get user from JWT token (mobile app)
      const authHeader = req.headers.get('authorization')
      console.log('[FCM-TOKEN] 🔑 Authorization header:', authHeader ? 'Present' : 'Missing')
      
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        console.log('[FCM-TOKEN] 📝 JWT Token (first 30 chars):', token.substring(0, 30))
        
        try {
          // استخدام نفس السر المستخدم في Login API
          const jwtSecret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'dev-secret-key'
          const decoded = jwt.verify(token, jwtSecret) as { email: string }
          userEmail = decoded.email
          console.log('[FCM-TOKEN] ✅ JWT verified, user email:', userEmail)
        } catch (jwtError: any) {
          console.error('[FCM-TOKEN] ❌ JWT verification failed:', jwtError.message)
        }
      }
    }

    if (!userEmail) {
      console.error('[FCM-TOKEN] ❌ No user email found - Unauthorized')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { fcmToken } = await req.json()

    if (!fcmToken) {
      console.error('[FCM-TOKEN] ❌ No FCM token in request body')
      return NextResponse.json(
        { error: 'FCM token is required' },
        { status: 400 }
      )
    }

    console.log('[FCM-TOKEN] 💾 Updating FCM token for user:', userEmail)

    // Update user's FCM token
    await prisma.user.update({
      where: { email: userEmail },
      data: { fcmToken }
    })

    console.log('[FCM-TOKEN] ✅ FCM token updated successfully')

    return NextResponse.json({
      success: true,
      message: 'FCM token updated successfully'
    })
  } catch (error: any) {
    console.error('[FCM-TOKEN] ❌ Error updating FCM token:', error.message)
    return NextResponse.json(
      { error: 'Failed to update FCM token' },
      { status: 500 }
    )
  }
}
