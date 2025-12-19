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

    // Create Events worksheet for complete backup restoration
    const eventsWorksheet = workbook.addWorksheet('Events Backup');

    // Fetch all events
    const events = await prisma.event.findMany({
      orderBy: {
        date: 'desc'
      }
    });

    // Define events columns
    eventsWorksheet.columns = [
      { header: 'Event ID', key: 'id', width: 15 },
      { header: 'Title (EN)', key: 'titleEn', width: 30 },
      { header: 'Title (AR)', key: 'titleAr', width: 30 },
      { header: 'Description (EN)', key: 'descriptionEn', width: 50 },
      { header: 'Description (AR)', key: 'descriptionAr', width: 50 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'End Date', key: 'endDate', width: 15 },
      { header: 'Time', key: 'time', width: 10 },
      { header: 'End Time', key: 'endTime', width: 10 },
      { header: 'Location', key: 'location', width: 25 },
      { header: 'Image', key: 'image', width: 60 },
      { header: 'Marshal Types', key: 'marshalTypes', width: 30 },
      { header: 'Max Marshals', key: 'maxMarshals', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Created At', key: 'createdAt', width: 20 },
      { header: 'Updated At', key: 'updatedAt', width: 20 },
    ];

    // Style events header
    eventsWorksheet.getRow(1).font = { bold: true, size: 12 };
    eventsWorksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE60000' }, // Red background
    };
    eventsWorksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }; // White text

    // Add events data
    events.forEach((event: any) => {
      eventsWorksheet.addRow({
        id: event.id,
        titleEn: event.titleEn,
        titleAr: event.titleAr,
        descriptionEn: event.descriptionEn,
        descriptionAr: event.descriptionAr,
        date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
        endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
        time: event.time || '',
        endTime: event.endTime || '',
        location: event.location || '',
        image: event.image || '',
        marshalTypes: event.marshalTypes || '',
        maxMarshals: event.maxMarshals,
        status: event.status,
        createdAt: event.createdAt ? new Date(event.createdAt).toISOString() : '',
        updatedAt: event.updatedAt ? new Date(event.updatedAt).toISOString() : '',
      });
    });

    // Create Notifications worksheet for complete backup restoration
    const notificationsWorksheet = workbook.addWorksheet('Notifications Backup');

    // Fetch all notifications with user details
    const notifications = await prisma.notification.findMany({
      include: {
        user: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Define notifications columns
    notificationsWorksheet.columns = [
      { header: 'Notification ID', key: 'id', width: 15 },
      { header: 'User ID', key: 'userId', width: 15 },
      { header: 'Employee ID', key: 'employeeId', width: 15 },
      { header: 'User Name', key: 'userName', width: 25 },
      { header: 'User Email', key: 'userEmail', width: 30 },
      { header: 'Type', key: 'type', width: 20 },
      { header: 'Title (EN)', key: 'titleEn', width: 30 },
      { header: 'Title (AR)', key: 'titleAr', width: 30 },
      { header: 'Message (EN)', key: 'messageEn', width: 50 },
      { header: 'Message (AR)', key: 'messageAr', width: 50 },
      { header: 'Event ID', key: 'eventId', width: 15 },
      { header: 'Is Read', key: 'isRead', width: 10 },
      { header: 'Created At', key: 'createdAt', width: 20 },
    ];

    // Style notifications header
    notificationsWorksheet.getRow(1).font = { bold: true, size: 12 };
    notificationsWorksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE60000' }, // Red background
    };
    notificationsWorksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }; // White text

    // Add notifications data
    notifications.forEach((notification: any) => {
      notificationsWorksheet.addRow({
        id: notification.id,
        userId: notification.userId,
        employeeId: notification.user.employeeId || '',
        userName: notification.user.name,
        userEmail: notification.user.email,
        type: notification.type,
        titleEn: notification.titleEn,
        titleAr: notification.titleAr,
        messageEn: notification.messageEn,
        messageAr: notification.messageAr,
        eventId: notification.eventId || '',
        isRead: notification.isRead ? 'Yes' : 'No',
        createdAt: notification.createdAt ? new Date(notification.createdAt).toISOString() : '',
      });
    });

    // Create Broadcast Messages worksheet for complete backup restoration
    const broadcastWorksheet = workbook.addWorksheet('Broadcast Messages Backup');

    // Fetch all broadcast messages
    const broadcastMessages = await prisma.broadcastMessage.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Define broadcast messages columns
    broadcastWorksheet.columns = [
      { header: 'Message ID', key: 'id', width: 15 },
      { header: 'Subject', key: 'subject', width: 30 },
      { header: 'Message', key: 'message', width: 50 },
      { header: 'Recipient Filter', key: 'recipientFilter', width: 20 },
      { header: 'Marshal Types', key: 'marshalTypes', width: 30 },
      { header: 'Event ID', key: 'eventId', width: 15 },
      { header: 'Created At', key: 'createdAt', width: 20 },
      { header: 'Updated At', key: 'updatedAt', width: 20 },
    ];

    // Style broadcast messages header
    broadcastWorksheet.getRow(1).font = { bold: true, size: 12 };
    broadcastWorksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE60000' }, // Red background
    };
    broadcastWorksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }; // White text

    // Add broadcast messages data
    broadcastMessages.forEach((broadcast: any) => {
      broadcastWorksheet.addRow({
        id: broadcast.id,
        subject: broadcast.subject,
        message: broadcast.message,
        recipientFilter: broadcast.recipientFilter,
        marshalTypes: broadcast.marshalTypes || '',
        eventId: broadcast.eventId || '',
        createdAt: broadcast.createdAt ? new Date(broadcast.createdAt).toISOString() : '',
        updatedAt: broadcast.updatedAt ? new Date(broadcast.updatedAt).toISOString() : '',
      });
    });
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
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message + '\n' + error.stack;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else {
      try {
        errorMessage = JSON.stringify(error);
      } catch {}
    }
    console.error('Error generating Excel:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to generate Excel file', details: errorMessage },
      { status: 500 }
    );
  }
}
