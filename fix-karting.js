const { PrismaClient } = require('@prisma/client');

async function fixKartingEvent() {
  const prisma = new PrismaClient();
  const eventId = 'cmjgv3vap0000jx04obgcga7x';

  try {
    console.log('🔧 بدء إصلاح بيانات حدث Karting...');

    // العثور على جميع الحضور المعتمد بدون مارشال مقابل
    const attendances = await prisma.attendance.findMany({
      where: {
        eventId: eventId,
        status: 'approved'
      },
      include: {
        user: true
      }
    });

    console.log(`📊 تم العثور على ${attendances.length} حضور معتمد`);

    let fixed = 0;
    for (const attendance of attendances) {
      if (!attendance.user) {
        console.log(`🗑️ حذف حضور محذوف للمستخدم: ${attendance.userId}`);
        await prisma.attendance.delete({
          where: { id: attendance.id }
        });
        fixed++;
        continue;
      }

      // فحص إذا كان المستخدم موجود في eventMarshals
      const existingMarshal = await prisma.eventMarshal.findUnique({
        where: {
          eventId_marshalId: {
            eventId: eventId,
            marshalId: attendance.userId
          }
        }
      });

      if (!existingMarshal) {
        console.log(`➕ إضافة مارشال مفقود: ${attendance.user.employeeId} ${attendance.user.name}`);
        await prisma.eventMarshal.create({
          data: {
            eventId: eventId,
            marshalId: attendance.userId,
            status: 'accepted',
            invitedAt: new Date(),
            respondedAt: new Date()
          }
        });
        fixed++;
      } else {
        console.log(`✅ المارشال موجود: ${attendance.user.employeeId} ${attendance.user.name}`);
      }
    }

    // التحقق من النتيجة
    const finalEventMarshals = await prisma.eventMarshal.findMany({
      where: { eventId: eventId, status: 'accepted' },
      include: { marshal: { select: { employeeId: true, name: true, image: true } } }
    });

    const finalAttendances = await prisma.attendance.findMany({
      where: { eventId: eventId, status: 'approved' },
      include: { user: { select: { employeeId: true, name: true, image: true } } }
    });

    console.log('\n📋 النتيجة النهائية:');
    console.log(`Event Marshals (مقبولين): ${finalEventMarshals.length}`);
    finalEventMarshals.forEach(em => {
      console.log(`  - ${em.marshal.employeeId} ${em.marshal.name} (صورة: ${em.marshal.image ? '✅' : '❌'})`);
    });

    console.log(`Attendances (معتمدين): ${finalAttendances.length}`);
    finalAttendances.forEach(att => {
      console.log(`  - ${att.user.employeeId} ${att.user.name} (صورة: ${att.user.image ? '✅' : '❌'})`);
    });

    console.log(`\n✅ تم إصلاح ${fixed} سجل`);

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixKartingEvent();