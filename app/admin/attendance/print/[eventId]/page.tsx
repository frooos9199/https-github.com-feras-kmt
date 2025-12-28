"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { calculateMarshalCount } from "@/lib/marshal-count"

interface AttendanceRecord {
  id: string
  status: string
  marshal: {
    employeeId: string
    name: string
  }
}

interface Event {
  id: string
  titleEn: string
  titleAr: string
  date: string
  time: string
  endTime: string | null
  endDate: string | null
  location: string
  eventMarshals: AttendanceRecord[]
  attendances: Array<{
    id: string
    status: string
    user: {
      employeeId: string
      name: string
    }
  }>
  _count: {
    attendances: number
    eventMarshals: number
  }
  marshalCounts?: {
    accepted: number
    available: number
    maxMarshals: number
  }
}

export default function PrintAttendancePage() {
  const params = useParams()
  const eventId = params.eventId as string
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch event details with eventMarshals
      const eventRes = await fetch(`/api/admin/events/${eventId}`)
      if (!eventRes.ok) {
        console.error("Event not found")
        setLoading(false)
        return
      }
      const eventData = await eventRes.json()
      
      // حساب المارشال الموحد
      const marshalCounts = eventData.marshalCounts || calculateMarshalCount(eventData)
      const eventWithCounts = {
        ...eventData,
        marshalCounts
      }
      
      // Debug: log marshal counts
      console.log('🖨️ Print Sheet Data:', {
        totalAccepted: marshalCounts.accepted,
        eventMarshalsAccepted: eventData.eventMarshals?.filter((m: any) => m.status === 'accepted' || m.status === 'approved').length || 0,
        attendancesApproved: eventData.attendances?.filter((a: any) => a.status === 'approved').length || 0
      })
      
      setEvent(eventWithCounts)

      setLoading(false)
      
      // Auto print after data loads
      setTimeout(() => {
        window.print()
      }, 500)
    } catch (error) {
      console.error("Error fetching data:", error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Event Not Found</h1>
          <p className="text-gray-600 mb-4">الحدث غير موجود</p>
          <button
            onClick={() => window.close()}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg"
          >
            Close / إغلاق
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <style jsx global>{`
        * {
          overflow: visible !important;
        }
        @media print {
          @page {
            size: A4;
            margin: 1cm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            overflow: visible !important;
          }
          .no-print {
            display: none !important;
          }
          table {
            page-break-inside: auto;
            width: 100%;
            overflow: visible !important;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
            overflow: visible !important;
          }
          tbody, thead {
            overflow: visible !important;
          }
          thead {
            display: table-header-group;
          }
          tbody {
            display: table-row-group;
          }
          .print-container {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
          }
        }
        @media screen {
          .print-container {
            max-width: 21cm;
            margin: 2cm auto;
            background: white;
            padding: 2cm;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
        }
      `}</style>

      <div className="print-container bg-white text-black">
        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-black pb-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img src="/kmt-logo-main.png" alt="KMT" className="h-16 w-auto" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Kuwait Motor Town</h1>
          <h2 className="text-xl font-semibold">قائمة حضور المارشال</h2>
          <p className="text-lg">Marshals Attendance List</p>
        </div>

        {/* Event Details */}
        {event && (
          <div className="mb-8 bg-gray-100 p-6 rounded-lg border-2 border-gray-300">
            <h3 className="text-2xl font-bold mb-4 text-center">
              {event.titleEn} / {event.titleAr}
            </h3>
            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <p className="font-semibold mb-2">📅 Date / التاريخ</p>
                <p className="text-lg">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-base text-gray-600 mt-1" dir="rtl">
                  {new Date(event.date).toLocaleDateString('ar-EG', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                {event.endDate && (
                  <>
                    <p className="text-sm text-gray-500 mt-2">To / إلى</p>
                    <p className="text-base">
                      {new Date(event.endDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-600" dir="rtl">
                      {new Date(event.endDate).toLocaleDateString('ar-EG', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </>
                )}
              </div>
              <div>
                <p className="font-semibold mb-2">🕐 Time / الوقت</p>
                <p className="text-lg">
                  {event.time}
                  {event.endTime && ` - ${event.endTime}`}
                </p>
              </div>
              <div className="col-span-2">
                <p className="font-semibold mb-2">📍 Location / الموقع</p>
                <p className="text-lg">{event.location}</p>
              </div>
            </div>
          </div>
        )}

        {/* Attendances Table */}
        <div className="mb-8">
          <div className="mb-4 text-center bg-yellow-100 p-3 border-2 border-yellow-500 rounded">
            <p className="text-lg font-bold">
              {(() => {
                // حساب العدد الفريد للمارشال
                const acceptedEventMarshals = event.eventMarshals?.filter(m => m.status === 'accepted' || m.status === 'approved') || [];
                const approvedAttendances = event.attendances?.filter(a => a.status === 'approved') || [];
                const attendancesAsMarshals = approvedAttendances.map(a => ({
                  marshal: {
                    employeeId: a.user.employeeId,
                    name: a.user.name,
                    id: a.user.id
                  }
                }));
                
                const allMarshals = [...acceptedEventMarshals, ...attendancesAsMarshals];
                const uniqueCount = allMarshals.filter((marshal, index, self) => 
                  index === self.findIndex(m => m.marshal.employeeId === marshal.marshal.employeeId)
                ).length;
                
                return `Total Registered: ${uniqueCount} Marshals / إجمالي المسجلين: ${uniqueCount} مارشال`;
              })()}
            </p>
          </div>
          <table className="w-full border-collapse border-2 border-black">
            <thead>
              <tr className="bg-gray-200">
                <th className="border-2 border-black p-3 text-center font-bold">
                  #<br/>الرقم
                </th>
                <th className="border-2 border-black p-3 text-center font-bold">
                  Marshal Name<br/>اسم المارشال
                </th>
                <th className="border-2 border-black p-3 text-center font-bold">
                  Marshal Number<br/>رقم المارشال
                </th>
                <th className="border-2 border-black p-3 text-center font-bold">
                  Signature<br/>التوقيع
                </th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                // جمع جميع المارشال المقبولين فقط
                const acceptedEventMarshals = event.eventMarshals?.filter(m => m.status === 'accepted' || m.status === 'approved') || [];
                const approvedAttendances = event.attendances?.filter(a => a.status === 'approved') || [];
                
                // تحويل attendances إلى نفس التنسيق
                const attendancesAsMarshals = approvedAttendances.map(a => ({
                  id: a.id,
                  status: a.status,
                  marshal: {
                    employeeId: a.user.employeeId,
                    name: a.user.name,
                    id: a.user.id
                  }
                }));
                
                // إزالة التكرار بناءً على employeeId (رقم الوظيفي)
                const allMarshals = [...acceptedEventMarshals, ...attendancesAsMarshals];
                const uniqueMarshals = allMarshals.filter((marshal, index, self) => 
                  index === self.findIndex(m => m.marshal.employeeId === marshal.marshal.employeeId)
                );
                
                console.log('🖨️ Print: Total before dedup:', allMarshals.length, 'After dedup:', uniqueMarshals.length);
                
                return uniqueMarshals.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="border-2 border-black p-6 text-center text-gray-500">
                      No marshals registered yet / لا يوجد مارشالز مسجلين بعد
                    </td>
                  </tr>
                ) : (
                  uniqueMarshals.map((marshal, index) => (
                    <tr key={`unique-${marshal.marshal.employeeId}`} className="hover:bg-gray-50">
                      <td className="border-2 border-black p-3 text-center font-semibold">
                        {index + 1}
                      </td>
                      <td className="border-2 border-black p-3 font-semibold text-center">
                        {marshal.marshal.name}
                      </td>
                      <td className="border-2 border-black p-3 font-mono font-bold text-center">
                        {marshal.marshal.employeeId}
                      </td>
                      <td className="border-2 border-black p-3">
                        {/* Empty cell for signature */}
                      </td>
                    </tr>
                  ))
                );
              })()}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t-2 border-gray-300">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="font-semibold mb-2">Total Marshals / إجمالي المارشالات:</p>
              <p className="text-2xl font-bold">
                {(() => {
                  // حساب العدد الفريد للمارشال
                  const acceptedEventMarshals = event.eventMarshals?.filter(m => m.status === 'accepted' || m.status === 'approved') || [];
                  const approvedAttendances = event.attendances?.filter(a => a.status === 'approved') || [];
                  const attendancesAsMarshals = approvedAttendances.map(a => ({
                    marshal: {
                      employeeId: a.user.employeeId,
                      name: a.user.name,
                      id: a.user.id
                    }
                  }));
                  const allMarshals = [...acceptedEventMarshals, ...attendancesAsMarshals];
                  return allMarshals.filter((marshal, index, self) => 
                    index === self.findIndex(m => m.marshal.employeeId === marshal.marshal.employeeId)
                  ).length;
                })()}
              </p>
            </div>
            <div>
              <p className="font-semibold mb-2">Print Date / تاريخ الطباعة:</p>
              <p className="text-lg">
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Print Button (visible on screen only) */}
        <div className="no-print mt-8 text-center">
          <button
            onClick={() => window.print()}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg text-lg"
          >
            🖨️ Print / طباعة
          </button>
          <button
            onClick={() => window.close()}
            className="ml-4 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg text-lg"
          >
            ✕ Close / إغلاق
          </button>
        </div>
      </div>
    </>
  )
}
