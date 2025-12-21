import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixAdminRole() {
  try {
    // Find the admin user by email
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@kmt.kw' }
    })

    if (!adminUser) {
      console.log('❌ Admin user not found')
      return
    }

    console.log('Current admin user role:', adminUser.role)

    if (adminUser.role !== 'admin') {
      // Update the role to admin
      const updatedUser = await prisma.user.update({
        where: { email: 'admin@kmt.kw' },
        data: { role: 'admin' }
      })

      console.log('✅ Admin user role fixed:', updatedUser.role)
    } else {
      console.log('✅ Admin user role is already correct')
    }

    // Also check for any other users that might have been incorrectly set as marshal
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, role: true, employeeId: true }
    })

    console.log('\n📋 All users and their roles:')
    allUsers.forEach(user => {
      console.log(`${user.employeeId}: ${user.email} - ${user.role}`)
    })

  } catch (error) {
    console.error('Error fixing admin role:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixAdminRole()