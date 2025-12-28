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

    // جلب الفعاليات المرتبطة بالمستخدم (عن طريق الحضور والدعوات)
    const [attendances, eventMarshals] = await Promise.all([
      // طلبات الحضور التي قدمها المارشال
      prisma.attendance.findMany({
        where: { 
          userId: session.user.id,
          status: { not: 'cancelled' }
        },
        include: { event: true }
      }),
      // الدعوات التي تلقاها المارشال من الأدمن
      prisma.eventMarshal.findMany({
        where: { 
          marshalId: session.user.id,
          status: { in: ['invited', 'accepted', 'approved'] }
        },
        include: { event: true }
      })
    ]);

    // تجهيز قائمة الفعاليات من الحضور
    const attendanceEvents = attendances.map((a) => ({
      id: a.event.id,
      title: a.event.titleAr || a.event.titleEn,
      date: a.event.date,
      location: a.event.location,
      status: a.status,
      type: 'attendance'
    }));

    // تجهيز قائمة الفعاليات من الدعوات
    const invitationEvents = eventMarshals.map((em) => ({
      id: em.event.id,
      title: em.event.titleAr || em.event.titleEn,
      date: em.event.date,
      location: em.event.location,
      status: em.status,
      type: 'invitation'
    }));

    // دمج القوائم وإزالة المكررات
    const allEvents = [...attendanceEvents, ...invitationEvents];
    const uniqueEvents = allEvents.filter((event, index, self) => 
      index === self.findIndex(e => e.id === event.id)
    );

    return NextResponse.json({ success: true, events: uniqueEvents });
  } catch (error) {
    console.error('Error fetching user events:', error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
