#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkAdminUsers() {
  try {
    console.log('🔍 Checking admin users in database...\n');
    
    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
      select: {
        id: true,
        name: true,
        email: true,
        employeeId: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    if (admins.length === 0) {
      console.log('❌ No admin users found in database!');
      console.log('Creating default admin user...\n');
      
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const newAdmin = await prisma.user.create({
        data: {
          name: 'System Administrator',
          email: 'admin@kmt.com',
          password: hashedPassword,
          phone: '+965-1234-5678',
          employeeId: 'KMT-ADMIN',
          role: 'admin',
          isActive: true,
          marshalTypes: 'drag-race,drift,circuit'
        }
      });
      
      console.log('✅ Created admin user:');
      console.log(`   Email: ${newAdmin.email}`);
      console.log(`   Password: admin123`);
      console.log(`   Employee ID: ${newAdmin.employeeId}\n`);
      
    } else {
      console.log(`✅ Found ${admins.length} admin user(s):\n`);
      
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Employee ID: ${admin.employeeId}`);
        console.log(`   Active: ${admin.isActive ? '✅' : '❌'}`);
        console.log(`   Created: ${admin.createdAt.toLocaleDateString()}\n`);
      });
    }

    // Test password verification for first admin
    if (admins.length > 0) {
      const firstAdmin = await prisma.user.findUnique({
        where: { email: admins[0].email },
        select: { password: true }
      });
      
      const isValidPassword = await bcrypt.compare('admin123', firstAdmin.password);
      console.log(`🔐 Password 'admin123' valid for ${admins[0].email}: ${isValidPassword ? '✅' : '❌'}`);
      
      if (!isValidPassword) {
        console.log('🔧 Updating password to "admin123"...');
        const newHashedPassword = await bcrypt.hash('admin123', 12);
        await prisma.user.update({
          where: { email: admins[0].email },
          data: { password: newHashedPassword }
        });
        console.log('✅ Password updated successfully');
      }
    }

  } catch (error) {
    console.error('❌ Error checking admin users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUsers();