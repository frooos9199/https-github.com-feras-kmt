/**
 * Create Demo Events for App Store Review
 * 
 * Run this script to add demo events:
 * npx tsx scripts/create-demo-events.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createDemoEvents() {
  try {
    console.log('📅 Creating demo events for App Store review...\n');

    const demoEvents = [
      {
        titleEn: 'Drag Racing Championship 2025',
        titleAr: 'بطولة سباق التسارع 2025',
        descriptionEn: 'Annual drag racing championship featuring the fastest cars in the region. Marshals required for safety and track management.',
        descriptionAr: 'بطولة سباق التسارع السنوية التي تضم أسرع السيارات في المنطقة. المارشالات مطلوبون للسلامة وإدارة المسار.',
        date: new Date('2025-01-15T14:00:00Z'),
        endDate: new Date('2025-01-15T22:00:00Z'),
        time: '14:00',
        endTime: '22:00',
        location: 'KMT Racing Circuit, Riyadh',
        marshalTypes: 'drag-race',
        maxMarshals: 20,
        status: 'active',
      },
      {
        titleEn: 'Drift Competition - Winter Series',
        titleAr: 'مسابقة الدريفت - سلسلة الشتاء',
        descriptionEn: 'Professional drift competition with international drivers. High-intensity event requiring experienced marshals.',
        descriptionAr: 'مسابقة دريفت احترافية مع سائقين دوليين. حدث عالي الكثافة يتطلب مارشالات ذوي خبرة.',
        date: new Date('2025-01-20T16:00:00Z'),
        endDate: new Date('2025-01-20T23:00:00Z'),
        time: '16:00',
        endTime: '23:00',
        location: 'Jeddah Drift Arena',
        marshalTypes: 'drift',
        maxMarshals: 15,
        status: 'active',
      },
      {
        titleEn: 'Circuit Racing - Practice Session',
        titleAr: 'سباق الحلبة - جلسة تدريبية',
        descriptionEn: 'Practice session for upcoming circuit racing championship. Great opportunity for new marshals to gain experience.',
        descriptionAr: 'جلسة تدريبية لبطولة سباق الحلبة القادمة. فرصة رائعة للمارشالات الجدد لاكتساب الخبرة.',
        date: new Date('2025-01-25T10:00:00Z'),
        endDate: new Date('2025-01-25T18:00:00Z'),
        time: '10:00',
        endTime: '18:00',
        location: 'Saudi Motorsport Circuit',
        marshalTypes: 'circuit',
        maxMarshals: 25,
        status: 'active',
      },
    ];

    for (const event of demoEvents) {
      const existing = await prisma.event.findFirst({
        where: { titleEn: event.titleEn },
      });

      if (existing) {
        console.log(`⚠️  Event "${event.titleEn}" already exists. Skipping...`);
      } else {
        await prisma.event.create({ data: event });
        console.log(`✅ Created: ${event.titleEn}`);
      }
    }

    console.log('\n✅ Demo events created successfully!\n');
    
    const totalEvents = await prisma.event.count();
    console.log(`📊 Total events in database: ${totalEvents}\n`);

  } catch (error) {
    console.error('❌ Error creating demo events:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoEvents();
