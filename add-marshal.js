import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function addTestMarshal() {
  const marshalPassword = await bcrypt.hash('test123', 10)

  const testMarshal = await prisma.user.upsert({
    where: { email: 'test@kmt.kw' },
    update: {},
    create: {
      email: 'test@kmt.kw',
      name: 'Test Marshal',
      password: marshalPassword,
      phone: '+965 6666 6666',
      civilId: '111111111111',
      dateOfBirth: new Date('1990-01-01'),
      role: 'marshal',
      employeeId: 'KMT-300',
      marshalTypes: 'circuit,rescue',
      isActive: true,
    },
  })

  console.log('✅ Test marshal created:', testMarshal.email)
  console.log('Marshal types:', testMarshal.marshalTypes)
}

addTestMarshal()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })