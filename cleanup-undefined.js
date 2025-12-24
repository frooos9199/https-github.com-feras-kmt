const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupUndefinedRecords() {
  console.log('🧹 حذف السجلات التي تحتوي على "undefined" كقيم...');

  try {
    // حذف السجلات التي تحتوي على "undefined" كقيم نصية
    console.log('حذف السجلات التي تحتوي على "undefined"...');

    const deletedEventMarshals = await prisma.$executeRaw`
      DELETE FROM "EventMarshal"
      WHERE "marshalId" = 'undefined'
         OR status = 'undefined'
    `;

    const deletedAttendances = await prisma.$executeRaw`
      DELETE FROM "Attendance"
      WHERE "userId" = 'undefined'
         OR status = 'undefined'
    `;

    console.log(`✅ تم حذف ${deletedEventMarshals} سجل من EventMarshal`);
    console.log(`✅ تم حذف ${deletedAttendances} سجل من Attendance`);

    // التحقق من النتائج
    const finalEventMarshals = await prisma.eventMarshal.findMany({
      select: {
        id: true,
        eventId: true,
        marshalId: true,
        status: true,
        invitedAt: true
      }
    });

    const finalAttendances = await prisma.attendance.findMany({
      select: {
        id: true,
        eventId: true,
        userId: true,
        status: true,
        registeredAt: true
      }
    });

    console.log(`📊 البيانات النهائية:`);
    console.log(`- EventMarshal: ${finalEventMarshals.length} سجل`);
    console.log(`- Attendance: ${finalAttendances.length} سجل`);

    // إحصائيات الحالات
    const emStats = finalEventMarshals.reduce((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {});

    const aStats = finalAttendances.reduce((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {});

    console.log('📋 توزيع حالات EventMarshal النهائية:', emStats);
    console.log('📋 توزيع حالات Attendance النهائية:', aStats);

    console.log('🎉 تم تنظيف السجلات المتبقية بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في تنظيف السجلات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupUndefinedRecords();