import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"
import { sendEmail, broadcastEmailTemplate } from "@/lib/email"
import { sendPushNotification } from "@/lib/firebase-admin"

// POST - Send broadcast message
export async function POST(request: NextRequest) {

  try {
    let userId: string | null = null;
    let userRole: string | null = null;
    // Try NextAuth session first (for web)
    const session = await getServerSession(authOptions);
    if (session?.user?.id && session.user.role === "admin") {
      userId = session.user.id;
      userRole = session.user.role;
    } else {
      // Try JWT from mobile app
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          const jwtSecret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "dev-secret-key";
          const decoded = jwt.verify(token, jwtSecret) as { id?: string, role?: string };
          if (decoded.role === "admin" && decoded.id) {
            userId = decoded.id;
            userRole = decoded.role;
          }
        } catch (jwtError) {
          console.error('[BROADCAST] JWT verification failed:', jwtError);
        }
      }
    }

    if (!userId || userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json()
    const {
      subject,
      message,
      recipientFilter,
      marshalTypes,
      eventId,
      sendEmail: shouldSendEmail,
      sendNotification: shouldSendNotification,
      priority,
      // Mobile app fields (convert to API format)
      titleEn,
      titleAr,
      bodyEn,
      bodyAr,
      target
    } = body

    // Convert mobile app format to API format
    const actualSubject = subject || titleEn || titleAr
    const actualMessage = message || bodyEn || bodyAr
    const actualRecipientFilter = recipientFilter || target || 'all'
    const actualSendEmail = shouldSendEmail !== undefined ? shouldSendEmail : true
    const actualSendNotification = shouldSendNotification !== undefined ? shouldSendNotification : true

    // Validate required fields
    if (!actualSubject || !actualMessage || !actualRecipientFilter) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!actualSendEmail && !actualSendNotification) {
      return NextResponse.json({ error: "Must select at least one delivery method" }, { status: 400 })
    }

    // Build the filter for recipients
    let whereClause: any = {
      role: 'marshal',
      isActive: true
    }

    // Filter by marshal types
    if (actualRecipientFilter === "by-type" && marshalTypes) {
      const types = marshalTypes.split(',').map((t: string) => t.trim())
      whereClause.OR = types.map((type: string) => ({
        marshalTypes: { contains: type }
      }))
    }

    // Filter by event (approved marshals for specific event)
    if (actualRecipientFilter === "by-event" && eventId) {
      const approvedAttendances = await prisma.attendance.findMany({
        where: {
          eventId: eventId,
          status: 'approved'
        },
        select: { userId: true }
      })
      
      whereClause.id = {
        in: approvedAttendances.map(a => a.userId)
      }
    }

    // Filter by approval status
    if (actualRecipientFilter === "approved") {
      const approvedUserIds = await prisma.attendance.findMany({
        where: { status: 'approved' },
        select: { userId: true },
        distinct: ['userId']
      })
      
      whereClause.id = {
        in: approvedUserIds.map(a => a.userId)
      }
    }

    if (actualRecipientFilter === "pending") {
      const pendingUserIds = await prisma.attendance.findMany({
        where: { status: 'pending' },
        select: { userId: true },
        distinct: ['userId']
      })
      
      whereClause.id = {
        in: pendingUserIds.map(a => a.userId)
      }
    }

    // Get recipients
    const recipients = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        fcmToken: true // جلب FCM token للإشعارات
      }
    })

    if (recipients.length === 0) {
      return NextResponse.json({ error: "No recipients found matching the criteria" }, { status: 400 })
    }

    // Save broadcast message to database (optional - skip if table doesn't exist)
    try {
      await prisma.broadcastMessage.create({
        data: {
          subject: actualSubject,
          message: actualMessage,
          recipientFilter: actualRecipientFilter,
          marshalTypes: marshalTypes || null,
          eventId: eventId || null,
          sendEmail: actualSendEmail,
          sendNotification: actualSendNotification,
          priority: priority || 'normal',
          sentBy: userId,
          recipientCount: recipients.length
        }
      })
    } catch (error) {
      console.error("Failed to save broadcast to database (table may not exist):", error)
      // Continue anyway - the broadcast can still be sent
    }

    // Send emails (if enabled)
    if (actualSendEmail) {
      const emailPromises = recipients
        .filter(r => r.email)
        .map(recipient =>
          sendEmail({
            to: recipient.email!,
            subject: `${priority === 'urgent' ? '🔴 URGENT: ' : priority === 'high' ? '⚠️ ' : '📢 '}${actualSubject}`,
            html: broadcastEmailTemplate(
              recipient.name,
              actualSubject,
              actualMessage,
              priority
            )
          }).catch(error => {
            console.error(`Failed to send email to ${recipient.email}:`, error)
            return { success: false, error }
          })
        )

      await Promise.allSettled(emailPromises)
    }

    // Send in-app notifications (if enabled)
    if (actualSendNotification) {
      const notificationType = priority === 'urgent' ? 'URGENT_BROADCAST' : 
                               priority === 'high' ? 'IMPORTANT_BROADCAST' : 
                               'BROADCAST'

      // حفظ الإشعارات في قاعدة البيانات
      await prisma.notification.createMany({
        data: recipients.map(recipient => ({
          userId: recipient.id,
          type: notificationType,
          titleEn: actualSubject,
          titleAr: actualSubject,
          messageEn: actualMessage,
          messageAr: actualMessage,
          isRead: false
        }))
      })

      // إرسال Push Notifications عبر FCM
      const fcmTokens = recipients
        .filter(r => r.fcmToken)
        .map(r => r.fcmToken!)
      
      if (fcmTokens.length > 0) {
        console.log(`[BROADCAST] Sending push notifications to ${fcmTokens.length} devices...`)
        
        const pushResult = await sendPushNotification(
          fcmTokens,
          actualSubject,
          actualMessage,
          {
            type: notificationType,
            priority: priority || 'normal',
            title: actualSubject,
            body: actualMessage
          }
        )
        
        console.log(`[BROADCAST] Push notifications sent: ${pushResult.success} success, ${pushResult.failure} failed`)
      } else {
        console.log('[BROADCAST] No FCM tokens found, skipping push notifications')
      }
    }

    return NextResponse.json({
      success: true,
      recipientCount: recipients.length,
      message: `Message sent to ${recipients.length} marshal(s)`
    })

  } catch (error) {
    console.error("Error sending broadcast:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET - Fetch broadcast history  
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      const broadcasts = await prisma.broadcastMessage.findMany({
        orderBy: { sentAt: 'desc' },
        take: 50
      })
      return NextResponse.json(broadcasts)
    } catch (dbError) {
      // Table doesn't exist yet - return empty array
      console.log("BroadcastMessage table not found, returning empty array")
      return NextResponse.json([])
    }
    
  } catch (error) {
    console.error("Error fetching broadcasts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
