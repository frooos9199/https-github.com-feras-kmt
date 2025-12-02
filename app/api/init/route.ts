import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    await prisma.user.upsert({
      where: { email: 'admin@kmt.kw' },
      update: {},
      create: {
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
      message: "Admin ready: admin@kmt.kw / admin123"
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 })
  }
}
