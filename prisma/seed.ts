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
      employeeId: 'KMT-001',
      marshalTypes: 'drift,circuit,rescue',
    },
  })

  console.log('✅ Sample marshal created:', marshal.email)
  
  // Create sample events
  const event1 = await prisma.event.create({
    data: {
      titleEn: 'Kuwait Motor Town Track Day',
      titleAr: 'يوم الحلبة المفتوح',
      descriptionEn: 'Open track day for all motorsport enthusiasts',
      descriptionAr: 'يوم مفتوح للحلبة لجميع عشاق رياضة المحركات',
      date: new Date('2025-11-20'),
      time: '08:00 AM',
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
      location: 'KMT Drift Arena',
      marshalTypes: 'drift,rescue',
      maxMarshals: 20,
      status: 'active'
    }
  })

  console.log('✅ Sample events created')
  console.log('\n📋 Login Credentials:')
  console.log('Admin: admin@kmt.kw / admin123')
  console.log('Marshal: marshal@kmt.kw / marshal123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
