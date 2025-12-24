const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDuplicates() {
  try {
    console.log('🔍 فحص التكرارات في جداول المارشالين...\n');

    // فحص التكرارات في EventMarshal
    const eventMarshalsDuplicates = await prisma.$queryRaw`
      SELECT "eventId", "marshalId", COUNT(*) as count
      FROM "EventMarshal"
      GROUP BY "eventId", "marshalId"
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `;

    console.log('📋 التكرارات في EventMarshal:');
    if (eventMarshalsDuplicates.length === 0) {
      console.log('✅ لا توجد تكرارات في EventMarshal');
    } else {
      console.log('❌ تم العثور على التكرارات التالية:');
      eventMarshalsDuplicates.forEach((dup, index) => {
        console.log(`${index + 1}. Event: ${dup.eventId}, Marshal: ${dup.marshalId}, Count: ${dup.count}`);
      });
    }

    // فحص التكرارات في Attendance
    const attendancesDuplicates = await prisma.$queryRaw`
      SELECT "eventId", "userId", COUNT(*) as count
      FROM "Attendance"
      GROUP BY "eventId", "userId"
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `;

    console.log('\n📋 التكرارات في Attendance:');
    if (attendancesDuplicates.length === 0) {
      console.log('✅ لا توجد تكرارات في Attendance');
    } else {
      console.log('❌ تم العثور على التكرارات التالية:');
      attendancesDuplicates.forEach((dup, index) => {
        console.log(`${index + 1}. Event: ${dup.eventId}, User: ${dup.userId}, Count: ${dup.count}`);
      });
    }

    // فحص المارشالين الذين هم في كلا الجدولين لنفس الحدث
    const overlappingRecords = await prisma.$queryRaw`
      SELECT
        em."eventId",
        em."marshalId" as userId,
        em.status as eventMarshalStatus,
        a.status as attendanceStatus,
        em."invitedAt",
        a."registeredAt"
      FROM "EventMarshal" em
      INNER JOIN "Attendance" a ON em."eventId" = a."eventId" AND em."marshalId" = a."userId"
      ORDER BY em."eventId", em."marshalId"
    `;

    console.log('\n📋 المارشالين الموجودين في كلا الجدولين:');
    if (overlappingRecords.length === 0) {
      console.log('✅ لا توجد تداخلات بين EventMarshal و Attendance');
    } else {
      console.log('⚠️ تم العثور على التداخلات التالية:');
      overlappingRecords.forEach((record, index) => {
        console.log(`${index + 1}. Event: ${record.eventId}, User: ${record.userId}`);
        console.log(`   - EventMarshal Status: ${record.eventMarshalStatus}, Invited: ${record.invitedAt}`);
        console.log(`   - Attendance Status: ${record.attendanceStatus}, Registered: ${record.registeredAt}`);
      });
    }

    // إحصائيات عامة
    const eventMarshalCount = await prisma.eventMarshal.count();
    const attendanceCount = await prisma.attendance.count();

    console.log('\n📊 الإحصائيات العامة:');
    console.log(`- إجمالي سجلات EventMarshal: ${eventMarshalCount}`);
    console.log(`- إجمالي سجلات Attendance: ${attendanceCount}`);

    // فحص الحالات المختلفة في EventMarshal
    const eventMarshalStatuses = await prisma.eventMarshal.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
      orderBy: {
        _count: {
          status: 'desc',
        },
      },
    });

    console.log('\n📋 توزيع حالات EventMarshal:');
    eventMarshalStatuses.forEach(status => {
      console.log(`- ${status.status}: ${status._count.status}`);
    });

    // فحص الحالات المختلفة في Attendance
    const attendanceStatuses = await prisma.attendance.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
      orderBy: {
        _count: {
          status: 'desc',
        },
      },
    });

    console.log('\n📋 توزيع حالات Attendance:');
    attendanceStatuses.forEach(status => {
      console.log(`- ${status.status}: ${status._count.status}`);
    });

    // فحص المارشالين المقبولين في كلا الجدولين
    const acceptedInBoth = await prisma.$queryRaw`
      SELECT
        em."eventId",
        em."marshalId" as userId,
        u.name,
        em.status as eventMarshalStatus,
        a.status as attendanceStatus
      FROM "EventMarshal" em
      INNER JOIN "Attendance" a ON em."eventId" = a."eventId" AND em."marshalId" = a."userId"
      INNER JOIN "User" u ON em."marshalId" = u.id
      WHERE em.status = 'accepted' AND a.status = 'approved'
      ORDER BY em."eventId", u.name
    `;

    console.log('\n📋 المارشالين المقبولين في كلا الجدولين (الوضع الصحيح):');
    if (acceptedInBoth.length === 0) {
      console.log('⚠️ لا يوجد مارشالين مقبولين في كلا الجدولين');
    } else {
      console.log('✅ تم العثور على المارشالين المقبولين:');
      acceptedInBoth.forEach((record, index) => {
        console.log(`${index + 1}. ${record.name} (Event: ${record.eventId})`);
      });
    }

  } catch (error) {
    console.error('❌ خطأ في فحص قاعدة البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDuplicates();