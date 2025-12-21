"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { motion } from "framer-motion"
import Link from "next/link"
import NotificationBell from "@/components/NotificationBell"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t, language, setLanguage } = useLanguage()
  const [stats, setStats] = useState({
    upcomingEvents: 0,
    myAttendance: 0,
    pendingRequests: 0,
  })
  const [userImage, setUserImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user?.role === "admin") {
      router.push("/admin")
    }
  }, [status, session, router])

  useEffect(() => {
    if (session) {
      fetchStats()
      fetchUserImage()
    }
  }, [session])

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard/stats")
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserImage = async () => {
    try {
      const res = await fetch("/api/profile")
      const data = await res.json()
      setUserImage(data.image)
    } catch (error) {
      console.error("Error fetching user image:", error)
    }
  }

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" })
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
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src="/kmt-logo-main.png" alt="KMT" className="h-12 w-auto rounded px-2 py-1" />
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <NotificationBell />

              {/* Language Toggle */}
              <button
                onClick={() => setLanguage(language === "en" ? "ar" : "en")}
                className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors"
              >
                {language === "en" ? "AR" : "EN"}
              </button>

              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{session.user?.name}</p>
                  <p className="text-xs text-gray-400">
                    {session.user?.role === "admin" ? "Admin" : "Marshal"}
                  </p>
                </div>
                {userImage ? (
                  <img
                    src={userImage}
                    alt={session.user?.name || "User"}
                    className="w-10 h-10 rounded-full object-cover border-2 border-red-600"
                  />
                ) : (
                  <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                    {session.user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

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
            {t("welcome")}, {session.user?.name}
          </h1>
          <p className="text-gray-400">
            {t("marshalDashboard")}
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-red-600/20 to-red-600/5 border border-red-600/30 rounded-xl p-6 hover:border-red-600 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏁</span>
              </div>
              <span className="text-3xl font-bold text-white">{stats.upcomingEvents}</span>
            </div>
            <h3 className="text-gray-300 font-medium">
              {t("upcomingEvents")}
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-600/20 to-green-600/5 border border-green-600/30 rounded-xl p-6 hover:border-green-600 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <span className="text-3xl font-bold text-white">{stats.myAttendance}</span>
            </div>
            <h3 className="text-gray-300 font-medium">
              {t("myAttendance")}
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-yellow-600/20 to-yellow-600/5 border border-yellow-600/30 rounded-xl p-6 hover:border-yellow-600 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
              <span className="text-3xl font-bold text-white">{stats.pendingRequests}</span>
            </div>
            <h3 className="text-gray-300 font-medium">
              {t("pendingRequests")}
            </h3>
          </motion.div>
        </div>

        {/* Quick Actions */}
                  {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">
              ⚡ {t("quickActions")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/dashboard/events" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-center">
                🏁 {t("viewEvents")}
              </Link>
              <Link href="/dashboard/attendance" className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-center">
                📋 {t("myAttendance")}
              </Link>
              <Link href="/dashboard/profile" className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-center">
                👤 {t("profile")}
              </Link>
              <button className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                🔔 {t("notifications")}
              </button>
            </div>
          </motion.div>
      </main>
    </div>
  )
}
