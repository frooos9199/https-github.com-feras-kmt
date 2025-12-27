const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = 'admin@kmt.kw';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('\n📝 Creating admin user...');

    const admin = await prisma.user.upsert({
      where: { email },
      update: {
        role: 'admin',
        password: hashedPassword,
      },
      create: {
        employeeId: 'KMT-ADMIN',
        name: 'Admin User',
        email,
        password: hashedPassword,
        phone: '+96550000000',
        civilId: '123456789012',
        role: 'admin',
        isActive: true,
      },
    });

    console.log('✅ Admin user created/updated!');
    console.log('📧 Email: admin@kmt.kw');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: admin');
    console.log('🆔 ID:', admin.id);

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();