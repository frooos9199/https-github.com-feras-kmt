"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { motion } from "framer-motion"
import Link from "next/link"

interface ReportData {
  totalMarshals: number
  totalEvents: number
  totalAttendances: number
  approvedAttendances: number
  pendingAttendances: number
  rejectedAttendances: number
  activeEvents: number
  upcomingEvents: number
  pastEvents: number
  topMarshals: Array<{
    name: string
    employeeId: string
    attendanceCount: number
  }>
  recentActivity: Array<{
    date: string
    eventTitle: string
    marshalCount: number
  }>
}

export default function ReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { language } = useLanguage()
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard")
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchReports()
    }
  }, [session])

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/admin/reports")
      const reportData = await res.json()
      setData(reportData)
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session || session.user.role !== "admin" || !data) return null

  const approvalRate = data.totalAttendances > 0 
    ? ((data.approvedAttendances / data.totalAttendances) * 100).toFixed(1)
    : "0"

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-lg border-b border-red-600/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/admin" className="flex items-center gap-3">
              <img src="/kmt-logo-main.png" alt="KMT" className="h-12 w-auto border-2 border-white/30 rounded px-2 py-1" />
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
            📊 {language === "ar" ? "التقارير والإحصائيات" : "Reports & Analytics"}
          </h1>
          <p className="text-gray-400">
            {language === "ar" ? "نظرة شاملة على أداء النظام" : "Comprehensive overview of system performance"}
          </p>
        </motion.div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-600/20 to-blue-600/5 border border-blue-600/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-4xl">👥</span>
              <span className="text-3xl font-bold text-white">{data.totalMarshals}</span>
            </div>
            <h3 className="text-gray-300 font-medium">
              {language === "ar" ? "إجمالي المارشالات" : "Total Marshals"}
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-600/20 to-purple-600/5 border border-purple-600/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-4xl">🏁</span>
              <span className="text-3xl font-bold text-white">{data.totalEvents}</span>
            </div>
            <h3 className="text-gray-300 font-medium">
              {language === "ar" ? "إجمالي الفعاليات" : "Total Events"}
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-green-600/20 to-green-600/5 border border-green-600/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-4xl">✅</span>
              <span className="text-3xl font-bold text-white">{data.approvedAttendances}</span>
            </div>
            <h3 className="text-gray-300 font-medium">
              {language === "ar" ? "حضور مقبول" : "Approved Attendance"}
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-red-600/20 to-red-600/5 border border-red-600/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-4xl">📈</span>
              <span className="text-3xl font-bold text-white">{approvalRate}%</span>
            </div>
            <h3 className="text-gray-300 font-medium">
              {language === "ar" ? "معدل القبول" : "Approval Rate"}
            </h3>
          </motion.div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Attendance Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              📋 {language === "ar" ? "توزيع الحضور" : "Attendance Breakdown"}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-600/10 rounded-lg border border-green-600/30">
                <span className="text-gray-300">{language === "ar" ? "مقبول" : "Approved"}</span>
                <span className="text-2xl font-bold text-green-500">{data.approvedAttendances}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-yellow-600/10 rounded-lg border border-yellow-600/30">
                <span className="text-gray-300">{language === "ar" ? "معلق" : "Pending"}</span>
                <span className="text-2xl font-bold text-yellow-500">{data.pendingAttendances}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-600/10 rounded-lg border border-red-600/30">
                <span className="text-gray-300">{language === "ar" ? "مرفوض" : "Rejected"}</span>
                <span className="text-2xl font-bold text-red-500">{data.rejectedAttendances}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                <span className="text-gray-300 font-bold">{language === "ar" ? "الإجمالي" : "Total"}</span>
                <span className="text-2xl font-bold text-white">{data.totalAttendances}</span>
              </div>
            </div>
          </motion.div>

          {/* Events Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              🏁 {language === "ar" ? "توزيع الفعاليات" : "Events Breakdown"}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-600/10 rounded-lg border border-blue-600/30">
                <span className="text-gray-300">{language === "ar" ? "نشطة" : "Active"}</span>
                <span className="text-2xl font-bold text-blue-500">{data.activeEvents}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-600/10 rounded-lg border border-purple-600/30">
                <span className="text-gray-300">{language === "ar" ? "قادمة" : "Upcoming"}</span>
                <span className="text-2xl font-bold text-purple-500">{data.upcomingEvents}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-600/10 rounded-lg border border-gray-600/30">
                <span className="text-gray-300">{language === "ar" ? "منتهية" : "Past"}</span>
                <span className="text-2xl font-bold text-gray-400">{data.pastEvents}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                <span className="text-gray-300 font-bold">{language === "ar" ? "الإجمالي" : "Total"}</span>
                <span className="text-2xl font-bold text-white">{data.totalEvents}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Top Marshals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            🏆 {language === "ar" ? "أفضل المارشالات" : "Top Marshals"}
          </h2>
          {data.topMarshals.length === 0 ? (
            <p className="text-center text-gray-400 py-8">
              {language === "ar" ? "لا توجد بيانات" : "No data available"}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.topMarshals.map((marshal, index) => (
                <div
                  key={index}
                  className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 hover:border-red-600/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "🏅"}
                      </span>
                      <div>
                        <p className="font-bold text-white">{marshal.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{marshal.employeeId}</p>
                      </div>
                    </div>
                    <span className="bg-red-600/20 text-red-500 px-3 py-1 rounded-full text-sm font-bold">
                      {marshal.attendanceCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
