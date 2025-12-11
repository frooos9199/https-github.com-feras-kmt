const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function testLogin() {
  try {
    const email = 'admin@kmtsys.com';
    const password = 'admin123';
    
    console.log('\n🔍 Testing login for:', email);
    
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.log('❌ User not found!');
      console.log('\n📝 Creating admin user now...');
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
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
      console.log('📧 Email:', email);
      console.log('🔑 Password:', password);
      return;
    }
    
    console.log('✅ User found:', user.email);
    
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔐 Password test:', isMatch ? '✅ CORRECT' : '❌ WRONG');
    
    if (!isMatch) {
      console.log('\n🔧 Fixing password...');
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      });
      console.log('✅ Password fixed!');
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: admin@kmtsys.com');
    console.log('🔑 Password: admin123');
    console.log('🌐 Login: https://kmtsys.com');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
