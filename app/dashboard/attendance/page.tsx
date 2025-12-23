"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { motion } from "framer-motion"
import Link from "next/link"

// دالة لحساب العداد التنازلي
const getCountdown = (startDate: string, startTime: string, endDate?: string, endTime?: string, status?: string, language: string = "en") => {
  const now = new Date()
  const start = new Date(`${startDate}T${startTime}`)
  const end = endDate && endTime ? new Date(`${endDate}T${endTime}`) : new Date(`${startDate}T23:59`)
  
  let target, label, color
  
  if (now < start) {
    // قبل الحدث
    target = start
    label = language === "ar" ? "يبدأ بعد: " : "Starts in: "
    color = "#43A047"
  } else if (now >= start && now <= end) {
    // أثناء الحدث
    target = end
    label = language === "ar" ? "ينتهي بعد: " : "Ends in: "
    color = "#FFA726"
  } else {
    // بعد الحدث
    return { text: language === "ar" ? "انتهى الحدث" : "Event finished", color: "#e53935" }
  }
  
  const diff = Math.max(0, target - now)
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const mins = Math.floor((diff / (1000 * 60)) % 60)
  const secs = Math.floor((diff / 1000) % 60)
  
  const timeStr = 
    (days > 0 ? days + (language === "ar" ? " يوم " : "d ") : "") +
    (hours > 0 ? hours + (language === "ar" ? " ساعة " : "h ") : "") +
    (mins > 0 ? mins + (language === "ar" ? " دقيقة " : "m ") : "") +
    secs + (language === "ar" ? " ثانية" : "s")
  
  return { text: label + timeStr, color }
}

interface AttendanceRecord {
  id: string
  status: string
  registeredAt: string
  notes: string | null
  event: {
    id: string
    titleEn: string
    titleAr: string
    descriptionEn: string
    descriptionAr: string
    date: string
    time: string
    endTime?: string
    endDate?: string
    location: string
    type: string
  }
}

