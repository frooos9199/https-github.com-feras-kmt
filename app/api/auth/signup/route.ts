import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { sendEmail, welcomeEmailTemplate } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, phone, civilId, dateOfBirth } = body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      )
    }

    // Generate employee ID
    // Get all marshals and find the highest employee number
    const allMarshals = await prisma.user.findMany({
      where: { role: 'marshal' },
      select: { employeeId: true }
    })

    let nextEmployeeNumber = 100
    if (allMarshals.length > 0) {
      const employeeNumbers = allMarshals
        .map(u => {
          if (u.employeeId && u.employeeId.startsWith('KMT-')) {
            return parseInt(u.employeeId.split('-')[1])
          }
          return 0
        })
        .filter(num => !isNaN(num) && num >= 100)
      
      if (employeeNumbers.length > 0) {
        const maxNumber = Math.max(...employeeNumbers)
        nextEmployeeNumber = maxNumber + 1
      }
    }

    const employeeId = `KMT-${nextEmployeeNumber}`

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        employeeId,
        name,
        email,
        password: hashedPassword,
        phone,
        civilId,
        dateOfBirth: new Date(dateOfBirth),
        role: "marshal"
      }
    })

    // Create notification for admin
    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
      select: { id: true }
    })

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(admin => ({
          userId: admin.id,
          type: 'new_marshal',
          titleEn: 'New Marshal Registration',
          titleAr: 'تسجيل مارشال جديد',
          messageEn: `${user.name} (${user.employeeId}) has registered as a new marshal`,
          messageAr: `${user.name} (${user.employeeId}) قام بالتسجيل كمارشال جديد`,
          isRead: false
        }))
      })
    }

    // Send welcome email
    if (user.email) {
      await sendEmail({
        to: user.email,
        subject: '🎉 Welcome to KMT - Kuwait Motorsport Town',
        html: welcomeEmailTemplate(user.name)
      })
    }

    return NextResponse.json(
      { message: "User created successfully", userId: user.id, employeeId: user.employeeId },
      { status: 201 }
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
