import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { sendEmail, welcomeEmailTemplate } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, phone, civilId, dateOfBirth } = body


    if (!name || !email || !password || !phone) {
      console.error("[SIGNUP] Missing required fields", { name, email, password, phone })
      return NextResponse.json({ error: "Missing required fields: name, email, password, phone are required" }, { status: 400 })
    }
    // Make civilId and dateOfBirth optional
    let parsedDate: Date | undefined = undefined;
    if (dateOfBirth) {
      const tryDate = new Date(dateOfBirth);
      if (!isNaN(tryDate.getTime())) {
        parsedDate = tryDate;
      } else {
        console.warn("[SIGNUP] Invalid dateOfBirth, ignoring", dateOfBirth);
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // Generate employee ID
    const allMarshals = await prisma.user.findMany({ where: { role: 'marshal' }, select: { employeeId: true } })
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
    let hashedPassword
    try {
      hashedPassword = await bcrypt.hash(password, 10)
    } catch (err) {
      console.error("[SIGNUP] Password hash error", err)
      return NextResponse.json({ error: "Password hash error" }, { status: 500 })
    }

    // Create user
    let user
    try {
      user = await prisma.user.create({
        data: {
          employeeId,
          name,
          email,
          password: hashedPassword,
          phone,
          ...(civilId ? { civilId } : {}),
          ...(parsedDate ? { dateOfBirth: parsedDate } : {}),
          role: "marshal"
        }
      })
    } catch (err) {
      console.error("[SIGNUP] User create error", err)
  return NextResponse.json({ error: "Database error: " + ((err as any)?.message || String(err)) }, { status: 500 })
    }

    // Create notification for admin
    try {
      const admins = await prisma.user.findMany({ where: { role: 'admin' }, select: { id: true } })
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
    } catch (err) {
      console.error("[SIGNUP] Notification create error", err)
      // لا توقف العملية إذا فشل الإشعار
    }

    // Send welcome email
    if (user.email) {
      try {
        await sendEmail({
          to: user.email,
          subject: '🎉 Welcome to KMT - Kuwait Motorsport Town',
          html: welcomeEmailTemplate(user.name)
        })
      } catch (err) {
        console.error("[SIGNUP] Email send error", err)
        // لا توقف العملية إذا فشل الإيميل
      }
    }

    return NextResponse.json(
      { message: "User created successfully", userId: user.id, employeeId: user.employeeId },
      { status: 201 }
    )
  } catch (error) {
    console.error("[SIGNUP] General error:", error)
    return NextResponse.json(
      { error: "Internal server error: " + ((error as any)?.message || String(error)) },
      { status: 500 }
    )
  }
}
