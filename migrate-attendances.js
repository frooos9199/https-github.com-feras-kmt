const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateApprovedAttendances() {
  try {
    console.log('🔄 بدء نقل البيانات من attendances إلى eventMarshals...');

    // جلب جميع طلبات الحضور المعتمدة
    const approvedAttendances = await prisma.attendance.findMany({
      where: { status: 'approved' },
      include: {
        user: { select: { id: true, name: true, employeeId: true } },
        event: { select: { id: true, titleEn: true, titleAr: true } }
      }
    });

    console.log(`📋 تم العثور على ${approvedAttendances.length} طلب حضور معتمد`);

    let migrated = 0;
    let skipped = 0;

    for (const attendance of approvedAttendances) {
      try {
        // التحقق من عدم وجود المارشال مسبقاً في الحدث
        const existing = await prisma.eventMarshal.findUnique({
          where: {
            eventId_marshalId: {
              eventId: attendance.eventId,
              marshalId: attendance.userId
            }
          }
        });

        if (!existing) {
          // إضافة المارشال إلى الحدث
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

          console.log(`✅ تم إضافة ${attendance.user.employeeId} ${attendance.user.name} إلى ${attendance.event.titleEn}`);
          migrated++;
        } else {
          console.log(`⏭️ تم تخطي ${attendance.user.employeeId} (موجود مسبقاً)`);
          skipped++;
        }
      } catch (error) {
        console.error(`❌ خطأ في إضافة ${attendance.user.employeeId}:`, error.message);
      }
    }

    console.log('');
    console.log('📊 ملخص العملية:');
    console.log(`✅ تم النقل: ${migrated}`);
    console.log(`⏭️ تم التخطي: ${skipped}`);
    console.log(`📈 إجمالي: ${migrated + skipped}`);

  } catch (error) {
    console.error('❌ خطأ في العملية:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateApprovedAttendances();