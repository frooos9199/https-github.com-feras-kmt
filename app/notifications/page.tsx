"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { motion } from "framer-motion"
import Link from "next/link"

interface Notification {
  id: string
  type: string
  titleEn: string
  titleAr: string
  messageEn: string
  messageAr: string
  eventId: string | null
  isRead: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { language } = useLanguage()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (session) {
      fetchNotifications()
      
      // Auto-refresh every 5 seconds for real-time updates
      const interval = setInterval(() => {
        fetchNotifications()
      }, 5000)
      
      return () => clearInterval(interval)
    }
  }, [status, session, filter])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const url = filter === "unread" 
        ? "/api/notifications?unreadOnly=true"
        : "/api/notifications"
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId })
      })
      if (res.ok) {
        setNotifications(notifications.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        ))
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true })
      })
      if (res.ok) {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })))
      }
    } catch (error) {
      console.error("Error marking all as read:", error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const res = await fetch(`/api/notifications?id=${notificationId}`, {
        method: "DELETE"
      })
      if (res.ok) {
        setNotifications(notifications.filter(n => n.id !== notificationId))
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "NEW_EVENT": return "🎯"
      case "REGISTRATION_APPROVED": return "✅"
      case "REGISTRATION_REJECTED": return "❌"
      case "EVENT_REMINDER": return "⏰"
      case "EVENT_UPDATED": return "📝"
      case "EVENT_CANCELLED": return "⚠️"
      default: return "🔔"
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (seconds < 60) return language === "ar" ? "الآن" : "just now"
    if (seconds < 3600) {
      const mins = Math.floor(seconds / 60)
      return language === "ar" ? `منذ ${mins} دقيقة` : `${mins}m ago`
    }
    if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600)
      return language === "ar" ? `منذ ${hours} ساعة` : `${hours}h ago`
    }
    const days = Math.floor(seconds / 86400)
    return language === "ar" ? `منذ ${days} يوم` : `${days}d ago`
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                🔔 {language === "ar" ? "الإشعارات" : "Notifications"}
              </h1>
              {unreadCount > 0 && (
                <p className="text-gray-400 mt-2">
                  {language === "ar" 
                    ? `${unreadCount} إشعار غير مقروء` 
                    : `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                  }
                </p>
              )}
            </div>
            <Link
              href={session?.user?.role === "admin" ? "/admin" : "/dashboard"}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
            >
              ← {language === "ar" ? "رجوع" : "Back"}
            </Link>
          </div>

          {/* Filters */}
          <div className="flex gap-3 items-center">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-xl transition-colors ${
                filter === "all"
                  ? "bg-red-600 text-white"
                  : "bg-zinc-800 text-gray-400 hover:bg-zinc-700"
              }`}
            >
              {language === "ar" ? "الكل" : "All"}
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 rounded-xl transition-colors ${
                filter === "unread"
                  ? "bg-red-600 text-white"
                  : "bg-zinc-800 text-gray-400 hover:bg-zinc-700"
              }`}
            >
              {language === "ar" ? "غير مقروء" : "Unread"}
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-500 rounded-xl transition-colors ml-auto"
              >
                ✓ {language === "ar" ? "تحديد الكل كمقروء" : "Mark all as read"}
              </button>
            )}
          </div>
        </motion.div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-400 text-lg">
              {language === "ar" 
                ? "لا توجد إشعارات" 
                : "No notifications"}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative border rounded-2xl p-4 transition-all ${
                  notification.isRead
                    ? "bg-zinc-900/30 border-zinc-800"
                    : "bg-zinc-900/50 border-red-600/30"
                }`}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="text-3xl">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1">
                      {language === "ar" ? notification.titleAr : notification.titleEn}
                    </h3>
                    <p className="text-gray-400 text-sm mb-2 whitespace-pre-wrap">
                      {language === "ar" ? notification.messageAr : notification.messageEn}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{getTimeAgo(notification.createdAt)}</span>
                      {notification.eventId && (
                        <Link
                          href={
                            session?.user?.role === "admin"
                              ? `/admin/events/${notification.eventId}`
                              : `/dashboard/events`
                          }
                          className="text-red-500 hover:text-red-400"
                        >
                          {language === "ar" ? "عرض الحدث" : "View Event"} →
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-500 rounded-lg text-xs transition-colors"
                        title={language === "ar" ? "تحديد كمقروء" : "Mark as read"}
                      >
                        ✓
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-500 rounded-lg text-xs transition-colors"
                      title={language === "ar" ? "حذف" : "Delete"}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Unread indicator */}
                {!notification.isRead && (
                  <div className="absolute top-4 right-4 w-2 h-2 bg-red-600 rounded-full" />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
