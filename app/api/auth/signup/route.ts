import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { sendEmail, welcomeEmailTemplate } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, phone, civilId, dateOfBirth } = body

    console.log(`[SIGNUP] Starting signup process for email: ${email}`)

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

    console.log(`[SIGNUP] Processing signup for ${name} (${email})`)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // Hash password first (outside transaction since it's not DB-related)
    let hashedPassword
    try {
      hashedPassword = await bcrypt.hash(password, 10)
    } catch (err) {
      console.error("[SIGNUP] Password hash error", err)
      return NextResponse.json({ error: "Password hash error" }, { status: 500 })
    }


    // Create user with employeeId generation in a single transaction (atomic, always unique and incremented, with retry)
    let user
    const maxRetries = 10
    let retryCount = 0
    while (retryCount < maxRetries) {
      try {
        user = await prisma.$transaction(async (tx) => {
          // Find the highest employeeId in the form KMT-<number>
          const lastUser = await tx.user.findFirst({
            where: {
              employeeId: {
                startsWith: "KMT-"
              }
            },
            orderBy: {
              employeeId: 'desc'
            },
          })
          let nextNumber = 100
          if (lastUser && lastUser.employeeId) {
            const match = lastUser.employeeId.match(/^KMT-(\d+)/)
            if (match) {
              nextNumber = parseInt(match[1], 10) + 1
            }
          }
          const employeeId = `KMT-${nextNumber}`
          return await tx.user.create({
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
        })
        break // Success, exit loop
      } catch (err: any) {
        if (err.code === 'P2002' && err.meta?.target?.includes('employeeId')) {
          // Race condition, retry
          retryCount++
          await new Promise(res => setTimeout(res, 200))
          continue
        }
        if (err.code === 'P2002' && err.meta?.target?.includes('email')) {
          return NextResponse.json({ error: "Email already registered" }, { status: 400 })
        }
        return NextResponse.json({ error: "Database error occurred. Please try again." }, { status: 500 })
      }
    }

    if (!user) {
      return NextResponse.json({
        error: "Failed to create user account after multiple attempts. Please contact support."
      }, { status: 500 })
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
