import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

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
    // Get the last user to determine the next employee number
    const lastUser = await prisma.user.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { employeeId: true }
    })

    let nextEmployeeNumber = 100
    if (lastUser && lastUser.employeeId) {
      const lastNumber = parseInt(lastUser.employeeId.split('-')[1])
      nextEmployeeNumber = lastNumber + 1
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
