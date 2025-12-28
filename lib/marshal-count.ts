import { prisma } from '@/lib/prisma'

// Function موحدة لحساب المارشال المقبولين مع إزالة التكرار
export async function getEventMarshalCount(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      maxMarshals: true,
      attendances: {
        where: { status: 'approved' },
        select: {
          user: {
            select: { employeeId: true }
          }
        }
      },
      eventMarshals: {
        where: { 
          status: { in: ['accepted', 'approved'] }
        },
        select: {
          marshal: {
            select: { employeeId: true }
          }
        }
      }
    }
  })

  if (!event) {
    return { accepted: 0, available: 0, maxMarshals: 0 }
  }

  // جمع جميع employeeIds وإزالة التكرار
  const attendanceIds = event.attendances.map(a => a.user.employeeId)
  const eventMarshalIds = event.eventMarshals.map(m => m.marshal.employeeId)
  const allIds = [...attendanceIds, ...eventMarshalIds]
  const uniqueIds = [...new Set(allIds)]

  const accepted = uniqueIds.length
  const available = event.maxMarshals - accepted

  return {
    accepted,
    available,
    maxMarshals: event.maxMarshals
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
    marshal: { employeeId: a.user?.employeeId || a.employeeId }
  }))
  
  // جمع جميع المارشال وإزالة التكرار بناءً على employeeId (رقم الوظيفي)
  const allMarshals = [...acceptedEventMarshals, ...attendancesAsMarshals]
  const uniqueMarshals = allMarshals.filter((marshal, index, self) => 
    index === self.findIndex(m => m.marshal.employeeId === marshal.marshal.employeeId)
  )
  
  const accepted = uniqueMarshals.length
  const available = event.maxMarshals - accepted

  return {
    accepted,
    available,
    maxMarshals: event.maxMarshals
  }
}