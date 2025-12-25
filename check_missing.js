const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMissing() {
  try {
    const eventId = 'cmjj0e3a10000ju04j4n7e5vs';
    
    // الحصول على جميع المستخدمين المعتمدين في attendances
    const approvedAttendances = await prisma.attendance.findMany({
      where: { 
        eventId,
        status: 'approved'
      },
      select: { userId: true }
    });
    
    const approvedUserIds = approvedAttendances.map(a => a.userId);
    console.log('Approved attendance userIds:', approvedUserIds.length);
    
    // الحصول على جميع المستخدمين في eventMarshals
    const eventMarshals = await prisma.eventMarshal.findMany({
      where: { eventId },
      select: { marshalId: true }
    });
    
    const marshalIds = eventMarshals.map(em => em.marshalId);
    console.log('EventMarshal marshalIds:', marshalIds.length);
    
    // العثور على المستخدمين الموجودين في attendances لكن ليس في eventMarshals
    const missingInEventMarshals = approvedUserIds.filter(id => !marshalIds.includes(id));
    console.log('Users in attendances but missing from eventMarshals:', missingInEventMarshals.length);
    
    if (missingInEventMarshals.length > 0) {
      console.log('\nDetails of missing users:');
      for (const userId of missingInEventMarshals) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, email: true }
        });
        const attendance = await prisma.attendance.findFirst({
          where: { eventId, userId, status: 'approved' },
          select: { registeredAt: true }
        });
        console.log('- ' + user.name + ' (' + user.email + ') registered at: ' + attendance.registeredAt);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMissing();
