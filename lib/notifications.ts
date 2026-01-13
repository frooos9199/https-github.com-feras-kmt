import { prisma } from "./prisma"
import { sendPushNotification as sendPushViaAdmin } from "./firebase-admin"
import { logOperation, logError, updateLastLogin } from "./monitoring"

type NotificationType =
  | "NEW_EVENT"
  | "REGISTRATION_APPROVED"
  | "REGISTRATION_REJECTED"
  | "EVENT_REMINDER"
  | "EVENT_UPDATED"
  | "EVENT_CANCELLED"
  | "BROADCAST"
  | "IMPORTANT_BROADCAST"
  | "URGENT_BROADCAST"

interface CreateNotificationParams {
  userId: string
  type: NotificationType
  titleEn: string
  titleAr: string
  messageEn: string
  messageAr: string
  eventId?: string
}

export async function createNotification(params: CreateNotificationParams) {
  const operation = await logOperation('notification_send', undefined, params.userId, {
    type: params.type,
    eventId: params.eventId
  });

  try {
    console.log(`[NOTIFICATION] 📝 Creating notification for user: ${params.userId}`);
    console.log(`[NOTIFICATION] 📨 Type: ${params.type}`);
    console.log(`[NOTIFICATION] 📨 Title: ${params.titleEn}`);

    // Create in-app notification
    await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        titleEn: params.titleEn,
        titleAr: params.titleAr,
        messageEn: params.messageEn,
        messageAr: params.messageAr,
        eventId: params.eventId
      }
    })

    console.log(`[NOTIFICATION] ✅ In-app notification created`);

    // Send push notification if user has FCM token
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { fcmToken: true, email: true }
    })

    if (user?.fcmToken) {
      console.log(`[NOTIFICATION] 📱 Sending push to: ${user.email}`);

      // استخدام Firebase Admin SDK الصحيح
      const result = await sendPushViaAdmin(
        [user.fcmToken],
        params.titleEn,
        params.messageEn,
        params.eventId ? { eventId: params.eventId } : undefined
      )

      console.log(`[NOTIFICATION] 📨 Push result: ${result.success} success, ${result.failure} failed`);
    } else {
      console.log(`[NOTIFICATION] ⏭️ User ${user?.email || params.userId} has no app installed (no FCM token)`);
    }

    // إكمال العملية بنجاح
    await operation.complete('success');

  } catch (error) {
    console.error("[NOTIFICATION] ❌ Error creating notification:", error)

    // تسجيل الخطأ وإكمال العملية بفشل
    await logError('notification_error', error instanceof Error ? error.message : 'Unknown error', 'notification_send', params.userId);
    await operation.complete('error', error instanceof Error ? error.message : 'Unknown error');
  }
}

// Helper: Notify all marshals who match event types about new event
export async function notifyMatchingMarshalsAboutNewEvent(
  eventId: string,
  eventTitleEn: string,
  eventTitleAr: string,
  eventMarshalTypes: string
) {
  try {
    const eventTypes = eventMarshalTypes.split(',').filter(t => t)
    
    if (eventTypes.length === 0) return

    // Find all active marshals who have matching types
    const marshals = await prisma.user.findMany({
      where: {
        role: "marshal",
        isActive: true
      }
    })

    const matchingMarshals = marshals.filter((marshal: any) => {
      const marshalTypes = marshal.marshalTypes.split(',').filter((t: string) => t)
      return eventTypes.some((eventType: string) => marshalTypes.includes(eventType))
    })

    // Create notification for each matching marshal
    for (const marshal of matchingMarshals) {
      await createNotification({
        userId: marshal.id,
        type: "NEW_EVENT",
        titleEn: "New Event Available",
        titleAr: "حدث جديد متاح",
        messageEn: `A new event "${eventTitleEn}" that matches your marshal types is now available for registration.`,
        messageAr: `حدث جديد "${eventTitleAr}" يناسب تخصصك متاح الآن للتسجيل.`,
        eventId
      })
    }
  } catch (error) {
    console.error("Error notifying marshals:", error)
  }
}

