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
