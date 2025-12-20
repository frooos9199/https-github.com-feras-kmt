import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Return different message if email is not registered
      return NextResponse.json({
        error: "هذا البريد الإلكتروني غير مسجل لدى كي ام تي. يرجى التسجيل أولاً.",
        code: "EMAIL_NOT_REGISTERED"
      }, { status: 404 })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Save reset token to user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    // Send reset email
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 20px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/kmt-logo-main.png" alt="KMT" style="height: 60px; margin-bottom: 20px; border-radius: 5px;">
          <h1 style="color: #ef4444; margin: 0; font-size: 24px;">Password Reset</h1>
        </div>

        <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0 0 15px 0; font-size: 16px;">Hello ${user.name},</p>
          <p style="margin: 0 0 15px 0; line-height: 1.6;">
            You requested a password reset for your KMT Marshal account. Click the button below to reset your password:
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>

          <p style="margin: 20px 0 0 0; font-size: 14px; color: #ccc;">
            This link will expire in 1 hour for security reasons.
          </p>
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #ccc;">
            If you didn't request this password reset, please ignore this email.
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #333;">
          <p style="margin: 0; font-size: 12px; color: #666;">
            © 2025 KMT - Kuwait Motorsport Town | Developed by NexDev
          </p>
        </div>
      </div>
    `

    await sendEmail({
      to: user.email,
      subject: "🔑 Password Reset - KMT Marshal System",
      html: emailHtml
    })

    return NextResponse.json({
      message: "If an account with this email exists, a password reset link has been sent."
    })

  } catch (error) {
    console.error("[FORGOT_PASSWORD] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}