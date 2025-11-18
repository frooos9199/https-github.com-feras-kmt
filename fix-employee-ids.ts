// Script to fix employee IDs for existing marshals
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixEmployeeIds() {
  try {
    console.log('🔧 Fixing employee IDs...')
    
    // Get all marshals ordered by creation date
    const marshals = await prisma.user.findMany({
      where: { role: 'marshal' },
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true, employeeId: true }
    })

    console.log(`Found ${marshals.length} marshals`)

    // Update each marshal with sequential number starting from 100
    for (let i = 0; i < marshals.length; i++) {
      const newEmployeeId = `KMT-${100 + i}`
      await prisma.user.update({
        where: { id: marshals[i].id },
        data: { employeeId: newEmployeeId }
      })
      console.log(`✅ Updated ${marshals[i].name}: ${marshals[i].employeeId} → ${newEmployeeId}`)
    }

    console.log('✨ All employee IDs fixed!')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixEmployeeIds()
