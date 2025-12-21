"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { motion } from "framer-motion"
import Link from "next/link"
import NotificationBell from "@/components/NotificationBell"

interface AdminStats {
  totalMarshals: number
  totalEvents: number
  pendingAttendance: number
  upcomingEvents: number
  recentActivity: Array<{
    id: string
    status: string
    registeredAt: string
    user: {
      name: string
      employeeId: string
    }
    event: {
      titleEn: string
      titleAr: string
    }
  }>
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { language, setLanguage, t } = useLanguage()
  const [stats, setStats] = useState<AdminStats>({
    totalMarshals: 0,
    totalEvents: 0,
    pendingAttendance: 0,
    upcomingEvents: 0,
    recentActivity: [],
  })
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
      fetchStats()
    }
  }, [session])

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats")
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    const { signOut } = await import("next-auth/react")
    signOut({ callbackUrl: "/login" })
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
            <div className="flex items-center gap-3">
              <img src="/kmt-logo-main.png" alt="KMT" className="h-12 w-auto rounded px-2 py-1" />
              <span className="text-yellow-500 font-bold text-sm">👑 ADMIN</span>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <button
                onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm"
              >
                {language === "ar" ? "EN" : "ع"}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                {t("logout")}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            👑 {t("adminDashboard")}
          </h1>
          <p className="text-gray-400">
            {t("welcome")} {session.user.name}، {t("systemManagement")}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-600/20 to-blue-900/20 border border-blue-600/30 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">👥</span>
              <div className="text-right">
                <p className="text-gray-400 text-sm">
                  {t("totalMarshals")}
                </p>
                <p className="text-3xl font-bold text-white">{stats.totalMarshals}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-600/20 to-green-900/20 border border-green-600/30 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">🏁</span>
              <div className="text-right">
                <p className="text-gray-400 text-sm">
                  {t("totalEvents")}
                </p>
                <p className="text-3xl font-bold text-white">{stats.totalEvents}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-yellow-600/20 to-yellow-900/20 border border-yellow-600/30 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">⏳</span>
              <div className="text-right">
                <p className="text-gray-400 text-sm">
                  {t("pendingRequests")}
                </p>
                <p className="text-3xl font-bold text-white">{stats.pendingAttendance}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-red-600/20 to-red-900/20 border border-red-600/30 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">📅</span>
              <div className="text-right">
                <p className="text-gray-400 text-sm">
                  {t("upcomingEvents")}
                </p>
                <p className="text-3xl font-bold text-white">{stats.upcomingEvents}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-white mb-4">
            ⚡ {t("quickActions")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Link
              href="/admin/events"
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-center"
            >
              🏁 {t("manageEvents")}
            </Link>
            <Link
              href="/admin/attendance"
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-center"
            >
              📋 {t("attendanceRequests")}
            </Link>
            <Link
              href="/admin/marshals"
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-center"
            >
              👥 {t("manageMarshals")}
            </Link>
            <Link
              href="/admin/broadcast"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-center"
            >
              📢 {t("broadcastMessage")}
            </Link>
            <Link
              href="/admin/backup"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-center"
            >
              🗄️ {t("databaseBackup")}
            </Link>
            <Link
              href="/admin/reports"
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-center"
            >
              📊 {t("reports")}
            </Link>
            <Link
              href="/dashboard/profile"
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-center"
            >
              👤 {t("profile")}
            </Link>
            <Link
              href="/"
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-center"
            >
              🏠 {t("home")}
            </Link>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">
            📈 {t("recentActivity")}
          </h2>
          {stats.recentActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {t("noActivity")}
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.status === "approved" 
                      ? "bg-green-600/20 text-green-500"
                      : activity.status === "pending"
                      ? "bg-yellow-600/20 text-yellow-500"
                      : "bg-red-600/20 text-red-500"
                  }`}>
                    {activity.status === "approved" ? "✅" : activity.status === "pending" ? "⏳" : "❌"}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">
                      <span className="text-red-500 font-mono text-sm">{activity.user.employeeId}</span>
                      {" "}{activity.user.name}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {language === "ar" ? activity.event.titleAr : activity.event.titleEn}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(activity.registeredAt).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
