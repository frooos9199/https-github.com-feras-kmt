"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"

export default function NotificationBell() {
  const { data: session } = useSession()
  const { language, t } = useLanguage()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (session?.user) {
      fetchUnreadCount()
      // Poll every 5 seconds for real-time updates
      const interval = setInterval(fetchUnreadCount, 5000)
      return () => clearInterval(interval)
    }
  }, [session])

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch("/api/notifications?unreadOnly=true")
      if (res.ok) {
        const data = await res.json()
        setUnreadCount(data.length)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  if (!session?.user) return null

  return (
    <Link
      href="/notifications"
      className="relative p-2 hover:bg-zinc-800 rounded-lg transition-colors"
      title={t('notifications')}
    >
      <span className="text-2xl">🔔</span>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  )
}
