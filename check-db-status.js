const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDB() {
  try {
    console.log('🔍 Checking database connection...\n');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected!\n');
    
    // Count users
    const userCount = await prisma.user.count();
    console.log(`👥 Total users: ${userCount}`);
    
    // Get admin user
    const admin = await prisma.user.findFirst({
      where: { role: 'admin' },
      select: { email: true, name: true, employeeId: true }
    });
    
    if (admin) {
      console.log('\n👤 Admin found:');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   Employee ID: ${admin.employeeId}`);
    } else {
      console.log('\n❌ No admin user found!');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDB();
