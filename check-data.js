import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkEvent() {
  const event = await prisma.event.findUnique({
    where: { id: 'cmji6bcal0004jo04gw1upv47' },
    select: {
      id: true,
      titleEn: true,
      marshalTypes: true,
      maxMarshals: true
    }
  })

  console.log('Event:', event)

  // Check marshals
  const marshals = await prisma.user.findMany({
    where: {
      role: 'marshal',
      isActive: true,
      marshalTypes: {
        not: ''
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      marshalTypes: true,
      employeeId: true
    }
  })

  console.log('All marshals:', marshals.length)
  marshals.forEach(m => {
    console.log(`- ${m.name}: ${m.marshalTypes}`)
  })
}

checkEvent()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })