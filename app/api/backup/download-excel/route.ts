import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import * as ExcelJS from 'exceljs';

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

    // Generate the Excel file buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `KMT_Users_Backup_${timestamp}.xlsx`;

    // Return the file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
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
