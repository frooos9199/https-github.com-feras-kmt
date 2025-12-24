const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function completeMigration() {
  try {
    console.log('🔄 إكمال نقل البيانات...');

    const approvedAttendances = await prisma.attendance.findMany({
      where: { status: 'approved' },
      include: {
        user: { select: { id: true, name: true, employeeId: true } },
        event: { select: { id: true, titleEn: true } }
      }
    });

    let migrated = 0;

    for (const attendance of approvedAttendances) {
      const existing = await prisma.eventMarshal.findUnique({
        where: {
          eventId_marshalId: {
            eventId: attendance.eventId,
            marshalId: attendance.userId
          }
        }
      });

      if (!existing) {
        await prisma.eventMarshal.create({
          data: {
            eventId: attendance.eventId,
            marshalId: attendance.userId,
            status: 'accepted',
            invitedAt: attendance.registeredAt,
            respondedAt: attendance.registeredAt,
            notes: 'Migrated from approved attendance'
          }
        });
        migrated++;
      }
    }

    console.log(`✅ تم نقل ${migrated} مارشال إضافي`);

    const finalCount = await prisma.eventMarshal.count({ where: { status: 'accepted' } });
    console.log(`📊 إجمالي المارشالز المقبولين الآن: ${finalCount}`);

  } catch (error) {
    console.error('خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

completeMigration();