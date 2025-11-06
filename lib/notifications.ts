import { prisma } from "./prisma"

type NotificationType =
  | "NEW_EVENT"
  | "REGISTRATION_APPROVED"
  | "REGISTRATION_REJECTED"
  | "EVENT_REMINDER"
  | "EVENT_UPDATED"
  | "EVENT_CANCELLED"

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
  try {
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
  } catch (error) {
    console.error("Error creating notification:", error)
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
  approved: boolean
) {
  try {
    if (approved) {
      await createNotification({
        userId,
        type: "REGISTRATION_APPROVED",
        titleEn: "Registration Approved",
        titleAr: "تم قبول التسجيل",
        messageEn: `Your registration for "${eventTitleEn}" has been approved. See you there!`,
        messageAr: `تم قبول تسجيلك في "${eventTitleAr}". نراك هناك!`,
        eventId
      })
    } else {
      await createNotification({
        userId,
        type: "REGISTRATION_REJECTED",
        titleEn: "Registration Not Approved",
        titleAr: "لم يتم قبول التسجيل",
        messageEn: `Your registration for "${eventTitleEn}" was not approved.`,
        messageAr: `لم يتم قبول تسجيلك في "${eventTitleAr}".`,
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
  eventId: string
) {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "admin" }
    })

    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        type: "NEW_EVENT",
        titleEn: "New Marshal Registration",
        titleAr: "تسجيل مارشال جديد",
        messageEn: `${marshalName} has registered for "${eventTitleEn}".`,
        messageAr: `${marshalName} سجل في "${eventTitleAr}".`,
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