// Helper: Notify marshal about registration status
export async function notifyMarshalAboutRegistration(
  userId: string,
  eventTitleEn: string,
  eventTitleAr: string,
  eventId: string,
  approved: boolean,
  eventDate?: Date,
  eventLocation?: string,
  eventTime?: string
) {
  try {
    // Format event date if provided
    let eventDateAr = ''
    let eventDateEn = ''
    if (eventDate) {
      eventDateAr = new Date(eventDate).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      eventDateEn = new Date(eventDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const locationInfo = eventLocation ? `\nالموقع: ${eventLocation}` : ''
    const locationInfoEn = eventLocation ? `\nLocation: ${eventLocation}` : ''
    
    const timeInfo = eventTime ? `\nالوقت: ${eventTime}` : ''
    const timeInfoEn = eventTime ? `\nTime: ${eventTime}` : ''
    
    const dateInfo = eventDate ? `\nالتاريخ: ${eventDateAr}` : ''
    const dateInfoEn = eventDate ? `\nDate: ${eventDateEn}` : ''

    if (approved) {
      await createNotification({
        userId,
        type: "REGISTRATION_APPROVED",
        titleEn: "Registration Approved ✅",
        titleAr: "تم قبول التسجيل ✅",
        messageEn: `Your registration for "${eventTitleEn}" has been approved. See you there!${dateInfoEn}${timeInfoEn}${locationInfoEn}`,
        messageAr: `تم قبول تسجيلك في "${eventTitleAr}". نراك هناك!${dateInfo}${timeInfo}${locationInfo}`,
        eventId
      })
    } else {
      await createNotification({
        userId,
        type: "REGISTRATION_REJECTED",
        titleEn: "Registration Not Approved ❌",
        titleAr: "لم يتم قبول التسجيل ❌",
        messageEn: `Your registration for "${eventTitleEn}" was not approved.${dateInfoEn}`,
        messageAr: `لم يتم قبول تسجيلك في "${eventTitleAr}".${dateInfo}`,
        eventId
      })
    }
  } catch (error) {
    console.error("Error notifying marshal:", error)
  }
}

// Helper: Notify admins about new registration
export async function notifyAdminsAboutNewRegistration(
  marshalName: string,
  eventTitleEn: string,
  eventTitleAr: string,
  eventId: string,
  marshalEmployeeId?: string,
  marshalPhone?: string,
  marshalTypes?: string,
  eventDate?: Date
) {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "admin" }
    })

    // Format event date if provided
    let eventDateAr = ''
    let eventDateEn = ''
    if (eventDate) {
      eventDateAr = new Date(eventDate).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      eventDateEn = new Date(eventDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    for (const admin of admins) {
      const contactInfo = marshalEmployeeId && marshalPhone 
        ? `${marshalName} (${marshalEmployeeId}) - ${marshalPhone}` 
        : marshalName
      
      const marshalTypeInfo = marshalTypes ? `\nنوع المارشال: ${marshalTypes}` : ''
      const marshalTypeInfoEn = marshalTypes ? `\nMarshal Type: ${marshalTypes}` : ''
      
      const dateInfo = eventDate ? `\nتاريخ الفعالية: ${eventDateAr}` : ''
      const dateInfoEn = eventDate ? `\nEvent Date: ${eventDateEn}` : ''
      
      await createNotification({
        userId: admin.id,
        type: "NEW_EVENT",
        titleEn: "New Marshal Registration",
        titleAr: "تسجيل مارشال جديد",
        messageEn: `${contactInfo} has registered for "${eventTitleEn}".${marshalTypeInfoEn}${dateInfoEn}`,
        messageAr: `${contactInfo} سجل في "${eventTitleAr}".${marshalTypeInfo}${dateInfo}`,
        eventId
      })
    }
  } catch (error) {
    console.error("Error notifying admins:", error)
  }
}

// Helper: Notify all registered marshals about event update
export async function notifyMarshalsAboutEventUpdate(
  eventId: string,
  eventTitleEn: string,
  eventTitleAr: string,
  updateMessage: string
) {
  try {
    const attendances = await prisma.attendance.findMany({
      where: {
        eventId,
        status: "approved"
      },
      include: { user: true }
    })

    for (const attendance of attendances) {
      await createNotification({
        userId: attendance.userId,
        type: "EVENT_UPDATED",
        titleEn: "Event Updated",
        titleAr: "تم تحديث الحدث",
        messageEn: `"${eventTitleEn}" has been updated. ${updateMessage}`,
        messageAr: `تم تحديث "${eventTitleAr}". ${updateMessage}`,
        eventId
      })
    }
  } catch (error) {
    console.error("Error notifying marshals about update:", error)
  }
}

// Helper: Notify registered marshals about event cancellation
export async function notifyMarshalsAboutEventCancellation(
  eventId: string,
  eventTitleEn: string,
  eventTitleAr: string
) {
  try {
    const attendances = await prisma.attendance.findMany({
      where: { eventId },
      include: { user: true }
    })

    for (const attendance of attendances) {
      await createNotification({
        userId: attendance.userId,
        type: "EVENT_CANCELLED",
        titleEn: "Event Cancelled",
        titleAr: "تم إلغاء الحدث",
        messageEn: `"${eventTitleEn}" has been cancelled.`,
        messageAr: `تم إلغاء "${eventTitleAr}".`,
        eventId
      })
    }
  } catch (error) {
    console.error("Error notifying marshals about cancellation:", error)
  }
}
