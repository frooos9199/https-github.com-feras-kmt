/**
 * Create Demo Admin Account for App Store Review
 * 
 * Run this script to create a demo account:
 * npx tsx scripts/create-demo-admin.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createDemoAdmin() {
  try {
    console.log('🔐 Creating demo admin account for App Store review...\n');

    // Demo admin credentials
    const demoAdmin = {
      employeeId: 'KMT-DEMO',
      name: 'App Store Reviewer',
      email: 'demo@kmtsys.com',
      password: 'AppStore2024!',
      phone: '+966500000000',
      civilId: '1234567890',
      dateOfBirth: new Date('1990-01-01'),
      nationality: 'Saudi Arabia',
      bloodType: 'O+',
      marshalTypes: 'drag-race,drift,circuit',
      role: 'admin',
      isActive: true,
    };

    // Hash password
    const hashedPassword = await bcrypt.hash(demoAdmin.password, 10);

    // Check if demo account already exists
    const existing = await prisma.user.findUnique({
      where: { email: demoAdmin.email },
    });

    if (existing) {
      console.log('⚠️  Demo account already exists. Updating...');
      
      await prisma.user.update({
        where: { email: demoAdmin.email },
        data: {
          ...demoAdmin,
          password: hashedPassword,
        },
      });

      console.log('✅ Demo account updated successfully!\n');
    } else {
      await prisma.user.create({
        data: {
          ...demoAdmin,
          password: hashedPassword,
        },
      });

      console.log('✅ Demo account created successfully!\n');
    }

    console.log('📋 DEMO CREDENTIALS FOR APP STORE CONNECT:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Username (Email): demo@kmtsys.com');
    console.log('Password:         AppStore2024!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📝 ADD THIS TO APP STORE CONNECT:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('App Review Information → Sign-In Information\n');
    console.log('☑️ Sign-in required\n');
    console.log('Username: demo@kmtsys.com');
    console.log('Password: AppStore2024!\n');
    console.log('Notes:');
    console.log('This is a marshal management system for KMT organization.');
    console.log('Login with the provided admin credentials to access:');
    console.log('- Events list and details');
    console.log('- Attendance tracking');
    console.log('- Push notifications');
    console.log('- User profile and management\n');
    console.log('The app requires an active internet connection.');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error creating demo admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoAdmin();
