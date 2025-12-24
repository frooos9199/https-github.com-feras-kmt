const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupMarshalData() {
  console.log('🧹 بدء تنظيف بيانات المارشالين...');

  try {
    // 1. حذف السجلات التي تحتوي على marshalId/userId فارغ أو undefined
    console.log('حذف السجلات الفارغة...');

    // حذف السجلات الفارغة من EventMarshal باستخدام SQL
    const deletedEventMarshalsResult = await prisma.$executeRaw`
      DELETE FROM "EventMarshal"
      WHERE "marshalId" IS NULL
         OR "marshalId" = 'undefined'
         OR status IS NULL
         OR status = 'undefined'
    `;

    // حذف السجلات الفارغة من Attendance باستخدام SQL
    const deletedAttendancesResult = await prisma.$executeRaw`
      DELETE FROM "Attendance"
      WHERE "userId" IS NULL
         OR "userId" = 'undefined'
         OR status IS NULL
         OR status = 'undefined'
    `;

    const deletedEventMarshals = { count: deletedEventMarshalsResult };
    const deletedAttendances = { count: deletedAttendancesResult };

    console.log(`✅ تم حذف ${deletedEventMarshals.count} سجل من EventMarshal`);
    console.log(`✅ تم حذف ${deletedAttendances.count} سجل من Attendance`);

    // 2. العثور على التداخلات المتبقية وحذف المكررات
    console.log('البحث عن التداخلات المتبقية...');

    const overlappingRecords = await prisma.$queryRaw`
      SELECT
        em.id as "eventMarshalId",
        em."eventId",
        em."marshalId" as "userId",
        em.status as "emStatus",
        em."invitedAt",
        a.id as "attendanceId",
        a.status as "aStatus",
        a."registeredAt"
      FROM "EventMarshal" em
      INNER JOIN "Attendance" a ON em."eventId" = a."eventId" AND em."marshalId" = a."userId"
      WHERE em.status = 'accepted' AND a.status = 'approved'
    `;

    console.log(`تم العثور على ${overlappingRecords.length} تداخل صحيح (accepted/approved)`);

    // 3. التحقق من التداخلات غير المنطقية
    const problematicOverlaps = await prisma.$queryRaw`
      SELECT
        em.id as "eventMarshalId",
        em."eventId",
        em."marshalId" as "userId",
        em.status as "emStatus",
        em."invitedAt",
        a.id as "attendanceId",
        a.status as "aStatus",
        a."registeredAt"
      FROM "EventMarshal" em
      INNER JOIN "Attendance" a ON em."eventId" = a."eventId" AND em."marshalId" = a."userId"
      WHERE NOT (em.status = 'accepted' AND a.status = 'approved')
    `;

    console.log(`تم العثور على ${problematicOverlaps.length} تداخل غير منطقي`);

    if (problematicOverlaps.length > 0) {
      console.log('حذف التداخلات غير المنطقية...');

      for (const overlap of problematicOverlaps) {
        // احتفظ بالسجل الأحدث في حالة الرفض
        if (overlap.emStatus === 'rejected' || overlap.aStatus === 'rejected') {
          // احذف من Attendance إذا كان في EventMarshal rejected
          if (overlap.emStatus === 'rejected') {
            await prisma.attendance.delete({
              where: { id: overlap.attendanceId }
            });
          }
          // احذف من EventMarshal إذا كان في Attendance rejected
          else if (overlap.aStatus === 'rejected') {
            await prisma.eventMarshal.delete({
              where: { id: overlap.eventMarshalId }
            });
          }
        }
        // في حالات أخرى، احذف التكرار الأقدم
        else {
          const emDate = new Date(overlap.invitedAt);
          const aDate = new Date(overlap.registeredAt);

          if (emDate > aDate) {
            await prisma.attendance.delete({
              where: { id: overlap.attendanceId }
            });
          } else {
            await prisma.eventMarshal.delete({
              where: { id: overlap.eventMarshalId }
            });
          }
        }
      }

      console.log(`✅ تم حل ${problematicOverlaps.length} تداخل غير منطقي`);
    }

    // 4. التحقق من صحة البيانات المتبقية
    console.log('التحقق من صحة البيانات المتبقية...');

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

    // 5. التحقق من عدم وجود تداخلات متبقية
    const remainingOverlaps = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM "EventMarshal" em
      INNER JOIN "Attendance" a ON em."eventId" = a."eventId" AND em."marshalId" = a."userId"
    `;

    console.log(`🔍 التداخلات المتبقية: ${remainingOverlaps[0].count}`);

    console.log('🎉 تم تنظيف البيانات بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في تنظيف البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupMarshalData();