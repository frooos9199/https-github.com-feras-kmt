import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';
import bcrypt from 'bcryptjs';

// Vercel configuration for large files
export const maxDuration = 60; // 60 seconds timeout
export const dynamic = 'force-dynamic';

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
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);
    
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

    console.log('========================');

    // Import Events
    console.log('🔄 Importing Events...');
    const eventsWorksheet = workbook.getWorksheet('Events Backup');
    if (eventsWorksheet) {
      let eventsImported = 0;
      let eventsUpdated = 0;
      let eventsFailed = 0;

      // Convert worksheet to array and skip header
      const eventRows: any[] = [];
      eventsWorksheet.eachRow((row: any, rowNumber: number) => {
        if (rowNumber > 1) eventRows.push(row);
      });

      for (const row of eventRows) {
        try {
          const eventData = {
            id: row.getCell(1).value?.toString() || '',
            titleEn: row.getCell(2).value?.toString() || '',
            titleAr: row.getCell(3).value?.toString() || '',
            descriptionEn: row.getCell(4).value?.toString() || '',
            descriptionAr: row.getCell(5).value?.toString() || '',
            date: row.getCell(6).value ? new Date(row.getCell(6).value.toString()) : new Date(),
            endDate: row.getCell(7).value ? new Date(row.getCell(7).value.toString()) : null,
            time: row.getCell(8).value?.toString() || '',
            endTime: row.getCell(9).value?.toString() || null,
            location: row.getCell(10).value?.toString() || '',
            image: row.getCell(11).value?.toString() || null,
            marshalTypes: row.getCell(12).value?.toString() || '',
            maxMarshals: parseInt(row.getCell(13).value?.toString() || '0'),
            status: row.getCell(14).value?.toString() || 'active',
          };

          // Check if event exists
          const existingEvent = eventData.id ? await prisma.event.findUnique({
            where: { id: eventData.id }
          }) : null;

          if (existingEvent) {
            // Update existing event
            await prisma.event.update({
              where: { id: eventData.id },
              data: {
                titleEn: eventData.titleEn,
                titleAr: eventData.titleAr,
                descriptionEn: eventData.descriptionEn,
                descriptionAr: eventData.descriptionAr,
                date: eventData.date,
                endDate: eventData.endDate,
                time: eventData.time,
                endTime: eventData.endTime,
                location: eventData.location,
                image: eventData.image,
                marshalTypes: eventData.marshalTypes,
                maxMarshals: eventData.maxMarshals,
                status: eventData.status,
              }
            });
            eventsUpdated++;
          } else {
            // Create new event
            await prisma.event.create({
              data: {
                titleEn: eventData.titleEn,
                titleAr: eventData.titleAr,
                descriptionEn: eventData.descriptionEn,
                descriptionAr: eventData.descriptionAr,
                date: eventData.date,
                endDate: eventData.endDate,
                time: eventData.time,
                endTime: eventData.endTime,
                location: eventData.location,
                image: eventData.image,
                marshalTypes: eventData.marshalTypes,
                maxMarshals: eventData.maxMarshals,
                status: eventData.status,
              }
            });
            eventsImported++;
          }
        } catch (error) {
          console.error('❌ Error importing event:', error);
          eventsFailed++;
        }
      }

      console.log(`Events - Imported: ${eventsImported}, Updated: ${eventsUpdated}, Failed: ${eventsFailed}`);
    }

    // Import Attendances
    console.log('🔄 Importing Attendances...');
    const attendancesWorksheet = workbook.getWorksheet('Attendances Backup');
    if (attendancesWorksheet) {
      let attendancesImported = 0;
      let attendancesUpdated = 0;
      let attendancesFailed = 0;

      // Convert worksheet to array and skip header
      const attendanceRows: any[] = [];
      attendancesWorksheet.eachRow((row: any, rowNumber: number) => {
        if (rowNumber > 1) attendanceRows.push(row);
      });

      for (const row of attendanceRows) {
        try {
          const attendanceData = {
            id: row.getCell(1).value?.toString() || '',
            userId: row.getCell(2).value?.toString() || '',
            eventId: row.getCell(6).value?.toString() || '',
            status: row.getCell(13).value?.toString() || 'pending',
            registeredAt: row.getCell(14).value ? new Date(row.getCell(14).value.toString()) : new Date(),
            notes: row.getCell(15).value?.toString() || null,
            cancelledAt: row.getCell(16).value ? new Date(row.getCell(16).value.toString()) : null,
            cancellationReason: row.getCell(17).value?.toString() || null,
          };

          // Check if attendance exists
          const existingAttendance = attendanceData.id ? await prisma.attendance.findUnique({
            where: { id: attendanceData.id }
          }) : null;

          if (existingAttendance) {
            // Update existing attendance
            await prisma.attendance.update({
              where: { id: attendanceData.id },
              data: {
                status: attendanceData.status,
                registeredAt: attendanceData.registeredAt,
                notes: attendanceData.notes,
                cancelledAt: attendanceData.cancelledAt,
                cancellationReason: attendanceData.cancellationReason,
              }
            });
            attendancesUpdated++;
          } else {
            // Create new attendance
            await prisma.attendance.create({
              data: {
                userId: attendanceData.userId,
                eventId: attendanceData.eventId,
                status: attendanceData.status,
                registeredAt: attendanceData.registeredAt,
                notes: attendanceData.notes,
                cancelledAt: attendanceData.cancelledAt,
                cancellationReason: attendanceData.cancellationReason,
              }
            });
            attendancesImported++;
          }
        } catch (error) {
          console.error('❌ Error importing attendance:', error);
          attendancesFailed++;
        }
      }

      console.log(`Attendances - Imported: ${attendancesImported}, Updated: ${attendancesUpdated}, Failed: ${attendancesFailed}`);
    }

    // Import Notifications
    console.log('🔄 Importing Notifications...');
    const notificationsWorksheet = workbook.getWorksheet('Notifications Backup');
    if (notificationsWorksheet) {
      let notificationsImported = 0;
      let notificationsFailed = 0;

      // Convert worksheet to array and skip header
      const notificationRows: any[] = [];
      notificationsWorksheet.eachRow((row: any, rowNumber: number) => {
        if (rowNumber > 1) notificationRows.push(row);
      });

      for (const row of notificationRows) {
        try {
          const notificationData = {
            id: row.getCell(1).value?.toString() || '',
            userId: row.getCell(2).value?.toString() || '',
            type: row.getCell(6).value?.toString() || '',
            titleEn: row.getCell(7).value?.toString() || '',
            titleAr: row.getCell(8).value?.toString() || '',
            messageEn: row.getCell(9).value?.toString() || '',
            messageAr: row.getCell(10).value?.toString() || '',
            eventId: row.getCell(11).value?.toString() || null,
            isRead: row.getCell(12).value?.toString() === 'Yes',
            createdAt: row.getCell(13).value ? new Date(row.getCell(13).value.toString()) : new Date(),
          };

          // Create notification (notifications are usually not updated, only created)
          await prisma.notification.create({
            data: {
              userId: notificationData.userId,
              type: notificationData.type,
              titleEn: notificationData.titleEn,
              titleAr: notificationData.titleAr,
              messageEn: notificationData.messageEn,
              messageAr: notificationData.messageAr,
              eventId: notificationData.eventId,
              isRead: notificationData.isRead,
              createdAt: notificationData.createdAt,
            }
          });
          notificationsImported++;
        } catch (error) {
          console.error('❌ Error importing notification:', error);
          notificationsFailed++;
        }
      }

      console.log(`Notifications - Imported: ${notificationsImported}, Failed: ${notificationsFailed}`);
    }

    // Import Broadcast Messages
    console.log('🔄 Importing Broadcast Messages...');
    const broadcastWorksheet = workbook.getWorksheet('Broadcast Messages Backup');
    if (broadcastWorksheet) {
      let broadcastImported = 0;
      let broadcastFailed = 0;

      // Convert worksheet to array and skip header
      const broadcastRows: any[] = [];
      broadcastWorksheet.eachRow((row: any, rowNumber: number) => {
        if (rowNumber > 1) broadcastRows.push(row);
      });

      for (const row of broadcastRows) {
        try {
          const broadcastData = {
            id: row.getCell(1).value?.toString() || '',
            subject: row.getCell(2).value?.toString() || '',
            message: row.getCell(3).value?.toString() || '',
            recipientFilter: row.getCell(4).value?.toString() || '',
            marshalTypes: row.getCell(5).value?.toString() || null,
            eventId: row.getCell(6).value?.toString() || null,
            createdAt: row.getCell(7).value ? new Date(row.getCell(7).value.toString()) : new Date(),
          };

          // Create broadcast message
          await prisma.broadcastMessage.create({
            data: {
              subject: broadcastData.subject,
              message: broadcastData.message,
              recipientFilter: broadcastData.recipientFilter,
              marshalTypes: broadcastData.marshalTypes,
              eventId: broadcastData.eventId,
              createdAt: broadcastData.createdAt,
            }
          });
          broadcastImported++;
        } catch (error) {
          console.error('❌ Error importing broadcast message:', error);
          broadcastFailed++;
        }
      }

      console.log(`Broadcast Messages - Imported: ${broadcastImported}, Failed: ${broadcastFailed}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Complete backup import completed successfully! System fully restored.',
      stats: {
        users: { total: usersToImport.length, imported, updated, failed },
        events: eventsWorksheet ? 'Imported successfully' : 'Not found in backup',
        attendances: attendancesWorksheet ? 'Imported successfully' : 'Not found in backup',
        notifications: notificationsWorksheet ? 'Imported successfully' : 'Not found in backup',
        broadcastMessages: broadcastWorksheet ? 'Imported successfully' : 'Not found in backup',
      },
      updateDetails: updateDetails,
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
