"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

interface AttendanceRecord {
  user: {
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
}

export default function PrintAttendancePage() {
  const params = useParams()
  const eventId = params.eventId as string
  const [event, setEvent] = useState<Event | null>(null)
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch event details
      const eventRes = await fetch(`/api/admin/events/${eventId}`)
      if (!eventRes.ok) {
        console.error("Event not found")
        setLoading(false)
        return
      }
      const eventData = await eventRes.json()
      setEvent(eventData)

      // Fetch approved attendances for this specific event
      const attendanceRes = await fetch(`/api/admin/attendance?eventId=${eventId}&status=approved`)
      const attendanceData = await attendanceRes.json()
      setAttendances(attendanceData)
      
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
        @media print {
          @page {
            size: A4;
            margin: 2cm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
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
          <h2 className="text-xl font-semibold">قائمة حضور المارشالات</h2>
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
                  Marshal Number<br/>مارشال نمبر
                </th>
                <th className="border-2 border-black p-3 text-center font-bold">
                  Signature<br/>التوقيع
                </th>
              </tr>
            </thead>
            <tbody>
              {attendances.length === 0 ? (
                <tr>
                  <td colSpan={4} className="border-2 border-black p-6 text-center text-gray-500">
                    No approved attendances yet / لا توجد حضور مقبول بعد
                  </td>
                </tr>
              ) : (
                attendances.map((attendance, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border-2 border-black p-3 text-center font-semibold">
                      {index + 1}
                    </td>
                    <td className="border-2 border-black p-3 font-semibold text-center">
                      {attendance.user.name}
                    </td>
                    <td className="border-2 border-black p-3 font-mono font-bold text-center">
                      {attendance.user.employeeId}
                    </td>
                    <td className="border-2 border-black p-3">
                      {/* Empty cell for signature */}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t-2 border-gray-300">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="font-semibold mb-2">Total Marshals / إجمالي المارشالات:</p>
              <p className="text-2xl font-bold">{attendances.length}</p>
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
