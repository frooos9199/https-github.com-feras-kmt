"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { motion } from "framer-motion"
import Link from "next/link"

interface Event {
  id: string
  titleEn: string
  titleAr: string
  descriptionEn: string
  descriptionAr: string
  date: string
  endDate: string | null
  time: string
  endTime: string | null
  location: string
  marshalTypes: string
  maxMarshals: number
  status: string
  createdAt: string
  _count: {
    attendances: number
  }
  attendances: Array<{
    id: string
    userId: string
    status: string
    registeredAt: string
    cancelledAt: string | null
    cancellationReason: string | null
    createdAt: string
    user: {
      id: string
      employeeId: string
      name: string
      email: string
      phone: string
      image: string | null
    }
  }>
}

export default function EventDetails() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const { language } = useLanguage()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showRemoveMarshalModal, setShowRemoveMarshalModal] = useState(false)
  const [selectedMarshalId, setSelectedMarshalId] = useState<string | null>(null)
  const [removalReason, setRemovalReason] = useState<string>("")
  const [showAddMarshalModal, setShowAddMarshalModal] = useState(false)
  const [availableMarshals, setAvailableMarshals] = useState<any[]>([])
  const [selectedMarshalToAdd, setSelectedMarshalToAdd] = useState<string | null>(null)
  const [eventId, setEventId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
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
    maxMarshals: 10,
    status: "active"
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard")
    }
  }, [status, session, router])


  useEffect(() => {
    console.log('params:', params);
    if (params.id) {
      setEventId(params.id as string)
      console.log('eventId set:', params.id)
    } else {
      console.warn('No id in params!', params)
    }
  }, [params])

  useEffect(() => {
    console.log('eventId:', eventId)
    if (eventId) {
      fetchEvent()
    }
  }, [eventId])

  useEffect(() => {
    if (showAddMarshalModal && event) {
      fetchAvailableMarshals()
    }
  }, [showAddMarshalModal, event])

  const fetchEvent = async () => {
    if (!eventId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      })
      console.log('API RESPONSE:', res);
      if (res.ok) {
        const data = await res.json()
        console.log('EVENT DATA:', data);
        setEvent(data)
        setEditForm({
          titleEn: data.titleEn,
          titleAr: data.titleAr,
          descriptionEn: data.descriptionEn,
          descriptionAr: data.descriptionAr,
          date: data.date.split('T')[0],
          endDate: data.endDate ? data.endDate.split('T')[0] : "",
          time: data.time,
          endTime: data.endTime || "",
          location: data.location,
          marshalTypes: data.marshalTypes ? data.marshalTypes.split(',').filter((t: string) => t) : [],
          maxMarshals: data.maxMarshals,
          status: data.status
        })
      } else {
        const text = await res.text();
        console.error('API ERROR:', res.status, text);
        setError(`حدث خطأ في جلب بيانات الحدث: ${res.status}`);
      }
    } catch (error) {
      console.error('FETCH ERROR:', error);
      setError('حدث خطأ في الاتصال بالخادم أو جلب بيانات الحدث.');
    }
    setLoading(false)
  }

  const handleEdit = async () => {
    if (!event) return
    try {
      const requestData = {
        ...editForm,
        marshalTypes: editForm.marshalTypes.join(',')
      }
      console.log('Sending update data:', requestData)
      
      const res = await fetch(`/api/admin/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(requestData)
      })
      
      console.log('Response status:', res.status)
      
      if (res.ok) {
        const responseData = await res.json()
        console.log('Update successful:', responseData)
        setShowEditModal(false)
        fetchEvent()
      } else {
        const errorData = await res.json()
        console.error("Error updating event:", errorData)
        alert(`خطأ في تحديث الحدث: ${errorData.error || 'خطأ غير معروف'}`)
      }
    } catch (error) {
      console.error("Error updating event:", error)
      alert('خطأ في الاتصال بالخادم')
    }
  }

  const handleDelete = async () => {
    if (!event) return
    try {
      setError(null)
      const res = await fetch(`/api/admin/events/${event.id}`, {
        method: "DELETE"
      })
      if (res.ok) {
        router.push("/admin/events")
      }
    } catch (error) {
      console.error("Error deleting event:", error)
    }
  }

  const handleRemoveMarshal = async () => {
    if (!event || !selectedMarshalId) return
    try {
      const res = await fetch(`/api/admin/events/${event.id}/marshals/${selectedMarshalId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: removalReason })
      })
      if (res.ok) {
        setShowRemoveMarshalModal(false)
        setSelectedMarshalId(null)
        setRemovalReason("")
        fetchEvent()
      } else {
        const errData = await res.json()
        setError(errData.error || "حدث خطأ أثناء جلب بيانات الحدث.")
        setEvent(null)
        setSelectedMarshalId(null)
      }
    } catch (error) {
      console.error("Error removing marshal:", error)
      setError("حدث خطأ أثناء الاتصال بالخادم.")
      setEvent(null)
    }
  }

  const fetchAvailableMarshals = async () => {
    if (!event) return
    try {
      const res = await fetch(`/api/admin/events/${event.id}/available-marshals`)
      if (res.ok) {
        const data = await res.json()
        setAvailableMarshals(data)
      }
    } catch (error) {
      console.error("Error fetching available marshals:", error)
    }
  }

  const handleAddMarshal = async () => {
    if (!event || !selectedMarshalToAdd) return
    try {
      const res = await fetch(`/api/admin/events/${event.id}/marshals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedMarshalToAdd })
      })
      if (res.ok) {
        setShowAddMarshalModal(false)
        setSelectedMarshalToAdd(null)
        fetchEvent()
      }
    } catch (error) {
      console.error("Error adding marshal:", error)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-red-600">
        <p className="mb-4 text-lg">{error}</p>
        <Link href="/admin/events" className="btn btn-primary">رجوع لقائمة الأحداث</Link>
      </div>
    )
  }

  if (!session || session.user.role !== "admin" || !event) return null

  const statusColor = event.status === "active" ? "green" : event.status === "cancelled" ? "red" : "blue"

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
              href="/admin/events"
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {language === "ar" ? event.titleAr : event.titleEn}
              </h1>
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-${statusColor}-600/20 text-${statusColor}-500 border border-${statusColor}-600/50`}>
                {event.status === "active" ? "✅" : event.status === "cancelled" ? "❌" : "✔️"}
                {event.status === "active" 
                  ? (language === "ar" ? "نشط" : "Active")
                  : event.status === "cancelled"
                  ? (language === "ar" ? "ملغي" : "Cancelled")
                  : (language === "ar" ? "مكتمل" : "Completed")
                }
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddMarshalModal(true)}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all"
              >
                ➕ {language === "ar" ? "إضافة مارشال" : "Add Marshal"}
              </button>
              <button
                onClick={() => setShowEditModal(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all"
              >
                ✏️ {language === "ar" ? "تعديل" : "Edit"}
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all"
              >
                🗑️ {language === "ar" ? "حذف" : "Delete"}
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Event Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Basic Info */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                📋 {language === "ar" ? "معلومات الحدث" : "Event Information"}
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">{language === "ar" ? "الوصف" : "Description"}</p>
                  <p className="text-white">{language === "ar" ? event.descriptionAr : event.descriptionEn}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">{language === "ar" ? "تاريخ البداية" : "Start Date"}</p>
                    <p className="text-white font-medium text-lg">
                      {new Date(event.date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}
                    </p>
                  </div>
                  {event.endDate && (
                    <div>
                      <p className="text-gray-400 text-sm mb-1">{language === "ar" ? "تاريخ النهاية" : "End Date"}</p>
                      <p className="text-white font-medium text-lg">
                        {new Date(event.endDate).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-400 text-sm mb-1">{language === "ar" ? "الوقت" : "Time"}</p>
                    <p className="text-white font-medium text-lg">
                      {event.time} {event.endTime && `- ${event.endTime}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">{language === "ar" ? "الموقع" : "Location"}</p>
                    <p className="text-white font-medium text-lg">{event.location}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">{language === "ar" ? "أنواع المارشال المطلوبة" : "Required Marshal Types"}</p>
                    <div className="flex flex-wrap gap-2">
                      {event.marshalTypes && event.marshalTypes.split(',').filter(t => t).map((type) => {
                        const typeLabels: Record<string, {en: string, ar: string, icon: string, color: string}> = {
                          'karting': {en: 'Karting', ar: 'كارتنج', icon: '🏎️', color: 'bg-yellow-600'},
                          'motocross': {en: 'Motocross', ar: 'موتوكروس', icon: '🏍️', color: 'bg-orange-600'},
                          'rescue': {en: 'Rescue', ar: 'إنقاذ', icon: '🚑', color: 'bg-red-600'},
                          'circuit': {en: 'Circuit', ar: 'سيركت', icon: '🏁', color: 'bg-blue-600'},
                          'drift': {en: 'Drift', ar: 'دريفت', icon: '💨', color: 'bg-purple-600'},
                          'drag-race': {en: 'Drag Race', ar: 'دراق ريس', icon: '🚦', color: 'bg-pink-600'},
                          'pit': {en: 'Pit', ar: 'بت', icon: '🔧', color: 'bg-teal-600'}
                        }
                        const label = typeLabels[type]
                        if (!label) return null
                        return (
                          <span 
                            key={type}
                            className={`${label.color} text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1`}
                          >
                            <span>{label.icon}</span>
                            <span>{language === "ar" ? label.ar : label.en}</span>
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Registered Marshals */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                👥 {language === "ar" ? "المارشالات المسجلين" : "Registered Marshals"} ({event.attendances.length}/{event.maxMarshals})
              </h2>
              <div className="relative h-32 flex items-center justify-center overflow-hidden rounded-xl mb-6 bg-zinc-900/50 border border-zinc-800">
                {/* مستطيل أحمر خلف الشعارات */}
                <div className="absolute left-1/2 -translate-x-1/2 top-7 w-[340px] max-w-[90%] h-12 rounded-lg bg-gradient-to-r from-red-900/70 via-red-700/60 to-red-600/60 opacity-70 z-0" />
                {/* أيقونات المارشال */}
                <div className="relative flex flex-wrap gap-2 justify-center px-4 z-10">
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
                    return <span key={type} className="text-3xl relative">{typeIcons[type] || '�'}</span>
                  })}
                </div>
              </div>
              {event.attendances.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  {language === "ar" ? "لا يوجد مارشالات مسجلين" : "No marshals registered yet"}
                </p>
              ) : (
                <div className="space-y-3">
                  {event.attendances.map((attendance) => (
                    <div
                      key={attendance.id}
                      className={`flex items-center justify-between bg-zinc-800/50 border rounded-xl p-4 ${
                        attendance.status === 'cancelled' 
                          ? 'border-red-600/50 bg-red-900/20' 
                          : 'border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {attendance.user.image ? (
                          <img
                            src={attendance.user.image}
                            alt={attendance.user.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-red-600"
                          />
                        ) : (
                          <div className="w-12 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-bold">
                            {attendance.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">{attendance.user.name}</p>
                          <p className="text-sm text-gray-400">{attendance.user.employeeId}</p>
                          {attendance.status === 'cancelled' && attendance.cancellationReason && (
                            <p className="text-xs text-red-400 mt-1">
                              {language === "ar" ? "سبب الإلغاء:" : "Cancelled:"} {attendance.cancellationReason}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          attendance.status === 'approved' 
                            ? 'bg-green-600/20 text-green-500' 
                            : attendance.status === 'pending'
                            ? 'bg-yellow-600/20 text-yellow-500'
                            : attendance.status === 'rejected'
                            ? 'bg-red-600/20 text-red-500'
                            : 'bg-gray-600/20 text-gray-500'
                        }`}>
                          {attendance.status === 'approved' 
                            ? (language === "ar" ? "مؤكد" : "Approved")
                            : attendance.status === 'pending'
                            ? (language === "ar" ? "في الانتظار" : "Pending")
                            : attendance.status === 'rejected'
                            ? (language === "ar" ? "مرفوض" : "Rejected")
                            : (language === "ar" ? "ملغي" : "Cancelled")
                          }
                        </span>
                        {attendance.status !== 'cancelled' && (
                          <button
                            onClick={() => {
                              setSelectedMarshalId(attendance.userId)
                              setShowRemoveMarshalModal(true)
                            }}
                            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-500 rounded-lg transition-all text-sm font-bold"
                          >
                            {language === "ar" ? "إزالة" : "Remove"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                📊 {language === "ar" ? "الإحصائيات" : "Statistics"}
              </h2>
              <div className="space-y-4">
                <div className="bg-green-600/10 border border-green-600/30 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">{language === "ar" ? "المسجلين" : "Registered"}</p>
                  <p className="text-green-500 font-bold text-3xl">{event._count.attendances}</p>
                </div>
                <div className="bg-blue-600/10 border border-blue-600/30 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">{language === "ar" ? "الحد الأقصى" : "Max Capacity"}</p>
                  <p className="text-blue-500 font-bold text-3xl">{event.maxMarshals}</p>
                </div>
                <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">{language === "ar" ? "المتبقي" : "Available"}</p>
                  <p className="text-yellow-500 font-bold text-3xl">{event.maxMarshals - event._count.attendances}</p>
                </div>
                <div className="bg-purple-600/10 border border-purple-600/30 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">{language === "ar" ? "تاريخ الإنشاء" : "Created"}</p>
                  <p className="text-purple-500 font-bold text-lg">
                    {new Date(event.createdAt).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-blue-600/50 rounded-2xl p-8 max-w-2xl w-full my-8"
          >
            <h3 className="text-2xl font-bold text-white mb-6">
              ✏️ {language === "ar" ? "تعديل الحدث" : "Edit Event"}
            </h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    {language === "ar" ? "العنوان (إنجليزي)" : "Title (English)"}
                  </label>
                  <input
                    type="text"
                    value={editForm.titleEn}
                    onChange={(e) => setEditForm({...editForm, titleEn: e.target.value})}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    {language === "ar" ? "العنوان (عربي)" : "Title (Arabic)"}
                  </label>
                  <input
                    type="text"
                    value={editForm.titleAr}
                    onChange={(e) => setEditForm({...editForm, titleAr: e.target.value})}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  {language === "ar" ? "الوصف (إنجليزي)" : "Description (English)"}
                </label>
                <textarea
                  value={editForm.descriptionEn}
                  onChange={(e) => setEditForm({...editForm, descriptionEn: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  {language === "ar" ? "الوصف (عربي)" : "Description (Arabic)"}
                </label>
                <textarea
                  value={editForm.descriptionAr}
                  onChange={(e) => setEditForm({...editForm, descriptionAr: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    {language === "ar" ? "تاريخ البداية" : "Start Date"}
                  </label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    {language === "ar" ? "تاريخ النهاية" : "End Date"}
                  </label>
                  <input
                    type="date"
                    value={editForm.endDate}
                    onChange={(e) => setEditForm({...editForm, endDate: e.target.value})}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    {language === "ar" ? "الموقع" : "Location"}
                  </label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    {language === "ar" ? "وقت البداية" : "Start Time"}
                  </label>
                  <input
                    type="time"
                    value={editForm.time}
                    onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    {language === "ar" ? "وقت النهاية" : "End Time"}
                  </label>
                  <input
                    type="time"
                    value={editForm.endTime}
                    onChange={(e) => setEditForm({...editForm, endTime: e.target.value})}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  {language === "ar" ? "أنواع المارشال المطلوبة" : "Required Marshal Types"}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    {value: 'karting', labelEn: 'Karting Marshal', labelAr: 'كارتينق مارشال', icon: '�️'},
                    {value: 'motocross', labelEn: 'Motocross Marshal', labelAr: 'موتوكروس مارشال', icon: '🏍️'},
                    {value: 'rescue', labelEn: 'Rescue Marshal', labelAr: 'إنقاذ مارشال', icon: '🚑'},
                    {value: 'circuit', labelEn: 'Circuit Marshal', labelAr: 'سيركت مارشال', icon: '�'},
                    {value: 'drift', labelEn: 'Drift Marshal', labelAr: 'دريفت مارشال', icon: '💨'},
                    {value: 'drag-race', labelEn: 'Drag Race Marshal', labelAr: 'دراق ريس مارشال', icon: '🚦'},
                    {value: 'pit', labelEn: 'Pit Marshal', labelAr: 'بت مارشال', icon: '🔧'}
                  ].map((type) => (
                    <label key={type.value} className="flex items-center gap-3 p-2 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors">
                      <input
                        type="checkbox"
                        checked={editForm.marshalTypes.includes(type.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditForm({...editForm, marshalTypes: [...editForm.marshalTypes, type.value]})
                          } else {
                            setEditForm({...editForm, marshalTypes: editForm.marshalTypes.filter(t => t !== type.value)})
                          }
                        }}
                        className="w-4 h-4 rounded border-zinc-600 text-blue-600 focus:ring-blue-600 focus:ring-offset-0"
                      />
                      <span className="text-base">{type.icon}</span>
                      <span className="text-white text-sm">
                        {language === "ar" ? type.labelAr : type.labelEn}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    {language === "ar" ? "الحد الأقصى" : "Max Marshals"}
                  </label>
                  <input
                    type="number"
                    value={editForm.maxMarshals}
                    onChange={(e) => setEditForm({...editForm, maxMarshals: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    {language === "ar" ? "الحالة" : "Status"}
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-blue-600 focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleEdit}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all"
              >
                {language === "ar" ? "حفظ" : "Save"}
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-all"
              >
                {language === "ar" ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-red-600/50 rounded-2xl p-8 max-w-md w-full"
          >
            <h3 className="text-2xl font-bold text-white mb-4">
              ⚠️ {language === "ar" ? "تأكيد الحذف" : "Confirm Delete"}
            </h3>
            <p className="text-gray-300 mb-6">
              {language === "ar" 
                ? `هل أنت متأكد من حذف الحدث "${event.titleAr}"؟ سيتم حذف جميع التسجيلات المرتبطة به.`
                : `Are you sure you want to delete "${event.titleEn}"? All registrations will be deleted.`
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all"
              >
                {language === "ar" ? "نعم، احذف" : "Yes, Delete"}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-all"
              >
                {language === "ar" ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Marshal Modal */}
      {showAddMarshalModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-green-600/50 rounded-2xl p-8 max-w-2xl w-full my-8 max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-2xl font-bold text-white mb-6">
              ➕ {language === "ar" ? "إضافة مارشال للفعالية" : "Add Marshal to Event"}
            </h3>
            
            <div className="mb-6">
              <p className="text-gray-300 mb-4">
                {language === "ar" 
                  ? "اختر مارشال من القائمة أدناه لإضافته إلى الفعالية:"
                  : "Select a marshal from the list below to add to the event:"
                }
              </p>
              
              {availableMarshals.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  {language === "ar" ? "لا يوجد مارشالات متاحين" : "No available marshals found"}
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {availableMarshals.map((marshal) => (
                    <div
                      key={marshal.id}
                      className={`flex items-center justify-between bg-zinc-800/50 border rounded-xl p-4 cursor-pointer transition-all ${
                        selectedMarshalToAdd === marshal.id 
                          ? 'border-green-600 bg-green-900/20' 
                          : 'border-zinc-700 hover:bg-zinc-800'
                      }`}
                      onClick={() => setSelectedMarshalToAdd(marshal.id)}
                    >
                      <div className="flex items-center gap-3">
                        {marshal.image ? (
                          <img
                            src={marshal.image}
                            alt={marshal.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-green-600"
                          />
                        ) : (
                          <div className="w-12 rounded-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-white font-bold">
                            {marshal.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">{marshal.name}</p>
                          <p className="text-sm text-gray-400">{marshal.employeeId}</p>
                          <p className="text-sm text-gray-400">{marshal.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {marshal.marshalTypes && (
                          <div className="flex flex-wrap gap-1">
                            {marshal.marshalTypes.split(',').filter((t: string) => t).slice(0, 2).map((type: string) => {
                              const typeIcons: Record<string, string> = {
                                'karting': '🏎️',
                                'motocross': '🏍️',
                                'rescue': '🚑',
                                'circuit': '🏁',
                                'drift': '💨',
                                'drag-race': '🚦',
                                'pit': '🔧'
                              }
                              return (
                                <span key={type} className="text-sm" title={type}>
                                  {typeIcons[type] || '�'}
                                </span>
                              )
                            })}
                          </div>
                        )}
                        <input
                          type="radio"
                          checked={selectedMarshalToAdd === marshal.id}
                          onChange={() => setSelectedMarshalToAdd(marshal.id)}
                          className="w-4 h-4 text-green-600 focus:ring-green-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleAddMarshal}
                disabled={!selectedMarshalToAdd}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-xl font-bold transition-all disabled:cursor-not-allowed"
              >
                {language === "ar" ? "إضافة المارشال" : "Add Marshal"}
              </button>
              <button
                onClick={() => {
                  setShowAddMarshalModal(false)
                  setSelectedMarshalToAdd(null)
                  setAvailableMarshals([])
                }}
                className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-all"
              >
                {language === "ar" ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Remove Marshal Modal */}
      {showRemoveMarshalModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-yellow-600/50 rounded-2xl p-8 max-w-md w-full"
          >
            <h3 className="text-2xl font-bold text-white mb-4">
              ⚠️ {language === "ar" ? "تأكيد الإزالة" : "Confirm Removal"}
            </h3>
            <p className="text-gray-300 mb-4">
              {language === "ar" 
                ? "هل أنت متأكد من إلغاء تسجيل هذا المارشال من الحدث؟"
                : "Are you sure you want to remove this marshal from the event?"
              }
            </p>
            
            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">
                {language === "ar" ? "سبب الإزالة (اختياري)" : "Removal Reason (Optional)"}
              </label>
              <textarea
                value={removalReason}
                onChange={(e) => setRemovalReason(e.target.value)}
                placeholder={language === "ar" ? "أدخل سبب الإزالة..." : "Enter removal reason..."}
                rows={3}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-yellow-600 focus:outline-none resize-none"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleRemoveMarshal}
                className="flex-1 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-bold transition-all"
              >
                {language === "ar" ? "نعم، أزل" : "Yes, Remove"}
              </button>
              <button
                onClick={() => {
                  setShowRemoveMarshalModal(false)
                  setSelectedMarshalId(null)
                  setRemovalReason("")
                }}
                className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-all"
              >
                {language === "ar" ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