// مكون العداد التنازلي
function CountdownTimer({ event, status }: { event: AttendanceRecord['event'], status: string }) {
  const { language } = useLanguage()
  const [countdown, setCountdown] = useState({ text: '', color: '#43A047' })
  
  useEffect(() => {
    if (!event.date) return
    
    const updateCountdown = () => {
      const cd = getCountdown(event.date, event.time, event.endDate, event.endTime, status, language)
      setCountdown(cd)
    }
    
    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [event.date, event.time, event.endDate, event.endTime, status, language])
  
  return (
    <div className="text-center mb-4">
      <div 
        className="text-lg font-bold px-4 py-2 rounded-lg inline-block"
        style={{ color: countdown.color }}
      >
        {countdown.text}
      </div>
    </div>
  )
}

export default function MyAttendancePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { language } = useLanguage()
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceRecord | null>(null)
  const [cancellationReason, setCancellationReason] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchAttendances()
    }
  }, [session])

  const fetchAttendances = async () => {
    try {
      const res = await fetch("/api/attendance/my-attendance")
      const data = await res.json()
      setAttendances(data)
    } catch (error) {
      console.error("Error fetching attendances:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAttendances = filter === "all" 
    ? attendances 
    : attendances.filter(a => a.status === filter)

  const stats = {
    total: attendances.length,
    approved: attendances.filter(a => a.status === "approved").length,
    pending: attendances.filter(a => a.status === "pending").length,
    rejected: attendances.filter(a => a.status === "rejected").length
  }

  const handleCancelClick = (attendance: AttendanceRecord) => {
    setSelectedAttendance(attendance)
    setCancellationReason("")
    setShowCancelModal(true)
  }

  const handleCancelConfirm = async () => {
    if (!selectedAttendance || !cancellationReason.trim()) {
      alert(language === "ar" ? "الرجاء إدخال سبب الإلغاء" : "Please enter a cancellation reason")
      return
    }

    setCancellingId(selectedAttendance.id)

    try {
      const res = await fetch("/api/attendance/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendanceId: selectedAttendance.id,
          reason: cancellationReason
        })
      })

      if (res.ok) {
        alert(language === "ar" ? "تم إلغاء التسجيل بنجاح" : "Registration cancelled successfully")
        setShowCancelModal(false)
        setSelectedAttendance(null)
        setCancellationReason("")
        fetchAttendances() // Refresh the list
      } else {
        const data = await res.json()
        alert(data.error || (language === "ar" ? "فشل إلغاء التسجيل" : "Failed to cancel registration"))
      }
    } catch (error) {
      console.error("Cancel error:", error)
      alert(language === "ar" ? "حدث خطأ" : "An error occurred")
    } finally {
      setCancellingId(null)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-lg border-b border-red-600/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center gap-3">
              <img src="/kmt-logo-main.png" alt="KMT" className="h-12 w-auto rounded px-2 py-1" />
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← {language === "ar" ? "العودة" : "Back"}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            📋 {language === "ar" ? "سجل حضوري" : "My Attendance"}
          </h1>
          <p className="text-gray-400">
            {language === "ar" ? "جميع الفعاليات التي سجلت فيها" : "All events you registered for"}
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
          >
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">{language === "ar" ? "الكل" : "Total"}</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-green-600/10 border border-green-600/30 rounded-xl p-6"
          >
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">{language === "ar" ? "مقبول" : "Approved"}</p>
              <p className="text-3xl font-bold text-green-500">{stats.approved}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-yellow-600/10 border border-yellow-600/30 rounded-xl p-6"
          >
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">{language === "ar" ? "معلق" : "Pending"}</p>
              <p className="text-3xl font-bold text-yellow-500">{stats.pending}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-red-600/10 border border-red-600/30 rounded-xl p-6"
          >
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">{language === "ar" ? "مرفوض" : "Rejected"}</p>
              <p className="text-3xl font-bold text-red-500">{stats.rejected}</p>
            </div>
          </motion.div>
        </div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6 flex gap-2 overflow-x-auto pb-2"
        >
          {["all", "approved", "pending", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filter === status
                  ? "bg-red-600 text-white"
                  : "bg-zinc-800 text-gray-400 hover:bg-zinc-700"
              }`}
            >
              {language === "ar" ? (
                status === "all" ? "الكل" :
                status === "pending" ? "معلق" :
                status === "approved" ? "مقبول" : "مرفوض"
              ) : (
                status.charAt(0).toUpperCase() + status.slice(1)
              )}
            </button>
          ))}
        </motion.div>

        {/* Attendances List */}
        {filteredAttendances.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-12 text-center"
          >
            <p className="text-gray-400 text-lg">
              {language === "ar" ? "لا توجد سجلات" : "No records found"}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAttendances.map((attendance, index) => {
              const isPast = new Date(attendance.event.date) < new Date()
              
              return (
                <motion.div
                  key={attendance.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors"
                >
                  {/* Event Image: صورة test.jpg مع طبقة داكنة */}
                  <div
                    className="h-32 flex items-center justify-center bg-black relative"
                    style={{
                      backgroundImage: 'url(/test.jpg)',
                      backgroundSize: 'contain',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    {/* أزيلت طبقة اللون الداكن لتظهر الصورة بشكل طبيعي */}
                    <span className="text-5xl relative z-10">
                      {attendance.event.type === "race" && "🏁"}
                      {attendance.event.type === "drift" && "🚗"}
                      {attendance.event.type === "track-day" && "🏎️"}
                    </span>
                    {isPast && (
                      <div className="absolute top-2 right-2 px-3 py-1 bg-gray-600/80 rounded-full text-xs text-white z-20">
                        {language === "ar" ? "منتهي" : "Past"}
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {language === "ar" ? attendance.event.titleAr : attendance.event.titleEn}
                    </h3>
                    
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {language === "ar" ? attendance.event.descriptionAr : attendance.event.descriptionEn}
                    </p>

                    {/* العداد التنازلي */}
                    <CountdownTimer event={attendance.event} status={attendance.status} />

                    {/* وقت وتاريخ البداية والنهاية */}
                    <div className="mb-4">
                      {/* تاريخ ووقت البداية */}
                      <div className="flex items-center mb-3 bg-green-600/10 border border-green-600/30 rounded-lg p-4">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-green-500">📅</span>
                          <div>
                            <div className="text-green-500 font-bold text-sm mb-1">
                              {language === "ar" ? "البداية" : "Start"}
                            </div>
                            <div className="text-white font-semibold text-base">
                              {new Date(attendance.event.date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-green-500 text-lg font-bold">{attendance.event.time}</span>
                        </div>
                      </div>
                      
                      {/* تاريخ ووقت النهاية */}
                      {(attendance.event.endDate || attendance.event.endTime) && (
                        <div className="flex items-center bg-red-600/10 border border-red-600/30 rounded-lg p-4">
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-red-500">🏁</span>
                            <div>
                              <div className="text-red-500 font-bold text-sm mb-1">
                                {language === "ar" ? "النهاية" : "End"}
                              </div>
                              <div className="text-white font-semibold text-base">
                                {attendance.event.endDate ? new Date(attendance.event.endDate).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
                                  weekday: 'short',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                }) : new Date(attendance.event.date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
                                  weekday: 'short',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-red-500 text-lg font-bold">
                              {attendance.event.endTime || (attendance.event.time ? attendance.event.time : '23:59')}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* الموقع وتاريخ التسجيل */}
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <span>📍</span>
                        <span>{attendance.event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <span>📝</span>
                        <span>{language === "ar" ? "سُجل في: " : "Registered: "} {new Date(attendance.registeredAt).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className={`px-4 py-2 rounded-lg text-center font-medium ${
                      attendance.status === "approved" 
                        ? "bg-green-600/20 text-green-500 border border-green-600/30"
                        : attendance.status === "pending"
                        ? "bg-yellow-600/20 text-yellow-500 border border-yellow-600/30"
                        : attendance.status === "cancelled"
                        ? "bg-gray-600/20 text-gray-500 border border-gray-600/30"
                        : "bg-red-600/20 text-red-500 border border-red-600/30"
                    }`}>
                      {attendance.status === "approved" && (language === "ar" ? "✅ مقبول" : "✅ Approved")}
                      {attendance.status === "pending" && (language === "ar" ? "⏳ معلق" : "⏳ Pending")}
                      {attendance.status === "rejected" && (language === "ar" ? "❌ مرفوض" : "❌ Rejected")}
                      {attendance.status === "cancelled" && (language === "ar" ? "🚫 ملغي" : "🚫 Cancelled")}
                    </div>

                    {/* Cancel Button - Show only for approved registrations for future events */}
                    {attendance.status === "approved" && !isPast && (
                      <button
                        onClick={() => handleCancelClick(attendance)}
                        disabled={cancellingId === attendance.id}
                        className="mt-4 w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                      >
                        {cancellingId === attendance.id 
                          ? (language === "ar" ? "جاري الإلغاء..." : "Cancelling...")
                          : (language === "ar" ? "إلغاء التسجيل" : "Cancel Registration")
                        }
                      </button>
                    )}

                    {/* Notes */}
                    {attendance.notes && (
                      <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">
                          {language === "ar" ? "ملاحظات:" : "Notes:"}
                        </p>
                        <p className="text-sm text-gray-300">{attendance.notes}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>

      {/* Cancellation Modal */}
      {showCancelModal && selectedAttendance && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-white mb-4">
              {language === "ar" ? "إلغاء التسجيل" : "Cancel Registration"}
            </h3>
            
            <div className="mb-4 p-4 bg-zinc-800/50 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">
                {language === "ar" ? "الحدث:" : "Event:"}
              </p>
              <p className="text-white font-medium">
                {language === "ar" ? selectedAttendance.event.titleAr : selectedAttendance.event.titleEn}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === "ar" ? "سبب الإلغاء *" : "Cancellation Reason *"}
              </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder={language === "ar" ? "الرجاء توضيح سبب الإلغاء..." : "Please explain why you need to cancel..."}
                rows={4}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-4 mb-6">
              <p className="text-yellow-500 text-sm">
                {language === "ar" 
                  ? "⚠️ سيتم إشعار الإدارة بإلغائك. لن تتمكن من التراجع عن هذا الإجراء."
                  : "⚠️ Administration will be notified of your cancellation. This action cannot be undone."
                }
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false)
                  setSelectedAttendance(null)
                  setCancellationReason("")
                }}
                className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors"
              >
                {language === "ar" ? "رجوع" : "Back"}
              </button>
              <button
                onClick={handleCancelConfirm}
                disabled={!cancellationReason.trim() || cancellingId === selectedAttendance.id}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                {cancellingId === selectedAttendance.id
                  ? (language === "ar" ? "جاري الإلغاء..." : "Cancelling...")
                  : (language === "ar" ? "تأكيد الإلغاء" : "Confirm Cancel")
                }
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
