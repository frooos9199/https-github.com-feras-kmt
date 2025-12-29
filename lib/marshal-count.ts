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

// Function لحساب المارشال من البيانات الموجودة - فقط من eventMarshals
export function calculateMarshalCount(event: any) {
  // حساب المارشال المقبولين فقط من eventMarshals
  const acceptedEventMarshals = event.eventMarshals?.filter((m: any) => 
    m.status === 'accepted' || m.status === 'approved'
  ) || []
  
  // Debug logging
  console.log(`=== CALCULATE MARSHAL COUNT DEBUG ===`)
  console.log(`Event ID: ${event.id}`)
  console.log(`Total eventMarshals: ${event.eventMarshals?.length || 0}`)
  console.log(`Accepted eventMarshals: ${acceptedEventMarshals.length}`)
  
  // جمع الأرقام الوظيفية الفريدة فقط
  const uniqueEmployeeIds = new Set<string>()
  
  acceptedEventMarshals.forEach((m: any, index: number) => {
    const employeeId = m.marshal?.employeeId
    console.log(`Marshal ${index + 1}: employeeId=${employeeId}, status=${m.status}`)
    if (employeeId) {
      uniqueEmployeeIds.add(employeeId)
    }
  })
  
  console.log(`Unique Employee IDs: [${Array.from(uniqueEmployeeIds).join(', ')}]`)
  console.log(`Final count: ${uniqueEmployeeIds.size}`)
  
  const accepted = uniqueEmployeeIds.size
  const available = event.maxMarshals - accepted

  return {
    accepted,
    available,
    maxMarshals: event.maxMarshals
  }
}