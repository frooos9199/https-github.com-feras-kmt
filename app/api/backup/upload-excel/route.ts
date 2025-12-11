import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import * as ExcelJS from 'exceljs';
import bcrypt from 'bcryptjs';

// Increase size limit for Vercel
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
  maxDuration: 60,
};

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the uploaded file
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Read the Excel file
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    
    const worksheet = workbook.getWorksheet('Users Backup');
    if (!worksheet) {
      return NextResponse.json({ 
        error: 'Invalid Excel file. Must contain "Users Backup" sheet' 
      }, { status: 400 });
    }

    const usersToImport: any[] = [];
    const errors: string[] = [];
    let rowIndex = 0;

    // Parse Excel rows (skip header row)
    worksheet.eachRow((row: any, rowNumber: number) => {
      if (rowNumber === 1) return; // Skip header
      rowIndex++;

      try {
        const userData = {
          id: row.getCell(1).value?.toString() || '',
          employeeId: row.getCell(2).value?.toString() || '',
          name: row.getCell(3).value?.toString() || '',
          email: row.getCell(4).value?.toString() || '',
          password: row.getCell(5).value?.toString() || '',
          phone: row.getCell(6).value?.toString() || '',
          role: row.getCell(7).value?.toString() || 'marshal',
          civilId: row.getCell(8).value?.toString() || '',
          dateOfBirth: row.getCell(9).value ? new Date(row.getCell(9).value.toString()) : new Date(),
          nationality: row.getCell(10).value?.toString() || null,
          bloodType: row.getCell(11).value?.toString() || null,
          image: row.getCell(12).value?.toString() || null,
          civilIdImage: row.getCell(13).value?.toString() || null,
          civilIdBackImage: row.getCell(14).value?.toString() || null,
          licenseFrontImage: row.getCell(15).value?.toString() || null,
          licenseBackImage: row.getCell(16).value?.toString() || null,
          isActive: row.getCell(17).value?.toString() === 'Yes',
          marshalTypes: row.getCell(18).value?.toString() || '',
          fcmToken: row.getCell(19).value?.toString() || null,
        };

        // Validate required fields
        if (!userData.email || !userData.name) {
          errors.push(`Row ${rowNumber}: Missing required fields (email or name)`);
          return;
        }

        usersToImport.push(userData);
      } catch (error) {
        errors.push(`Row ${rowNumber}: Error parsing row - ${error}`);
      }
    });

    if (usersToImport.length === 0) {
      return NextResponse.json({ 
        error: 'No valid users found in Excel file',
        errors 
      }, { status: 400 });
    }

    // Import users to database
    let imported = 0;
    let updated = 0;
    let failed = 0;
    const updateDetails: any[] = []; // Track what changed

    for (const userData of usersToImport) {
      try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email }
        });

        console.log(`Processing user: ${userData.email}, exists: ${!!existingUser}`);

        if (existingUser) {
          // Compare and log changes
          const changes: any = {};
          
          if (existingUser.employeeId !== userData.employeeId) {
            changes.employeeId = { old: existingUser.employeeId, new: userData.employeeId };
          }
          if (existingUser.name !== userData.name) {
            changes.name = { old: existingUser.name, new: userData.name };
          }
          if (existingUser.phone !== userData.phone) {
            changes.phone = { old: existingUser.phone, new: userData.phone };
          }
          if (existingUser.role !== userData.role) {
            changes.role = { old: existingUser.role, new: userData.role };
          }
          if (existingUser.civilId !== userData.civilId) {
            changes.civilId = { old: existingUser.civilId, new: userData.civilId };
          }
          if (existingUser.nationality !== userData.nationality) {
            changes.nationality = { old: existingUser.nationality, new: userData.nationality };
          }
          if (existingUser.bloodType !== userData.bloodType) {
            changes.bloodType = { old: existingUser.bloodType, new: userData.bloodType };
          }
          if (existingUser.image !== userData.image) {
            changes.image = { old: existingUser.image, new: userData.image };
          }
          if (existingUser.civilIdImage !== userData.civilIdImage) {
            changes.civilIdImage = { old: existingUser.civilIdImage, new: userData.civilIdImage };
          }
          if (existingUser.civilIdBackImage !== userData.civilIdBackImage) {
            changes.civilIdBackImage = { old: existingUser.civilIdBackImage, new: userData.civilIdBackImage };
          }
          if (existingUser.licenseFrontImage !== userData.licenseFrontImage) {
            changes.licenseFrontImage = { old: existingUser.licenseFrontImage, new: userData.licenseFrontImage };
          }
          if (existingUser.licenseBackImage !== userData.licenseBackImage) {
            changes.licenseBackImage = { old: existingUser.licenseBackImage, new: userData.licenseBackImage };
          }
          if (existingUser.isActive !== userData.isActive) {
            changes.isActive = { old: existingUser.isActive, new: userData.isActive };
          }
          if (existingUser.marshalTypes !== userData.marshalTypes) {
            changes.marshalTypes = { old: existingUser.marshalTypes, new: userData.marshalTypes };
          }
          if (existingUser.password !== userData.password) {
            changes.password = { old: '***encrypted***', new: '***encrypted***' };
          }
          if (existingUser.fcmToken !== userData.fcmToken) {
            changes.fcmToken = { old: existingUser.fcmToken, new: userData.fcmToken };
          }
          // Compare dates
          const existingDate = existingUser.dateOfBirth ? new Date(existingUser.dateOfBirth).toISOString().split('T')[0] : null;
          const newDate = userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : null;
          if (existingDate !== newDate) {
            changes.dateOfBirth = { old: existingDate, new: newDate };
          }

          console.log(`📝 Changes for ${userData.email}:`, changes);
          
          // Update existing user
          await prisma.user.update({
            where: { email: userData.email },
            data: {
              employeeId: userData.employeeId, // Update employee ID
              name: userData.name,
              password: userData.password, // Keep original password hash
              phone: userData.phone,
              role: userData.role,
              civilId: userData.civilId,
              dateOfBirth: userData.dateOfBirth,
              nationality: userData.nationality,
              bloodType: userData.bloodType,
              image: userData.image,
              civilIdImage: userData.civilIdImage,
              civilIdBackImage: userData.civilIdBackImage,
              licenseFrontImage: userData.licenseFrontImage,
              licenseBackImage: userData.licenseBackImage,
              isActive: userData.isActive,
              marshalTypes: userData.marshalTypes,
              fcmToken: userData.fcmToken,
            }
          });
          updated++;
          console.log(`✅ Updated user: ${userData.email}`);
          
          // Add update details
          if (Object.keys(changes).length > 0) {
            updateDetails.push({
              email: userData.email,
              name: userData.name,
              employeeId: existingUser.employeeId,
              changes: changes
            });
          }
        } else {
          // Create new user
          // Generate employeeId if not provided
          let employeeId = userData.employeeId;
          if (!employeeId) {
            const lastUser = await prisma.user.findFirst({
              orderBy: { employeeId: 'desc' }
            });
            const lastNumber = lastUser?.employeeId 
              ? parseInt(lastUser.employeeId.replace('KMT-', '')) 
              : 99;
            employeeId = `KMT-${lastNumber + 1}`;
          }

          console.log(`Creating new user ${userData.email} with employeeId: ${employeeId}`);

          await prisma.user.create({
            data: {
              employeeId,
              name: userData.name,
              email: userData.email,
              password: userData.password, // Use the password hash from Excel
              phone: userData.phone,
              role: userData.role,
              civilId: userData.civilId,
              dateOfBirth: userData.dateOfBirth,
              nationality: userData.nationality,
              bloodType: userData.bloodType,
              image: userData.image,
              civilIdImage: userData.civilIdImage,
              civilIdBackImage: userData.civilIdBackImage,
              licenseFrontImage: userData.licenseFrontImage,
              licenseBackImage: userData.licenseBackImage,
              isActive: userData.isActive,
              marshalTypes: userData.marshalTypes,
              fcmToken: userData.fcmToken,
            }
          });
          imported++;
          console.log(`✅ Created new user: ${userData.email}`);
        }
      } catch (error) {
        console.error('❌ Error importing user:', userData.email, error);
        failed++;
        errors.push(`Failed to import ${userData.email}: ${error}`);
      }
    }

    console.log('===== IMPORT SUMMARY =====');
    console.log('Total:', usersToImport.length);
    console.log('Imported:', imported);
    console.log('Updated:', updated);
    console.log('Failed:', failed);
    console.log('Update Details:', JSON.stringify(updateDetails, null, 2));
    console.log('========================');

    return NextResponse.json({
      success: true,
      message: 'Import completed',
      stats: {
        total: usersToImport.length,
        imported,
        updated,
        failed,
      },
      updateDetails: updateDetails, // Send details to frontend
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error uploading Excel:', error);
    return NextResponse.json(
      { error: 'Failed to upload Excel file' },
      { status: 500 }
    );
  }
}
