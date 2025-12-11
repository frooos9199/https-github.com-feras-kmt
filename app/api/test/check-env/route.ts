import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    jwtSecretLength: process.env.JWT_SECRET?.length || 0,
    nextAuthSecretLength: process.env.NEXTAUTH_SECRET?.length || 0,
    jwtSecretPreview: process.env.JWT_SECRET?.substring(0, 10) || "NOT_SET",
    nextAuthSecretPreview: process.env.NEXTAUTH_SECRET?.substring(0, 10) || "NOT_SET",
    env: process.env.NODE_ENV
  })
}
