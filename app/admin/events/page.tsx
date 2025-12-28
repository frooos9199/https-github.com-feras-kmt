"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { motion } from "framer-motion"
import Link from "next/link"

// مكون عرض التقويم للإدارة
function AdminCalendarView({ events, onEventClick }: {
  events: CalendarEvent[],
  onEventClick: (event: CalendarEvent) => void
}) {
  const { language } = useLanguage()
  const [currentDate, setCurrentDate] = useState(new Date())

  // تجميع الأحداث حسب التاريخ
  const eventsByDate = events.reduce((acc, event) => {
    // تحويل التاريخ إلى التوقيت المحلي وضمان أنه يمثل بداية اليوم
    const eventDate = new Date(event.date)
    const dateKey = eventDate.toLocaleDateString('en-CA') // YYYY-MM-DD format
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(event)
    return acc
  }, {} as Record<string, CalendarEvent[]>)

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
    setCurrentDate((prev: Date) => {
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

          const dateKey = day.toLocaleDateString('en-CA') // YYYY-MM-DD format
          const dayEvents = eventsByDate[dateKey] || []
          const isToday = day.toDateString() === new Date().toDateString()

          return (
            <div
              key={dateKey}
              className={`min-h-32 border rounded-lg p-2 transition-colors ${
                isToday
                  ? 'border-red-600 bg-red-600/10'
                  : 'border-zinc-700 hover:border-zinc-600'
              }`}
            >
              <div className={`text-sm font-medium mb-2 ${isToday ? 'text-red-400' : 'text-gray-300'}`}>
                {day.getDate()}
              </div>

              <div className="space-y-1 max-h-40 overflow-y-auto">
                {dayEvents.map(event => {
                  return (
                    <div
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className={`text-xs p-1.5 rounded cursor-pointer transition-colors ${
                        event.isArchived
                          ? 'bg-orange-600/30 text-orange-400 hover:bg-orange-600/50'
                          : 'bg-blue-600/30 text-blue-400 hover:bg-blue-600/50'
                      }`}
                    >
                      <div className="font-medium truncate text-xs">
                        {event.isArchived && '📁 '}
                        {language === "ar" ? event.titleAr : event.titleEn}
                      </div>
                      <div className="text-xs opacity-75">{event.time}</div>
                      {event.isArchived && (
                        <div className="text-xs opacity-75">� Archived</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
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
  endDate: string | null
  time: string
  location: string
  marshalTypes: string
  maxMarshals: number
  status: string
  _count: {
    attendances: number
    eventMarshals: number
  }
}

interface CalendarEvent {
  id: string
  titleEn: string
  titleAr: string
  date: string
  endDate: string | null
  time: string
  endTime: string | null
  location: string
  isArchived: boolean
}

export default function EventsManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { language } = useLanguage()
  const [events, setEvents] = useState<Event[]>([])
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showEventDetails, setShowEventDetails] = useState(false)
  const [eventDetails, setEventDetails] = useState<any>(null)

  const [formData, setFormData] = useState({
    titleEn: "",
    titleAr: "",
    descriptionEn: "",
    descriptionAr: "",
    date: "",
    endDate: "",
    time: "",
    endTime: "",
    location: "",
    marshalTypes: [] as string[],
    maxMarshals: "20",
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard")
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchEvents()
    }
  }, [session])

  // Refresh events when page becomes visible (after returning from event details)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && session?.user?.role === "admin") {
        console.log('🔄 Page became visible, refreshing events...')
        fetchEvents()
      }
    }

    const handleFocus = () => {
      if (session?.user?.role === "admin") {
        console.log('🎯 Window focused, refreshing events...')
        fetchEvents()
      }
    }

    // Check for updates from localStorage (set by event details page)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'eventUpdated' && e.newValue === 'true') {
        console.log('📡 Event updated detected, refreshing events...')
        localStorage.removeItem('eventUpdated')
        fetchEvents()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [session])

  // Auto refresh events every 5 seconds (increased frequency)
  // useEffect(() => {
  //   if (session?.user?.role !== "admin") return

  //   const interval = setInterval(() => {
  //     console.log('⏰ Auto-refreshing events...')
  //     fetchEvents()
  //   }, 5000) // 5 seconds instead of 30

  //   return () => clearInterval(interval)
  // }, [session])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      // Fetch events for list view (non-archived only)
      const eventsRes = await fetch("/api/admin/events", {
        credentials: 'include'
      })
      
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json()
        console.log('📊 Events data received:', eventsData.map((e: any) => ({ id: e.id, title: e.titleEn, count: e._count.eventMarshals, max: e.maxMarshals })))
        if (Array.isArray(eventsData)) {
          setEvents(eventsData)
        } else if (Array.isArray(eventsData.events)) {
          setEvents(eventsData.events)
        } else {
          setEvents([])
        }
      }

      // Fetch events for calendar view (all events including archived)
      const calendarRes = await fetch("/api/events/calendar", {
        credentials: 'include'
      })

      if (calendarRes.ok) {
        const calendarData = await calendarRes.json()
        if (Array.isArray(calendarData)) {
          setCalendarEvents(calendarData)
        } else {
          setCalendarEvents([])
        }
      }
    } catch (error) {
      console.error("Error fetching events:", error)
      setEvents([])
      setCalendarEvents([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = "/api/admin/events"
      const method = editingEvent ? "PUT" : "POST"
      const bodyData = {
        ...formData,
        marshalTypes: formData.marshalTypes.join(',')
      }
      const body = editingEvent
        ? { id: editingEvent.id, ...bodyData }
        : bodyData

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        fetchEvents()
        setShowModal(false)
        resetForm()
        alert(language === "ar"
          ? editingEvent ? "تم تحديث الفعالية بنجاح!" : "تم إنشاء الفعالية بنجاح!"
          : editingEvent ? "Event updated successfully!" : "Event created successfully!"
        )
      } else {
        alert(language === "ar" ? "حدث خطأ" : "An error occurred")
      }
    } catch (error) {
      console.error("Error saving event:", error)
      alert(language === "ar" ? "حدث خطأ" : "An error occurred")
    } finally {
      setSaving(false)
    }
  }

  const fetchEventDetails = async (eventId: string) => {
    try {
      const res = await fetch(`/api/admin/events/${eventId}`)
      if (res.ok) {
        const data = await res.json()
        setEventDetails(data)
        setShowEventDetails(true)
      }
    } catch (error) {
      console.error("Error fetching event details:", error)
    }
  }

  const handleEventClick = (event: CalendarEvent) => {
    router.push(`/admin/events/${event.id}`)
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
    setFormData({
      titleEn: event.titleEn,
      titleAr: event.titleAr,
      descriptionEn: event.descriptionEn,
      descriptionAr: event.descriptionAr,
      date: new Date(event.date).toISOString().split('T')[0],
      endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : "",
      time: event.time,
      endTime: "",
      location: event.location,
      marshalTypes: event.marshalTypes ? event.marshalTypes.split(',').filter(t => t) : [],
      maxMarshals: event.maxMarshals.toString(),
    })
    setShowModal(true)
  }

  const handleArchive = async (eventId: string) => {
    if (!confirm(language === "ar" ? "هل تريد أرشفة هذا الحدث؟" : "Archive this event?")) {
      return
    }

    try {
      const res = await fetch(`/api/admin/events/${eventId}/archive`, {
        method: "PATCH"
      })

      if (res.ok) {
        fetchEvents()
        alert(language === "ar" ? "تم أرشفة الحدث بنجاح!" : "Event archived successfully!")
      } else {
        alert(language === "ar" ? "حدث خطأ" : "An error occurred")
      }
    } catch (error) {
      console.error("Error archiving event:", error)
      alert(language === "ar" ? "حدث خطأ" : "An error occurred")
    }
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm(language === "ar" ? "هل أنت متأكد من حذف الفعالية؟" : "Are you sure you want to delete this event?")) {
      return
    }

    setDeleting(eventId)
    try {
      const res = await fetch(`/api/admin/events?id=${eventId}`, {
        method: "DELETE"
      })

      if (res.ok) {
        fetchEvents()
        alert(language === "ar" ? "تم حذف الفعالية بنجاح!" : "Event deleted successfully!")
      } else {
        alert(language === "ar" ? "حدث خطأ" : "An error occurred")
      }
    } catch (error) {
      console.error("Error deleting event:", error)
      alert(language === "ar" ? "حدث خطأ" : "An error occurred")
    } finally {
      setDeleting(null)
    }
  }

  const resetForm = () => {
    setEditingEvent(null)
    setFormData({
      titleEn: "",
      titleAr: "",
      descriptionEn: "",
      descriptionAr: "",
      date: "",
      endDate: "",
      time: "",
      endTime: "",
      location: "",
      marshalTypes: [],
      maxMarshals: "20",
    })
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session || session.user.role !== "admin") return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-lg border-b border-red-600/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/admin" className="flex items-center gap-3">
              <img src="/kmt-logo-main.png" alt="KMT" className="h-12 w-auto rounded px-2 py-1" />
              <span className="text-yellow-500 font-bold text-sm">👑 ADMIN</span>
            </Link>
            <Link
              href="/admin"
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
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              🏁 {language === "ar" ? "إدارة الفعاليات" : "Events Management"}
            </h1>
            <p className="text-gray-400">
              {language === "ar" ? "إنشاء وتعديل وحذف الفعاليات" : "Create, edit and delete events"}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
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
            
            <button
              onClick={() => {
                resetForm()
                setShowModal(true)
              }}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
            >
              ➕ {language === "ar" ? "فعالية جديدة" : "New Event"}
            </button>
          </div>
        </motion.div>

        {/* Events Display - List or Calendar */}
        {viewMode === 'calendar' ? (
          <AdminCalendarView events={calendarEvents} onEventClick={handleEventClick} />
        ) : (
          /* Events Grid */
          events.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-12 text-center"
            >
              <p className="text-gray-400 text-lg">
                {language === "ar" ? "لا توجد فعاليات" : "No events found"}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => router.push(`/admin/events/${event.id}`)}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-red-600/50 transition-all cursor-pointer transform hover:scale-105"
                >
                  <div className="relative h-32 overflow-hidden">
                    {/* صورة الهيدر فقط */}
                    <div className="absolute inset-0 w-full h-full z-0">
                      <div
                        style={{
                          backgroundImage: 'url(/test.jpg)',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          width: '100%',
                          height: '100%',
                          position: 'absolute',
                          inset: 0
                        }}
                      />
                      {/* أزيلت طبقة اللون الداكن لتظهر الصورة بشكل طبيعي */}
                    </div>
                  </div>
                  <div className="flex">
                    {/* أيقونات المارشال في الجانب الأيسر */}
                    <div className="flex flex-col items-center justify-center px-3 py-4 gap-2">
                      {event.marshalTypes && event.marshalTypes.split(',').filter(t => t).map((type) => {
                        const typeIcons: Record<string, string> = {
                          'karting': '🏎️',
                          'motocross': '🏍️',
                          'rescue': '🚑',
                          'circuit': '🏁',
                          'drift': '💨',
                          'drag-race': '🚦',
                          'pit': '🔧'
                        }
                        return <span key={type} className="text-2xl md:text-3xl">{typeIcons[type] || '❓'}</span>
                      })}
                    </div>
                    {/* معلومات الفعالية */}
                    <div className="flex-1 p-4">
                      <h3 className="text-lg font-bold text-white mb-2 truncate">
                        {language === "ar" ? event.titleAr : event.titleEn}
                      </h3>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {language === "ar" ? event.descriptionAr : event.descriptionEn}
                      </p>
                      <div className="space-y-1 text-sm text-gray-300 mb-4">
                        <div>📅 {new Date(event.date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}</div>
                        <div>🕐 {event.time}</div>
                        <div>📍 {event.location}</div>
                        <div className={`👥 ${(event._count.eventMarshals + event._count.attendances) >= event.maxMarshals ? 'bg-red-500/20 text-red-400 font-bold px-2 py-1 rounded' : ''}`}>
                          {event._count.eventMarshals + event._count.attendances}/{event.maxMarshals} {language === "ar" ? "مارشال" : "marshals"}
                          {/* Debug info */}
                          <span className="text-xs text-gray-500 block">
                            (A:{event._count.attendances} + E:{event._count.eventMarshals})
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          event.status === "active"
                            ? "bg-green-600/20 text-green-500"
                            : event.status === "cancelled"
                            ? "bg-red-600/20 text-red-500"
                            : "bg-gray-600/20 text-gray-500"
                        }`}>
                          {event.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleArchive(event.id)
                          }}
                          className="flex-1 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm font-medium"
                          title={language === "ar" ? "أرشفة الحدث" : "Archive Event"}
                        >
                          📁 {language === "ar" ? "أرشيف" : "Archive"}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(`/admin/attendance/print/${event.id}`, '_blank')
                          }}
                          className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
                          title={language === "ar" ? "طباعة قائمة الحضور" : "Print Attendance List"}
                        >
                          🖨️ {language === "ar" ? "طباعة" : "Print"}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(event)
                          }}
                          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                        >
                          ✏️ {language === "ar" ? "تعديل" : "Edit"}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(event.id)
                          }}
                          disabled={deleting === event.id}
                          className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          {deleting === event.id ? "..." : (language === "ar" ? "🗑️ حذف" : "🗑️ Delete")}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        )}

      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingEvent
                  ? (language === "ar" ? "تعديل الفعالية" : "Edit Event")
                  : (language === "ar" ? "فعالية جديدة" : "New Event")
                }
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-2 text-sm">
                      {language === "ar" ? "العنوان (English)" : "Title (English)"} *
                    </label>
                    <input
                      type="text"
                      value={formData.titleEn}
                      onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2 text-sm">
                      {language === "ar" ? "العنوان (العربية)" : "Title (Arabic)"} *
                    </label>
                    <input
                      type="text"
                      value={formData.titleAr}
                      onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-2 text-sm">
                      {language === "ar" ? "الوصف (English)" : "Description (English)"} *
                    </label>
                    <textarea
                      value={formData.descriptionEn}
                      onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                      required
                      rows={3}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-red-600 focus:outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2 text-sm">
                      {language === "ar" ? "الوصف (العربية)" : "Description (Arabic)"} *
                    </label>
                    <textarea
                      value={formData.descriptionAr}
                      onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                      required
                      rows={3}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-red-600 focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-2 text-sm">
                      {language === "ar" ? "تاريخ البداية" : "Start Date"} *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2 text-sm">
                      {language === "ar" ? "تاريخ النهاية" : "End Date"}
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2 text-sm">
                      {language === "ar" ? "الموقع" : "Location"} *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                      placeholder="Kuwait Motor Town"
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-2 text-sm">
                      {language === "ar" ? "وقت البداية" : "Start Time"} *
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2 text-sm">
                      {language === "ar" ? "وقت النهاية" : "End Time"}
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Marshal Types */}
                <div>
                  <label className="block text-gray-400 mb-3 text-sm">
                    {language === "ar" ? "أنواع المارشال المطلوبة" : "Required Marshal Types"} *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      {value: 'karting', labelEn: 'Karting Marshal', labelAr: 'كارتنج مارشال', icon: '�️'},
                      {value: 'motocross', labelEn: 'Motocross Marshal', labelAr: 'موتوكروس مارشال', icon: '🏍️'},
                      {value: 'rescue', labelEn: 'Rescue Marshal', labelAr: 'إنقاذ مارشال', icon: '🚑'},
                      {value: 'circuit', labelEn: 'Circuit Marshal', labelAr: 'سيركت مارشال', icon: '�'},
                      {value: 'drift', labelEn: 'Drift Marshal', labelAr: 'دريفت مارشال', icon: '💨'},
                      {value: 'drag-race', labelEn: 'Drag Race Marshal', labelAr: 'دراق ريس مارشال', icon: '🚦'},
                      {value: 'pit', labelEn: 'Pit Marshal', labelAr: 'بت مارشال', icon: '�'}
                    ].map((type) => (
                      <label key={type.value} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.marshalTypes.includes(type.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({...formData, marshalTypes: [...formData.marshalTypes, type.value]})
                            } else {
                              setFormData({...formData, marshalTypes: formData.marshalTypes.filter(t => t !== type.value)})
                            }
                          }}
                          className="w-4 h-4 rounded border-zinc-600 text-red-600 focus:ring-red-600 focus:ring-offset-0"
                        />
                        <span className="text-lg">{type.icon}</span>
                        <span className="text-white text-sm">
                          {language === "ar" ? type.labelAr : type.labelEn}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-2 text-sm">
                      {language === "ar" ? "عدد المارشالات" : "Max Marshals"} *
                    </label>
                    <input
                      type="number"
                      value={formData.maxMarshals}
                      onChange={(e) => setFormData({ ...formData, maxMarshals: e.target.value })}
                      required
                      min="1"
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {language === "ar" ? "جاري الحفظ..." : "Saving..."}
                      </span>
                    ) : (
                      <>💾 {language === "ar" ? "حفظ" : "Save"}</>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                    }}
                    disabled={saving}
                    className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
                  >
                    ❌ {language === "ar" ? "إلغاء" : "Cancel"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  )
}
