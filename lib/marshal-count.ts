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

// Function لحساب المارشال من البيانات الموجودة
export function calculateMarshalCount(event: any) {
  const attendancesCount = event._count?.attendances || 0
  const eventMarshalsCount = event._count?.eventMarshals || 0
  const accepted = attendancesCount + eventMarshalsCount
  const available = event.maxMarshals - accepted

  return {
    accepted,
    available,
    maxMarshals: event.maxMarshals
  }
}