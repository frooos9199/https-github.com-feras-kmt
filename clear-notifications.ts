import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearNotifications() {
  try {
    const result = await prisma.notification.deleteMany()
    console.log(`✅ Cleared ${result.count} notifications`)
  } catch (error) {
    console.error('❌ Error clearing notifications:', error)
  } finally {
    await prisma.$disconnect()
  }
}

clearNotifications()