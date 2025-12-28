import { prisma } from '@/lib/prisma'

// Function موحدة لحساب المارشال المقبولين
export async function getEventMarshalCount(eventId: string) {
  const result = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      maxMarshals: true,
      _count: {
        select: {
          // طلبات الحضور المعتمدة
          attendances: {
            where: { status: 'approved' }
          },
          // الدعوات المقبولة
          eventMarshals: {
            where: { 
              status: { in: ['accepted', 'approved'] }
            }
          }
        }
      }
    }
  })

  if (!result) {
    return { accepted: 0, available: 0, maxMarshals: 0 }
  }

  const accepted = result._count.attendances + result._count.eventMarshals
  const available = result.maxMarshals - accepted

  return {
    accepted,
    available,
    maxMarshals: result.maxMarshals
  }
}

// Function لحساب المارشال من البيانات الموجودة مع إزالة التكرار
export function calculateMarshalCount(event: any) {
  // جمع المارشال المقبولين من eventMarshals
  const acceptedEventMarshals = event.eventMarshals?.filter((m: any) => 
    m.status === 'accepted' || m.status === 'approved'
  ) || []
  
  // جمع المارشال المقبولين من attendances
  const approvedAttendances = event.attendances?.filter((a: any) => 
    a.status === 'approved'
  ) || []
  
  // تحويل attendances إلى نفس التنسيق
  const attendancesAsMarshals = approvedAttendances.map((a: any) => ({
    marshal: { id: a.user?.id || a.userId }
  }))
  
  // جمع جميع المارشال وإزالة التكرار بناءً على marshal.id
  const allMarshals = [...acceptedEventMarshals, ...attendancesAsMarshals]
  const uniqueMarshals = allMarshals.filter((marshal, index, self) => 
    index === self.findIndex(m => m.marshal.id === marshal.marshal.id)
  )
  
  const accepted = uniqueMarshals.length
  const available = event.maxMarshals - accepted

  console.log('🔢 Marshal Count Calculation:', {
    eventMarshals: acceptedEventMarshals.length,
    attendances: approvedAttendances.length,
    total: allMarshals.length,
    unique: accepted,
    available,
    maxMarshals: event.maxMarshals
  })

  return {
    accepted,
    available,
    maxMarshals: event.maxMarshals
  }
}