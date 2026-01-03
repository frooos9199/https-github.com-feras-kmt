import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"

// DELETE - Remove marshal from event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string; marshalId: string } }
) {
  try {
    let userId: string | null = null
    let userRole: string | null = null

    // Try NextAuth session
    const session = await getServerSession(authOptions)
    if (session?.user?.id) {
      userId = session.user.id
      userRole = session.user.role
    } else {
      // Try JWT token
      const user = await getUserFromToken(request)
      if (user) {
        userId = user.id
        userRole = user.role
      }
    }
    
    if (!userId || userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { eventId, marshalId } = params

    console.log(`[REMOVE MARSHAL] Attempting to remove marshal ${marshalId} from event ${eventId}`)

    // Check if marshal is assigned to this event
    const eventMarshal = await prisma.eventMarshal.findUnique({
      where: {
        eventId_marshalId: {
          eventId,
          marshalId
        }
      }
    })

    if (!eventMarshal) {
      console.log(`[REMOVE MARSHAL] Marshal ${marshalId} not found in event ${eventId}`)
      return NextResponse.json({ 
        error: "Marshal not found in this event or has been already removed",
        errorAr: "المارشال غير موجود في هذا الحدث أو قد تم حذفه مسبقاً"
      }, { status: 404 })
    }

    // Remove the marshal from the event
    await prisma.eventMarshal.delete({
      where: {
        eventId_marshalId: {
          eventId,
          marshalId
        }
      }
    })

    // Also update any related attendance records to rejected
    await prisma.attendance.updateMany({
      where: {
        eventId,
        userId: marshalId,
        status: "approved"
      },
      data: {
        status: "rejected",
        notes: "Removed by admin"
      }
    })

    console.log(`[REMOVE MARSHAL] Successfully removed marshal ${marshalId} from event ${eventId}`)

    return NextResponse.json({ 
      success: true,
      message: "Marshal removed successfully",
      messageAr: "تم إزالة المارشال بنجاح"
    })
  } catch (error) {
    console.error("[REMOVE MARSHAL] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}