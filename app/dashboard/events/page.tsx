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
  
  const diff = Math.max(0, target.getTime() - now.getTime())
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

// مكون العداد التنازلي
function CountdownTimer({ event }: { event: Event }) {
  const { language } = useLanguage()
  const [countdown, setCountdown] = useState({ text: '', color: '#43A047' })
  
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
        className="text-lg font-bold px-4 py-2 rounded-lg inline-block"
        style={{ color: countdown.color }}
      >
        {countdown.text}
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
          <h1 className="text-3xl font-bold text-white mb-2">
            🏁 {t("upcomingEvents")}
          </h1>
          <p className="text-gray-400 mb-8">
            {t("registerYourAttendance")}
          </p>
        </motion.div>

        {/* Events List */}
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
                    {isRegistered ? (
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
      </main>
    </div>
  )
}
