import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    // تحقق من الجلسة (المستخدم مسجل الدخول)
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // جلب الفعاليات المرتبطة بالمستخدم (عن طريق الحضور)
    const attendances = await prisma.attendance.findMany({
      where: { userId: session.user.id },
      include: { event: true }
    });

    // تجهيز قائمة الفعاليات
    const events = attendances.map((a) => ({
      id: a.event.id,
      title: a.event.titleAr || a.event.titleEn,
      date: a.event.date,
      location: a.event.location,
      status: a.status
    }));

    return NextResponse.json({ success: true, events });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
