import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAdminSession() {
  try {
    console.log('🔍 Checking admin users in database...\n')

    // Get all admin users
    const adminUsers = await prisma.user.findMany({
      where: { role: 'admin' },
      select: {
        id: true,
        employeeId: true,
        email: true,
        name: true,
        role: true,
        lastLogin: true
      }
    })

    console.log('👥 Admin users found:')
    adminUsers.forEach(user => {
      console.log(`  ${user.employeeId}: ${user.email} (${user.name}) - Last login: ${user.lastLogin || 'Never'}`)
    })

    console.log('\n📊 Total admin users:', adminUsers.length)

    // Check if there are any users with admin email but marshal role
    const potentialIssues = await prisma.user.findMany({
      where: {
        email: {
          contains: 'admin'
        }
      },
      select: {
        id: true,
        employeeId: true,
        email: true,
        role: true
      }
    })

    console.log('\n⚠️  Users with "admin" in email:')
    potentialIssues.forEach(user => {
      const status = user.role === 'admin' ? '✅' : '❌'
      console.log(`  ${status} ${user.employeeId}: ${user.email} - Role: ${user.role}`)
    })

  } catch (error) {
    console.error('❌ Error checking admin session:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdminSession()