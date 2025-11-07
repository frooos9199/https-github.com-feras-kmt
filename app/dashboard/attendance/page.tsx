"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { motion } from "framer-motion"
import Link from "next/link"

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
    location: string
    type: string
  }
}

export default function MyAttendancePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { language } = useLanguage()
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")

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
    rejected: attendances.filter(a => a.status === "rejected").length,
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
              <img src="/kmt-logo-main.png" alt="KMT" className="h-12 w-auto border-2 border-white/30 rounded px-2 py-1" />
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
                  {/* Event Image */}
                  <div className="h-32 bg-gradient-to-br from-red-600/20 to-red-900/20 flex items-center justify-center relative">
                    <span className="text-5xl">
                      {attendance.event.type === "race" && "🏁"}
                      {attendance.event.type === "drift" && "🚗"}
                      {attendance.event.type === "track-day" && "🏎️"}
                    </span>
                    {isPast && (
                      <div className="absolute top-2 right-2 px-3 py-1 bg-gray-600/80 rounded-full text-xs text-white">
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

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <span>📅</span>
                        <span>{new Date(attendance.event.date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <span>🕐</span>
                        <span>{attendance.event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <span>📍</span>
                        <span>{attendance.event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <span>📝</span>
                        <span>{new Date(attendance.registeredAt).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className={`px-4 py-2 rounded-lg text-center font-medium ${
                      attendance.status === "approved" 
                        ? "bg-green-600/20 text-green-500 border border-green-600/30"
                        : attendance.status === "pending"
                        ? "bg-yellow-600/20 text-yellow-500 border border-yellow-600/30"
                        : "bg-red-600/20 text-red-500 border border-red-600/30"
                    }`}>
                      {attendance.status === "approved" && (language === "ar" ? "✅ مقبول" : "✅ Approved")}
                      {attendance.status === "pending" && (language === "ar" ? "⏳ معلق" : "⏳ Pending")}
                      {attendance.status === "rejected" && (language === "ar" ? "❌ مرفوض" : "❌ Rejected")}
                    </div>

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
    </div>
  )
}
