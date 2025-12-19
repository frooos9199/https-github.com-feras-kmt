"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/LanguageContext"
import NotificationBell from "@/components/NotificationBell"
import Link from "next/link"

export default function BroadcastPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { language, setLanguage } = useLanguage()
  
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [recipientFilter, setRecipientFilter] = useState("all")
  const [marshalTypes, setMarshalTypes] = useState<string[]>([])
  const [selectedEvent, setSelectedEvent] = useState("")
  const [sendEmail, setSendEmail] = useState(true)
  const [sendNotification, setSendNotification] = useState(true)
  const [priority, setPriority] = useState<"normal" | "high" | "urgent">("normal")
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState<any[]>([])
  const [recipientCount, setRecipientCount] = useState<number | null>(null)

  // Redirect if not admin
  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated" || session?.user?.role !== "admin") {
      router.push("/")
    }
  }, [session, status, router])

  // Fetch events
  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/admin/events", {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setEvents(data)
      }
    } catch (error) {
      console.error("Error fetching events:", error)
    }
  }

  // Templates
  const templates = {
    event_postponed: {
      subject: "Event Postponed - Action Required",
      message: "We regret to inform you that the upcoming event has been postponed to a new date. We will notify you of the new schedule soon. We apologize for any inconvenience."
    },
    event_cancelled: {
      subject: "Event Cancelled",
      message: "Unfortunately, we have to cancel the upcoming event due to unforeseen circumstances. We apologize for any inconvenience and will keep you updated about future events."
    },
    important_announcement: {
      subject: "Important Announcement",
      message: "Dear Marshals,\n\nWe have an important announcement regarding KMT operations. Please read carefully.\n\n[Add your announcement here]\n\nThank you for your attention."
    },
    reminder: {
      subject: "Reminder - Upcoming Event",
      message: "This is a friendly reminder about your upcoming marshal duty. Please make sure to:\n\n• Arrive 30 minutes before start time\n• Bring your ID card\n• Wear official marshal uniform\n• Review safety instructions\n\nSee you soon!"
    }
  }

  const applyTemplate = (templateKey: keyof typeof templates) => {
    const template = templates[templateKey]
    setSubject(template.subject)
    setMessage(template.message)
  }

  const handleMarshalTypeToggle = (type: string) => {
    setMarshalTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      alert("Please fill in subject and message")
      return
    }

    if (!sendEmail && !sendNotification) {
      alert("Please select at least one delivery method")
      return
    }

    if (recipientFilter === "by-type" && marshalTypes.length === 0) {
      alert("Please select at least one marshal type")
      return
    }

    if (recipientFilter === "by-event" && !selectedEvent) {
      alert("Please select an event")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          message,
          recipientFilter,
          marshalTypes: marshalTypes.join(","),
          eventId: selectedEvent || null,
          sendEmail,
          sendNotification,
          priority
        })
      })

      if (res.ok) {
        const data = await res.json()
        alert(`✅ Message sent successfully to ${data.recipientCount} marshal(s)!`)
        
        // Reset form
        setSubject("")
        setMessage("")
        setRecipientFilter("all")
        setMarshalTypes([])
        setSelectedEvent("")
        setPriority("normal")
        setRecipientCount(null)
      } else {
        const error = await res.json()
        alert(`Error: ${error.error || "Failed to send message"}`)
      }
    } catch (error) {
      console.error("Error sending broadcast:", error)
      alert("Failed to send message")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" })
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (session?.user?.role !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-lg border-b border-red-600/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/admin">
                <img src="/kmt-logo-main.png" alt="KMT" className="h-12 w-auto rounded px-2 py-1 cursor-pointer" />
              </Link>
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
                {language === "ar" ? "تسجيل خروج" : "Logout"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
  <main className="min-h-screen relative overflow-y-auto max-w-4xl mx-auto px-4 py-8 pb-32">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/admin">
            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors">
              <span>←</span>
              <span>{language === "ar" ? "رجوع" : "Back"}</span>
            </button>
          </Link>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-white mb-2">📢 {language === "ar" ? "رسائل جماعية" : "Broadcast Message"}</h1>
          <p className="text-gray-400 mb-6">
            {language === "ar" 
              ? "إرسال رسائل للمارشالات عبر البريد الإلكتروني و/أو الإشعارات" 
              : "Send messages to marshals via email and/or in-app notifications"
            }
          </p>

          {/* Quick Templates */}
          <div className="mb-6 p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              📝 Quick Templates
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                onClick={() => applyTemplate("event_postponed")}
                className="px-3 py-2 bg-zinc-800 border border-zinc-700 text-white rounded hover:bg-zinc-700 text-sm"
              >
                Event Postponed
              </button>
              <button
                onClick={() => applyTemplate("event_cancelled")}
                className="px-3 py-2 bg-zinc-800 border border-zinc-700 text-white rounded hover:bg-zinc-700 text-sm"
              >
                Event Cancelled
              </button>
              <button
                onClick={() => applyTemplate("important_announcement")}
                className="px-3 py-2 bg-zinc-800 border border-zinc-700 text-white rounded hover:bg-zinc-700 text-sm"
              >
                Announcement
              </button>
              <button
                onClick={() => applyTemplate("reminder")}
                className="px-3 py-2 bg-zinc-800 border border-zinc-700 text-white rounded hover:bg-zinc-700 text-sm"
              >
                Reminder
              </button>
            </div>
          </div>

          {/* Recipients */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              👥 Recipients
            </label>
            <select
              value={recipientFilter}
              onChange={(e) => setRecipientFilter(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Active Marshals</option>
              <option value="approved">Marshals with Approved Events</option>
              <option value="pending">Marshals with Pending Requests</option>
              <option value="by-type">By Marshal Type</option>
              <option value="by-event">By Specific Event</option>
            </select>
          </div>

          {/* Marshal Types Filter */}
          {recipientFilter === "by-type" && (
            <div className="mb-6 p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Marshal Types
              </label>
              <div className="space-y-2">
                {["karting", "motocross", "rescue", "circuit", "drift", "drag-race", "pit"].map((type) => (
                  <label key={type} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={marshalTypes.includes(type)}
                      onChange={() => handleMarshalTypeToggle(type)}
                      className="w-4 h-4 text-red-600 bg-zinc-800 border-zinc-700 rounded focus:ring-red-500"
                    />
                    <span className="capitalize text-white">{type.replace("-", " ")}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Event Filter */}
          {recipientFilter === "by-event" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Event
              </label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">-- Select Event --</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.titleEn} - {new Date(event.date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Subject */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Subject *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter message subject"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          {/* Message */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Message *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message here..."
              rows={8}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          {/* Delivery Method */}
          <div className="mb-6 p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              📬 Delivery Method
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="w-4 h-4 text-red-600 bg-zinc-800 border-zinc-700 rounded focus:ring-red-500"
                />
                <span className="text-white">📧 Send Email</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendNotification}
                  onChange={(e) => setSendNotification(e.target.checked)}
                  className="w-4 h-4 text-red-600 bg-zinc-800 border-zinc-700 rounded focus:ring-red-500"
                />
                <span className="text-white">🔔 Send In-App Notification</span>
              </label>
            </div>
          </div>

          {/* Priority */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Priority Level
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="priority"
                  value="normal"
                  checked={priority === "normal"}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-4 h-4 text-red-600 bg-zinc-800 border-zinc-700 focus:ring-red-500"
                />
                <span className="text-white">📢 Normal</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="priority"
                  value="high"
                  checked={priority === "high"}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-4 h-4 text-orange-600 bg-zinc-800 border-zinc-700 focus:ring-orange-500"
                />
                <span className="text-white">⚠️ High</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="priority"
                  value="urgent"
                  checked={priority === "urgent"}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-4 h-4 text-red-600 bg-zinc-800 border-zinc-700 focus:ring-red-500"
                />
                <span className="text-white">🔴 Urgent</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleSend}
              disabled={loading || !subject.trim() || !message.trim()}
              className={`px-6 py-3 rounded-lg font-semibold text-white ${
                loading || !subject.trim() || !message.trim()
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {loading 
                ? (language === "ar" ? "جاري الإرسال..." : "Sending...") 
                : (language === "ar" ? "📤 إرسال" : "📤 Send Broadcast")
              }
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-zinc-800 bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-400 text-sm">
            <p>© 2025 Kuwait Motor Town - KMT</p>
            <p className="mt-1">{language === "ar" ? "نظام إدارة المارشال" : "Marshal Management System"}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
