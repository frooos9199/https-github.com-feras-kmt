import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all users with all their data including passwords
    const users = await prisma.user.findMany({
      select: {
        id: true,
        employeeId: true,
        name: true,
        email: true,
        password: true, // Include password hash
        phone: true,
        role: true,
        civilId: true,
        dateOfBirth: true,
        nationality: true,
        bloodType: true,
        image: true,
        civilIdImage: true,
        civilIdBackImage: true,
        licenseFrontImage: true,
        licenseBackImage: true,
        isActive: true,
        marshalTypes: true,
        fcmToken: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        role: 'desc', // Admin first, then marshals
      },
    });

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users Backup');

    // Define columns
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Employee ID', key: 'employeeId', width: 15 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Password Hash', key: 'password', width: 60 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Role', key: 'role', width: 10 },
      { header: 'Civil ID', key: 'civilId', width: 15 },
      { header: 'Date of Birth', key: 'dateOfBirth', width: 15 },
      { header: 'Nationality', key: 'nationality', width: 20 },
      { header: 'Blood Type', key: 'bloodType', width: 12 },
      { header: 'Profile Image', key: 'image', width: 60 },
      { header: 'Civil ID Front', key: 'civilIdImage', width: 60 },
      { header: 'Civil ID Back', key: 'civilIdBackImage', width: 60 },
      { header: 'License Front', key: 'licenseFrontImage', width: 60 },
      { header: 'License Back', key: 'licenseBackImage', width: 60 },
      { header: 'Is Active', key: 'isActive', width: 12 },
      { header: 'Marshal Types', key: 'marshalTypes', width: 30 },
      { header: 'FCM Token', key: 'fcmToken', width: 60 },
      { header: 'Registration Date', key: 'registrationDate', width: 15 },
      { header: 'Created At', key: 'createdAt', width: 20 },
      { header: 'Updated At', key: 'updatedAt', width: 20 },
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE60000' }, // Red background
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }; // White text

    // Add data rows
    users.forEach((user: any) => {
      worksheet.addRow({
        id: user.id,
        employeeId: user.employeeId || '',
        name: user.name || '',
        email: user.email,
        password: user.password, // Include password hash for restoration
        phone: user.phone || '',
        role: user.role,
        civilId: user.civilId || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        nationality: user.nationality || '',
        bloodType: user.bloodType || '',
        image: user.image || '',
        civilIdImage: user.civilIdImage || '',
        civilIdBackImage: user.civilIdBackImage || '',
        licenseFrontImage: user.licenseFrontImage || '',
        licenseBackImage: user.licenseBackImage || '',
        isActive: user.isActive ? 'Yes' : 'No',
        marshalTypes: user.marshalTypes || '',
        fcmToken: user.fcmToken || '',
        registrationDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB') : '', // DD/MM/YYYY format
        createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : '',
        updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : '',
      });
    });

    // Add color coding for roles
    worksheet.eachRow((row: any, rowNumber: number) => {
      if (rowNumber > 1) { // Skip header
        const role = row.getCell('role').value;
        if (role === 'admin') {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFF4CC' }, // Light yellow for admins
          };
        }
      }
    });

    // Create Attendances worksheet for complete backup restoration
    const attendancesWorksheet = workbook.addWorksheet('Attendances Backup');

    // Fetch all attendances with user and event details
    const attendances = await prisma.attendance.findMany({
      include: {
        user: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            email: true,
          }
        },
        event: {
          select: {
            id: true,
            titleEn: true,
            titleAr: true,
            date: true,
            time: true,
            location: true,
            status: true,
          }
        }
      },
      orderBy: {
        registeredAt: 'desc'
      }
    });

    // Define attendances columns
    attendancesWorksheet.columns = [
      { header: 'Attendance ID', key: 'id', width: 15 },
      { header: 'User ID', key: 'userId', width: 15 },
      { header: 'Employee ID', key: 'employeeId', width: 15 },
      { header: 'User Name', key: 'userName', width: 25 },
      { header: 'User Email', key: 'userEmail', width: 30 },
      { header: 'Event ID', key: 'eventId', width: 15 },
      { header: 'Event Title (EN)', key: 'eventTitleEn', width: 30 },
      { header: 'Event Title (AR)', key: 'eventTitleAr', width: 30 },
      { header: 'Event Date', key: 'eventDate', width: 15 },
      { header: 'Event Time', key: 'eventTime', width: 15 },
      { header: 'Event Location', key: 'eventLocation', width: 25 },
      { header: 'Event Status', key: 'eventStatus', width: 15 },
      { header: 'Attendance Status', key: 'status', width: 15 },
      { header: 'Registered At', key: 'registeredAt', width: 20 },
      { header: 'Notes', key: 'notes', width: 30 },
      { header: 'Cancelled At', key: 'cancelledAt', width: 20 },
      { header: 'Cancellation Reason', key: 'cancellationReason', width: 30 },
    ];

    // Style attendances header
    attendancesWorksheet.getRow(1).font = { bold: true, size: 12 };
    attendancesWorksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE60000' }, // Red background
    };
    attendancesWorksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }; // White text

    // Add attendances data
    attendances.forEach((attendance: any) => {
      attendancesWorksheet.addRow({
        id: attendance.id,
        userId: attendance.userId,
        employeeId: attendance.user.employeeId || '',
        userName: attendance.user.name,
        userEmail: attendance.user.email,
        eventId: attendance.eventId,
        eventTitleEn: attendance.event.titleEn,
        eventTitleAr: attendance.event.titleAr,
        eventDate: attendance.event.date ? new Date(attendance.event.date).toISOString().split('T')[0] : '',
        eventTime: attendance.event.time || '',
        eventLocation: attendance.event.location || '',
        eventStatus: attendance.event.status || '',
        status: attendance.status,
        registeredAt: attendance.registeredAt ? new Date(attendance.registeredAt).toISOString() : '',
        notes: attendance.notes || '',
        cancelledAt: attendance.cancelledAt ? new Date(attendance.cancelledAt).toISOString() : '',
        cancellationReason: attendance.cancellationReason || '',
      });
    });

    // Generate the Excel file buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `KMT_Users_Backup_${timestamp}.xlsx`;

    // Return the file
    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': (buffer as any).length.toString(),
      },
    });

  } catch (error) {
    console.error('Error generating Excel:', error);
    return NextResponse.json(
      { error: 'Failed to generate Excel file' },
      { status: 500 }
    );
  }
}
