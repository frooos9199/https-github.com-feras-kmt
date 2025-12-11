"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { motion } from "framer-motion"
import Link from "next/link"

interface AttendanceRequest {
  id: string
  status: string
  registeredAt: string
  notes: string | null
  user: {
    id: string
    name: string
    email: string
    phone: string
    civilId: string
  }
  event: {
    id: string
    titleEn: string
    titleAr: string
    date: string
    time: string
    location: string
  }
}

export default function AttendanceManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { language } = useLanguage()
  const [attendances, setAttendances] = useState<AttendanceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending")
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard")
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchAttendances()
    }
  }, [session, filter])

  const fetchAttendances = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/attendance?status=${filter}`)
      const data = await res.json()
      setAttendances(data)
    } catch (error) {
      console.error("Error fetching attendances:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (attendanceId: string, newStatus: "approved" | "rejected") => {
    setProcessing(attendanceId)
    try {
      const res = await fetch("/api/admin/attendance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendanceId,
          status: newStatus,
        })
      })

      if (res.ok) {
        fetchAttendances()
        alert(language === "ar" 
          ? `تم ${newStatus === "approved" ? "قبول" : "رفض"} الطلب بنجاح!`
          : `Request ${newStatus} successfully!`
        )
      } else {
        const errorData = await res.json()
        
        // Show detailed error message if event is full
        if (res.status === 400 && errorData.errorAr) {
          const message = language === "ar" 
            ? `❌ ${errorData.errorAr}\n\n📊 العدد الحالي: ${errorData.currentApproved} / ${errorData.maxMarshals}\n📍 الفعالية: ${errorData.eventTitle || ""}`
            : `❌ ${errorData.error}\n\n📊 Current: ${errorData.currentApproved} / ${errorData.maxMarshals}\n📍 Event: ${errorData.eventTitle || ""}`
          
          alert(message)
        } else {
          alert(language === "ar" ? "حدث خطأ" : "An error occurred")
        }
      }
    } catch (error) {
      console.error("Error updating attendance:", error)
      alert(language === "ar" ? "حدث خطأ" : "An error occurred")
    } finally {
      setProcessing(null)
    }
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
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            📋 {language === "ar" ? "إدارة طلبات الحضور" : "Attendance Management"}
          </h1>
          <p className="text-gray-400">
            {language === "ar" ? "قبول أو رفض طلبات المارشالات للفعاليات" : "Approve or reject marshal attendance requests"}
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex gap-2 overflow-x-auto pb-2"
        >
          {["all", "pending", "approved", "rejected"].map((status) => (
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
        {attendances.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-12 text-center"
          >
            <p className="text-gray-400 text-lg">
              {language === "ar" ? "لا توجد طلبات" : "No requests found"}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {attendances.map((attendance, index) => (
              <motion.div
                key={attendance.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Left: User & Event Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                          {attendance.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white mb-1">
                            {attendance.user.name}
                          </h3>
                          <p className="text-gray-400 text-sm mb-2">
                            {attendance.user.email} • {attendance.user.phone}
                          </p>
                          <div className="flex items-center gap-2 text-gray-300 mb-2">
                            <span>🏁</span>
                            <span className="font-medium">
                              {language === "ar" ? attendance.event.titleAr : attendance.event.titleEn}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                            <span>📅 {new Date(attendance.event.date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}</span>
                            <span>🕐 {attendance.event.time}</span>
                            <span>📍 {attendance.event.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Status & Actions */}
                    <div className="flex flex-col items-end gap-3">
                      {/* Status Badge */}
                      <span className={`px-4 py-1 rounded-full text-sm font-medium ${
                        attendance.status === "approved"
                          ? "bg-green-600/20 text-green-500 border border-green-600/30"
                          : attendance.status === "pending"
                          ? "bg-yellow-600/20 text-yellow-500 border border-yellow-600/30"
                          : "bg-red-600/20 text-red-500 border border-red-600/30"
                      }`}>
                        {attendance.status === "approved" && (language === "ar" ? "✅ مقبول" : "✅ Approved")}
                        {attendance.status === "pending" && (language === "ar" ? "⏳ معلق" : "⏳ Pending")}
                        {attendance.status === "rejected" && (language === "ar" ? "❌ مرفوض" : "❌ Rejected")}
                      </span>

                      {/* Action Buttons */}
                      {attendance.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStatusUpdate(attendance.id, "approved")}
                            disabled={processing === attendance.id}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
                          >
                            {processing === attendance.id ? "..." : (language === "ar" ? "قبول" : "Approve")}
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(attendance.id, "rejected")}
                            disabled={processing === attendance.id}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
                          >
                            {processing === attendance.id ? "..." : (language === "ar" ? "رفض" : "Reject")}
                          </button>
                        </div>
                      )}

                      {/* Registration Date */}
                      <p className="text-xs text-gray-500">
                        {new Date(attendance.registeredAt).toLocaleString(language === "ar" ? "ar-EG" : "en-US")}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
