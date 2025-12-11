const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function fixEmail() {
  try {
    const oldEmail = 'admin@kmtsys.com';
    const newEmail = 'admin@kmt.kw';
    
    console.log('\n🔧 Updating email...');
    
    const user = await prisma.user.update({
      where: { email: oldEmail },
      data: { email: newEmail }
    });
    
    console.log('✅ Email updated successfully!');
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

fixEmail();
