import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@kmt.kw' },
    update: {},
    create: {
      email: 'admin@kmt.kw',
      name: 'Admin',
      password: hashedPassword,
      phone: '+965 9999 9999',
      civilId: '000000000000',
      dateOfBirth: new Date('1990-01-01'),
      role: 'admin',
      employeeId: 'ADMIN-001',
      marshalTypes: '',
    },
  })

  console.log('✅ Admin user created:', admin.email)
  
  // Create sample marshal
  const marshalPassword = await bcrypt.hash('marshal123', 10)
  
  const marshal = await prisma.user.upsert({
    where: { email: 'marshal@kmt.kw' },
    update: {},
    create: {
      email: 'marshal@kmt.kw',
      name: 'Ahmed Al-Kandari',
      password: marshalPassword,
      phone: '+965 5555 5555',
      civilId: '123456789012',
      dateOfBirth: new Date('1995-05-15'),
      role: 'marshal',
      employeeId: 'KMT-100',
      marshalTypes: 'drift,circuit,rescue',
    },
  })

  console.log('✅ Sample marshal created:', marshal.email)
  
  // Create Yahnag user
  const yahnagPassword = await bcrypt.hash('yahnag123', 10)
  
  const yahnag = await prisma.user.upsert({
    where: { email: 'yahnag@kmt.kw' },
    update: {},
    create: {
      email: 'yahnag@kmt.kw',
      name: 'Yahnag',
      password: yahnagPassword,
      phone: '+965 7777 7777',
      civilId: '987654321098',
      dateOfBirth: new Date('1992-08-20'),
      role: 'marshal',
      employeeId: 'KMT-200',
      marshalTypes: 'circuit,drift,rescue',
    },
  })

  console.log('✅ Yahnag user created:', yahnag.email)
  
  // Create sample events
  const event1 = await prisma.event.create({
    data: {
      titleEn: 'Kuwait Motor Town Track Day',
      titleAr: 'يوم الحلبة المفتوح',
      descriptionEn: 'Open track day for all motorsport enthusiasts',
      descriptionAr: 'يوم مفتوح للحلبة لجميع عشاق رياضة المحركات',
      date: new Date('2025-11-20'),
      time: '08:00 AM',
      endTime: '05:00 PM',
      location: 'Kuwait International Circuit',
      marshalTypes: 'circuit,rescue',
      maxMarshals: 15,
      status: 'active'
    }
  })

  const event2 = await prisma.event.create({
    data: {
      titleEn: 'Drift Competition 2025',
      titleAr: 'بطولة الدريفت 2025',
      descriptionEn: 'Professional drift competition',
      descriptionAr: 'بطولة دريفت احترافية',
      date: new Date('2025-11-25'),
      time: '06:00 PM',
      endTime: '10:00 PM',
      location: 'KMT Drift Arena',
      marshalTypes: 'drift,rescue',
      maxMarshals: 20,
      status: 'active'
    }
  })

  console.log('✅ Sample events created')
  
  // Create current events for testing
  const currentEvent1 = await prisma.event.create({
    data: {
      titleEn: 'MX Open Track Day',
      titleAr: 'يوم الحلبة المفتوح للموتوكروس',
      descriptionEn: 'Motocross open track day',
      descriptionAr: 'يوم مفتوح للحلبة للموتوكروس',
      date: new Date('2025-12-24'),
      time: '10:00',
      endTime: '15:00',
      location: 'Off-Road > Motocross',
      marshalTypes: 'circuit,rescue',
      maxMarshals: 10,
      status: 'active'
    }
  })

  const currentEvent2 = await prisma.event.create({
    data: {
      titleEn: 'Private (BIKE) Attendance at 10AM',
      titleAr: 'حضور خاص (دراجة) الساعة 10 صباحاً',
      descriptionEn: 'Private bike attendance session',
      descriptionAr: 'جلسة حضور خاصة للدراجات',
      date: new Date('2025-12-23'),
      time: '11:00',
      endTime: '16:00',
      location: 'Main Circuit',
      marshalTypes: 'circuit,rescue',
      maxMarshals: 5,
      status: 'active'
    }
  })

  console.log('✅ Current events created for testing')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
