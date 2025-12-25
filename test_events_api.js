const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testEventsAPI() {
  try {
    // اختبار مع مارشال تم قبوله في الحدث
    const userId = 'cmjfi7g8g0000jm0498b1pffj'; // Kareem Abdelsalam
    const eventId = 'cmjj0e3a10000ju04j4n7e5vs'; // Motorbike & Cars event
    
    console.log('Testing events API for user:', userId);
    
    // محاكاة منطق الـ API
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { marshalTypes: true }
    });
    
    const userTypes = user?.marshalTypes ? user.marshalTypes.split(',').filter((t) => t) : [];
    console.log('User marshal types:', userTypes);
    
    const events = await prisma.event.findMany({
      where: {
        AND: [
          {
            OR: userTypes.map((type) => ({
              marshalTypes: {
                contains: type.trim()
              }
            }))
          },
          {
            OR: [
              {
                eventMarshals: {
                  some: {
                    marshalId: userId,
                    status: {
                      in: ['invited', 'accepted', 'approved']
                    }
                  }
                }
              },
              {
                attendances: {
                  some: {
                    userId: userId,
                    status: 'approved'
                  }
                }
              }
            ]
          }
        ]
      },
      select: {
        id: true,
        titleEn: true,
        titleAr: true,
        date: true
      }
    });
    
    console.log('Events returned for this user:', events.length);
    events.forEach(event => {
      console.log('- ' + event.titleEn + ' (' + event.id + ')');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testEventsAPI();
