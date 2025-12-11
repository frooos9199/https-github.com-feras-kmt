import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST() {
  try {
    // Drop all data (for reset)
    await prisma.notification.deleteMany({})
    await prisma.attendance.deleteMany({})
    await prisma.event.deleteMany({})
    await prisma.user.deleteMany({})

    // Create admin
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    await prisma.user.create({
      data: {
        email: 'admin@kmt.kw',
        name: 'Admin',
        password: hashedPassword,
        phone: '+965 9999 9999',
        civilId: '000000000000',
        dateOfBirth: new Date('1990-01-01'),
        role: 'admin',
        employeeId: 'ADMIN-001',
        marshalTypes: '',
      },
    })

    return NextResponse.json({ 
      success: true,
      message: "Database reset complete. Login: admin@kmt.kw / admin123"
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "Use POST to reset database" 
  })
}
