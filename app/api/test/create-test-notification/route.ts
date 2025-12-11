import { NextRequest, NextResponse } from "next/server"
import { createNotification } from "@/lib/notifications"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create test notification
    await createNotification({
      userId,
      titleEn: "Test Notification",
      titleAr: "إشعار تجريبي",
      messageEn: `Hello ${user.name}, this is a test notification from the system.`,
      messageAr: `مرحباً ${user.name}، هذا إشعار تجريبي من النظام.`,
      type: "NEW_EVENT"
    })

    return NextResponse.json({
      success: true,
      message: `Test notification created for ${user.name} (${user.email})`,
      hasFcmToken: !!user.fcmToken
    })
  } catch (error) {
    console.error("Error creating test notification:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}
