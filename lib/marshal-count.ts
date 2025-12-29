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
            select: { employeeId: true, name: true }
          },
          status: true
        }
      }
    }
  })

  if (!event) {
    return { accepted: 0, available: 0, maxMarshals: 0 }
  }

  // جمع الأرقام الوظيفية الفريدة للمارشالات المقبولين
  const uniqueEmployeeIds = new Set<string>()
  
  console.log('=== EVENT MARSHALS DEBUG ===')
  console.log('Total eventMarshals found:', event.eventMarshals.length)
  
  event.eventMarshals.forEach((em, index) => {
    console.log(`Marshal ${index + 1}:`, {
      name: em.marshal?.name,
      employeeId: em.marshal?.employeeId,
      status: em.status
    })
    
    if (em.marshal?.employeeId) {
      uniqueEmployeeIds.add(em.marshal.employeeId)
    }
  })

  console.log('Unique Employee IDs:', Array.from(uniqueEmployeeIds))
  console.log('Unique count:', uniqueEmployeeIds.size)

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