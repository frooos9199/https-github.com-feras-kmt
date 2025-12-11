const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function createAdmin() {
  try {
    const email = 'admin@kmt.kw';
    const password = 'admin123';
    
    console.log('\n📝 Creating admin user...');
    
    // Check if exists
    const existing = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existing) {
      console.log('✅ User already exists!');
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: {
          email: email,
          password: hashedPassword,
          name: 'Admin',
          role: 'admin',
          employeeId: 'KMT-001',
          phone: '+96599999999',
          civilId: '000000000000',
          dateOfBirth: new Date('1990-01-01'),
          isActive: true,
          marshalTypes: 'drag-race,drift,circuit'
        }
      });
      console.log('✅ Admin user created!');
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: admin@kmt.kw');
    console.log('🔑 Password: admin123');
    console.log('🌐 Login: https://kmtsys.com');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
