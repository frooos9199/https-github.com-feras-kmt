import { prisma } from '@/lib/prisma'

// Function موحدة لحساب المارشال المقبولين فقط بناءً على الرقم الوظيفي
export async function getEventMarshalCount(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      maxMarshals: true,
      eventMarshals: {
        where: { 
          status: { in: ['accepted', 'approved'] } // فقط المقبولين
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

  // جمع الأرقام الوظيفية الفريدة للمارشالات المقبولين
  const uniqueEmployeeIds = new Set<string>()
  
  event.eventMarshals.forEach(em => {
    if (em.marshal?.employeeId) {
      uniqueEmployeeIds.add(em.marshal.employeeId)
    }
  })

  const accepted = uniqueEmployeeIds.size
  const available = event.maxMarshals - accepted

  return {
    accepted,
    available,
    maxMarshals: event.maxMarshals
  }
}

// Function لحساب المارشال من البيانات الموجودة بناءً على الرقم الوظيفي
export function calculateMarshalCount(event: any) {
  // جمع المارشال المقبولين من eventMarshals فقط
  const acceptedEventMarshals = event.eventMarshals?.filter((m: any) => 
    m.status === 'accepted' || m.status === 'approved'
  ) || []
  
  // جمع الأرقام الوظيفية الفريدة
  const uniqueEmployeeIds = new Set<string>()
  
  acceptedEventMarshals.forEach((m: any) => {
    const employeeId = m.marshal?.employeeId
    if (employeeId) {
      uniqueEmployeeIds.add(employeeId)
    }
  })
  
  const accepted = uniqueEmployeeIds.size
  const available = event.maxMarshals - accepted

  return {
    accepted,
    available,
    maxMarshals: event.maxMarshals
  }
}