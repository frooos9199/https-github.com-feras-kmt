const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixMissingEventMarshals() {
  try {
    const eventId = 'cmjj0e3a10000ju04j4n7e5vs';
    
    console.log('🔧 Fixing missing EventMarshal records for event:', eventId);
    
    // الحصول على جميع المستخدمين المعتمدين في attendances
    const approvedAttendances = await prisma.attendance.findMany({
      where: { 
        eventId,
        status: 'approved'
      },
      select: { 
        id: true,
        userId: true,
        registeredAt: true
      }
    });
    
    console.log('📊 Found', approvedAttendances.length, 'approved attendances');
    
    // الحصول على جميع المستخدمين في eventMarshals
    const existingEventMarshals = await prisma.eventMarshal.findMany({
      where: { eventId },
      select: { marshalId: true }
    });
    
    const existingMarshalIds = existingEventMarshals.map(em => em.marshalId);
    console.log('📊 Found', existingMarshalIds.length, 'existing EventMarshal records');
    
    // العثور على المستخدمين المفقودين
    const missingAttendances = approvedAttendances.filter(att => 
      !existingMarshalIds.includes(att.userId)
    );
    
    console.log('⚠️ Found', missingAttendances.length, 'missing EventMarshal records');
    
    if (missingAttendances.length === 0) {
      console.log('✅ No missing records to fix');
      return;
    }
    
    // إنشاء EventMarshal records المفقودة
    const createdRecords = [];
    for (const attendance of missingAttendances) {
      try {
        const eventMarshal = await prisma.eventMarshal.create({
          data: {
            eventId: eventId,
            marshalId: attendance.userId,
            status: 'approved',
            invitedAt: attendance.registeredAt,
            respondedAt: attendance.registeredAt,
            notes: 'Auto-created from approved attendance'
          }
        });
        
        createdRecords.push(eventMarshal);
        console.log('✅ Created EventMarshal for user:', attendance.userId);
        
      } catch (error) {
        console.error('❌ Failed to create EventMarshal for user:', attendance.userId, error.message);
      }
    }
    
    console.log('🎉 Successfully created', createdRecords.length, 'EventMarshal records');
    
    // التحقق من النتيجة
    const finalCount = await prisma.eventMarshal.count({
      where: { eventId }
    });
    
    console.log('📈 Final EventMarshal count:', finalCount);
    
  } catch (error) {
    console.error('💥 Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMissingEventMarshals();
