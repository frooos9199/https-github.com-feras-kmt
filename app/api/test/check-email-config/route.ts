import { NextResponse } from "next/server"

export async function GET() {
  try {
    const resendApiKey = process.env.RESEND_API_KEY
    const testing = process.env.EMAIL_TESTING_MODE === 'true'
    const testingEmail = process.env.EMAIL_TESTING_RECIPIENT

    return NextResponse.json({
      resendConfigured: !!resendApiKey,
      resendKeyLength: resendApiKey ? resendApiKey.length : 0,
      testingMode: testing,
      testingEmail: testing ? testingEmail : null,
      timestamp: new Date().toISOString(),
      message: resendApiKey 
        ? "✓ RESEND_API_KEY is configured"
        : "✗ RESEND_API_KEY is missing - emails will not be sent"
    })
  } catch (error) {
    return NextResponse.json({
      error: "Failed to check email configuration",
      details: String(error)
    }, { status: 500 })
  }
}
