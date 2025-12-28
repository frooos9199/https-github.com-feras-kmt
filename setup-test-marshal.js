#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupTestMarshal() {
  try {
    console.log('🔍 Checking for test marshal...\n');
    
    let testMarshal = await prisma.user.findUnique({
      where: { email: 'marshal@test.com' }
    });

    if (!testMarshal) {
      console.log('❌ Test marshal not found. Creating...\n');
      
      const hashedPassword = await bcrypt.hash('marshal123', 12);
      
      testMarshal = await prisma.user.create({
        data: {
          name: 'Test Marshal',
          email: 'marshal@test.com',
          password: hashedPassword,
          phone: '+965-1111-2222',
          employeeId: 'KMT-TEST-MARSHAL',
          role: 'marshal',
          isActive: true,
          marshalTypes: 'drag-race,drift'
        }
      });
      
      console.log('✅ Created test marshal:');
      console.log(`   Email: ${testMarshal.email}`);
      console.log(`   Password: marshal123`);
      console.log(`   Employee ID: ${testMarshal.employeeId}\n`);
      
    } else {
      console.log('✅ Test marshal found:');
      console.log(`   Name: ${testMarshal.name}`);
      console.log(`   Email: ${testMarshal.email}`);
      console.log(`   Employee ID: ${testMarshal.employeeId}`);
      console.log(`   Active: ${testMarshal.isActive ? '✅' : '❌'}`);
      console.log(`   Types: ${testMarshal.marshalTypes}\n`);
      
      // Update password to ensure it's correct
      const hashedPassword = await bcrypt.hash('marshal123', 12);
      await prisma.user.update({
        where: { email: 'marshal@test.com' },
        data: { password: hashedPassword }
      });
      console.log('🔧 Password updated to "marshal123"\n');
    }

    // Check total marshals count
    const totalMarshals = await prisma.user.count({
      where: { role: 'marshal', isActive: true }
    });
    
    console.log(`📊 Total active marshals: ${totalMarshals}`);

  } catch (error) {
    console.error('❌ Error setting up test marshal:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupTestMarshal();