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

  // استخراج التاريخ فقط من ISO string إذا لزم الأمر
  const extractDateOnly = (dateStr: string) => {
    if (dateStr.includes('T')) {
      return dateStr.split('T')[0]
    }
    return dateStr
  }

  const startDateOnly = extractDateOnly(startDate)
  const endDateOnly = endDate ? extractDateOnly(endDate) : startDateOnly

  const start = new Date(`${startDateOnly}T${startTime}`)
  const end = endDate && endTime ? new Date(`${endDateOnly}T${endTime}`) : new Date(`${startDateOnly}T23:59`)

  let target, label, color, icon, bgColor

  if (now < start) {
    // قبل الحدث - عداد تنازلي أخضر
    target = start
    label = language === "ar" ? "يبدأ بعد" : "Starts in"
    color = "#22c55e" // أخضر فاتح
    bgColor = "#dcfce7" // خلفية خضراء فاتحة
    icon = "⏰"
  } else if (now >= start && now <= end) {
    // أثناء الحدث - عداد تنازلي برتقالي
    target = end
    label = language === "ar" ? "ينتهي بعد" : "Ends in"
    color = "#f97316" // برتقالي
    bgColor = "#fed7aa" // خلفية برتقالية فاتحة
    icon = "🏁"
  } else {
    // بعد الحدث - انتهى
    return {
      text: language === "ar" ? "انتهى الحدث" : "Event finished",
      color: "#ef4444", // أحمر
      bgColor: "#fecaca", // خلفية حمراء فاتحة
      icon: "✅",
      finished: true
    }
  }

  const diff = Math.max(0, target.getTime() - now.getTime())
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const mins = Math.floor((diff / (1000 * 60)) % 60)
  const secs = Math.floor((diff / 1000) % 60)

  let timeStr = ""
  if (days > 0) {
    timeStr += days + (language === "ar" ? " يوم " : "d ")
  }
  if (hours > 0 || days > 0) {
    timeStr += hours + (language === "ar" ? " ساعة " : "h ")
  }
  if (mins > 0 || hours > 0 || days > 0) {
    timeStr += mins + (language === "ar" ? " دقيقة " : "m ")
  }
  timeStr += secs + (language === "ar" ? " ثانية" : "s")

  return {
    text: `${icon} ${label}: ${timeStr}`,
    color,
    bgColor,
    icon,
    finished: false
  }
}

interface Event {
  id: string
  titleEn: string
  titleAr: string
  descriptionEn: string
  descriptionAr: string
  date: string
  time: string
  endDate?: string
  endTime?: string
  location: string
  type: string
  maxMarshals: number
  attendances: any[]
  _count: {
    attendances: number
  }
  approvedCount: number
  rejectedCount: number
}

// مكون عرض التقويم
function CalendarView({ events, onRegister, registering }: { 
  events: Event[], 
  onRegister: (eventId: string) => void,
  registering: string | null 
}) {
  const { language, t } = useLanguage()
  const [currentDate, setCurrentDate] = useState(new Date())

  // تجميع الأحداث حسب التاريخ
  const eventsByDate = events.reduce((acc, event) => {
    const dateKey = event.date.split('T')[0] // استخراج التاريخ فقط
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(event)
    return acc
  }, {} as Record<string, Event[]>)

  // الحصول على أيام الشهر الحالي
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // إضافة أيام فارغة للبداية
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // إضافة أيام الشهر
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const days = getDaysInMonth(currentDate)
  const monthNames = language === "ar" 
    ? ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
    : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      {/* رأس التقويم */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <span className="text-white text-xl">←</span>
        </button>
        
        <h2 className="text-2xl font-bold text-white">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <span className="text-white text-xl">→</span>
        </button>
      </div>

      {/* أسماء الأيام */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {(language === "ar" ? ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"] 
          : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]).map(day => (
          <div key={day} className="text-center text-gray-400 font-medium py-2">
            {day}
          </div>
        ))}
      </div>

      {/* شبكة الأيام */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="min-h-32"></div>
          }

          const dateKey = day.toISOString().split('T')[0]
          const dayEvents = eventsByDate[dateKey] || []
          const isToday = day.toDateString() === new Date().toDateString()

          return (
            <div
              key={dateKey}
              className={`min-h-32 border rounded-lg p-2 transition-colors overflow-hidden ${
                isToday 
                  ? 'border-red-600 bg-red-600/10' 
                  : 'border-zinc-700 hover:border-zinc-600'
              }`}
            >
              <div className={`text-sm font-medium mb-2 ${isToday ? 'text-red-400' : 'text-gray-300'}`}>
                {day.getDate()}
              </div>
              
              <div className="space-y-1 max-h-24 overflow-hidden">
                {dayEvents.slice(0, 3).map(event => {
                  const isRegistered = event.attendances.length > 0
                  const registrationStatus = isRegistered ? event.attendances[0].status : null
                  const countdownInfo = getCountdown(event.date, event.time, event.endDate, event.endTime, undefined, language)
                  const isFinished = countdownInfo.finished

                  return (
                    <div
                      key={event.id}
                      className={`text-xs p-1.5 rounded transition-colors ${
                        isFinished 
                          ? 'bg-gray-600/50 text-gray-400'
                          : isRegistered && registrationStatus === 'approved'
                          ? 'bg-green-600/30 text-green-400'
                          : 'bg-red-600/30 text-red-400'
                      }`}
                    >
                      <div className="font-medium truncate text-xs">
                        {event.type === "race" && "🏁"}
                        {event.type === "drift" && "🚗"}
                        {event.type === "track-day" && "🏎️"}
                        {language === "ar" ? event.titleAr : event.titleEn}
                      </div>
                      <div className="text-xs opacity-75">{event.time}</div>
                    </div>
                  )
                })}
                
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 text-center py-1">
                    +{dayEvents.length - 3}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// مكون العداد التنازلي
function CountdownTimer({ event }: { event: Event }) {
  const { language } = useLanguage()
  const [countdown, setCountdown] = useState({
    text: '',
    color: '#22c55e',
    bgColor: '#dcfce7',
    icon: '⏰',
    finished: false
  })

  useEffect(() => {
    if (!event.date) return

    const updateCountdown = () => {
      const cd = getCountdown(event.date, event.time, event.endDate, event.endTime, undefined, language)
      setCountdown(cd)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [event.date, event.time, event.endDate, event.endTime, language])

  return (
    <div className="text-center mb-4">
      <div
        className={`text-lg font-bold px-6 py-3 rounded-xl inline-block border-2 transition-all duration-300 ${
          countdown.finished
            ? 'border-red-300 shadow-lg'
            : 'border-current shadow-md hover:shadow-lg'
        }`}
        style={{
          color: countdown.color,
          backgroundColor: countdown.bgColor,
          borderColor: countdown.color
        }}
      >
        <div className="text-center">
          <span className="font-bold">{countdown.text}</span>
        </div>
      </div>
    </div>
  )
}

interface Event {
  id: string
  titleEn: string
  titleAr: string
  descriptionEn: string
  descriptionAr: string
  date: string
  time: string
  endDate?: string
  endTime?: string
  location: string
  type: string
  maxMarshals: number
  attendances: any[]
  _count: {
    attendances: number
  }
  approvedCount: number
  rejectedCount: number
}

export default function EventsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { language, t } = useLanguage()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchEvents()
    }
  }, [session])

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events")
      const data = await res.json()
      setEvents(data)
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (eventId: string) => {
    setRegistering(eventId)
    try {
      const res = await fetch("/api/attendance/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId })
      })

      if (res.ok) {
        fetchEvents() // Refresh events
        alert(t("registrationSuccessful"))
      } else {
        const data = await res.json()
        alert(data.error || "Registration failed")
      }
    } catch (error) {
      console.error("Error registering:", error)
      alert("Something went wrong")
    } finally {
      setRegistering(null)
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
              ← {t("back")}
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
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white">
              🏁 {t("upcomingEvents")}
            </h1>
            
            {/* View Toggle Buttons */}
            <div className="flex bg-zinc-800/50 rounded-lg p-1 border border-zinc-700">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                📋 {language === "ar" ? "قائمة" : "List"}
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                📅 {language === "ar" ? "تقويم" : "Calendar"}
              </button>
            </div>
          </div>
          
          <p className="text-gray-400 mb-8">
            {t("registerYourAttendance")}
          </p>
        </motion.div>

        {/* Events Display - List or Calendar */}
        {viewMode === 'calendar' ? (
          <CalendarView events={events} onRegister={handleRegister} registering={registering} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {events.length === 0 ? (
              <div className="col-span-2 text-center py-12">
                <p className="text-gray-400 text-lg">
                  {t("noUpcomingEvents")}
                </p>
              </div>
            ) : (
              events.map((event, index) => {
                const isRegistered = event.attendances.length > 0
                const registrationStatus = isRegistered ? event.attendances[0].status : null
                const isFull = event.approvedCount >= event.maxMarshals
                
                // التحقق من انتهاء الحدث
                const countdownInfo = getCountdown(event.date, event.time, event.endDate, event.endTime, undefined, language)
                const isFinished = countdownInfo.finished

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-red-600/50 transition-colors"
                  >
                    {/* Event Image: صورة test.jpg مع طبقة داكنة */}
                    <div
                      className="h-48 flex items-center justify-center bg-black relative"
                      style={{
                        backgroundImage: 'url(/test.jpg)',
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    >
                      {/* أزيلت طبقة اللون الداكن لتظهر الصورة بشكل طبيعي */}
                      <span className="text-6xl relative z-10">
                        {event.type === "race" && "🏁"}
                        {event.type === "drift" && "🚗"}
                        {event.type === "track-day" && "🏎️"}
                      </span>
                    </div>

                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {language === "ar" ? event.titleAr : event.titleEn}
                      </h3>
                      
                      <p className="text-gray-400 mb-4">
                        {language === "ar" ? event.descriptionAr : event.descriptionEn}
                      </p>

                      {/* العداد التنازلي */}
                      <CountdownTimer event={event} />

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
                                {new Date(event.date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
                                  weekday: 'short',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-green-500 text-lg font-bold">{event.time}</span>
                          </div>
                        </div>
                        
                        {/* تاريخ ووقت النهاية */}
                        {(event.endDate || event.endTime) && (
                          <div className="flex items-center bg-red-600/10 border border-red-600/30 rounded-lg p-4">
                            <div className="flex items-center gap-3 flex-1">
                              <span className="text-red-500">🏁</span>
                              <div>
                                <div className="text-red-500 font-bold text-sm mb-1">
                                  {language === "ar" ? "النهاية" : "End"}
                                </div>
                                <div className="text-white font-semibold text-base">
                                  {event.endDate ? new Date(event.endDate).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  }) : new Date(event.date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
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
                                {event.endTime || (event.time ? event.time : '23:59')}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* الموقع وعدد المشاركين */}
                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-300">
                          <span>📍</span>
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <span>👥</span>
                          <span>
                            {event.approvedCount}/{event.maxMarshals} {t("marshals")}
                            {event.rejectedCount > 0 && (
                              <span className="text-red-400 ml-2">
                                ({event.rejectedCount} {t("rejected")})
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Registration Status */}
                      {isFinished ? (
                        <div className="px-4 py-2 rounded-lg text-center font-medium bg-gray-600/20 text-gray-400 border border-gray-600/30">
                          {language === "ar" ? "انتهى الحدث - لا يمكن التسجيل" : "Event finished - Registration not available"}
                        </div>
                      ) : isRegistered ? (
                        <div className={`px-4 py-2 rounded-lg text-center font-medium ${
                          registrationStatus === "approved" 
                            ? "bg-green-600/20 text-green-500 border border-green-600/30"
                            : registrationStatus === "pending"
                            ? "bg-yellow-600/20 text-yellow-500 border border-yellow-600/30"
                            : "bg-red-600/20 text-red-500 border border-red-600/30"
                        }`}>
                          {registrationStatus === "approved" && `✅ ${t("approved")}`}
                          {registrationStatus === "pending" && `⏳ ${t("pending")}`}
                          {registrationStatus === "rejected" && `❌ ${t("rejected")}`}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRegister(event.id)}
                          disabled={registering === event.id || isFull}
                          className={`w-full py-3 rounded-lg font-bold transition-colors ${
                            isFull
                              ? "bg-gray-600 cursor-not-allowed"
                              : "bg-red-600 hover:bg-red-700"
                          } text-white disabled:opacity-50`}
                        >
                          {registering === event.id ? (
                            <span className="flex items-center justify-center gap-2">
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              {t("registering")}
                            </span>
                          ) : isFull ? (
                            t("full")
                          ) : (
                            <>🏁 {t("register")}</>
                          )}
                        </button>
                      )}
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        )}
      </main>
    </div>
  )
}
