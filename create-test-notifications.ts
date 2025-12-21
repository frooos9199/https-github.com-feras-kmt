import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestNotifications() {
  try {
    // Get admin user
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@kmt.kw' }
    })

    if (!admin) {
      console.log('❌ Admin user not found')
      return
    }

    // Create test notifications
    const notifications = await prisma.notification.createMany({
      data: [
        {
          userId: admin.id,
          type: 'NEW_EVENT',
          titleEn: 'New Event Created',
          titleAr: 'تم إنشاء حدث جديد',
          messageEn: 'A new motorsport event has been scheduled for this weekend.',
          messageAr: 'تم جدولة حدث رياضة محركات جديد لهذا الأسبوع.',
          eventId: null,
          isRead: false
        },
        {
          userId: admin.id,
          type: 'EVENT_REMINDER',
          titleEn: 'Event Reminder',
          titleAr: 'تذكير بالحدث',
          messageEn: 'Don\'t forget about the track day tomorrow at 8 AM.',
          messageAr: 'لا تنس يوم الحلبة غداً الساعة 8 صباحاً.',
          eventId: null,
          isRead: false
        },
        {
          userId: admin.id,
          type: 'REGISTRATION_APPROVED',
          titleEn: 'Registration Approved',
          titleAr: 'تمت الموافقة على التسجيل',
          messageEn: 'Your registration for the drift competition has been approved.',
          messageAr: 'تمت الموافقة على تسجيلك في بطولة الدريفت.',
          eventId: null,
          isRead: true
        }
      ]
    })

    console.log(`✅ Created ${notifications.count} test notifications`)
  } catch (error) {
    console.error('❌ Error creating test notifications:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestNotifications()