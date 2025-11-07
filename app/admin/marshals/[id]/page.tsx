"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { motion } from "framer-motion"
import Link from "next/link"

interface Marshal {
  id: string
  employeeId: string
  name: string
  email: string
  phone: string
  civilId: string
  dateOfBirth: string
  nationality: string | null
  image: string | null
  isActive: boolean
  marshalTypes: string
  createdAt: string
  _count: {
    attendances: number
  }
}

export default function MarshalDetails() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const { language } = useLanguage()
  const [marshal, setMarshal] = useState<Marshal | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [marshalId, setMarshalId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    nationality: "",
    employeeId: "",
    marshalTypes: [] as string[]
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard")
    }
  }, [status, session, router])

  useEffect(() => {
    if (params.id) {
      setMarshalId(params.id as string)
    }
  }, [params])

  useEffect(() => {
    if (session?.user?.role === "admin" && marshalId) {
      fetchMarshal()
    }
  }, [session, marshalId])

  const fetchMarshal = async () => {
    if (!marshalId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/marshals/${marshalId}`)
      if (res.ok) {
        const data = await res.json()
        setMarshal(data)
        setEditForm({
          name: data.name,
          email: data.email,
          phone: data.phone,
          nationality: data.nationality || "",
          employeeId: data.employeeId || "",
          marshalTypes: data.marshalTypes ? data.marshalTypes.split(',').filter((t: string) => t) : []
        })
      } else {
        router.push("/admin/marshals")
      }
    } catch (error) {
      console.error("Error fetching marshal:", error)
      router.push("/admin/marshals")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!marshal) return
    try {
      const res = await fetch(`/api/admin/marshals/${marshal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !marshal.isActive })
      })
      if (res.ok) {
        fetchMarshal()
      }
    } catch (error) {
      console.error("Error toggling status:", error)
    }
  }

  const handleDelete = async () => {
    if (!marshal) return
    try {
      const res = await fetch(`/api/admin/marshals/${marshal.id}`, {
        method: "DELETE"
      })
      if (res.ok) {
        router.push("/admin/marshals")
      }
    } catch (error) {
      console.error("Error deleting marshal:", error)
    }
  }

  const handleEdit = async () => {
    if (!marshal) return
    try {
      const res = await fetch(`/api/admin/marshals/${marshal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          marshalTypes: editForm.marshalTypes.join(',')
        })
      })
      if (res.ok) {
        setShowEditModal(false)
        fetchMarshal()
      }
    } catch (error) {
      console.error("Error updating marshal:", error)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session || session.user.role !== "admin" || !marshal) return null

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
              href="/admin/marshals"
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
            <h1 className="text-3xl font-bold text-white">
              👤 {language === "ar" ? "تفاصيل المارشال" : "Marshal Details"}
            </h1>
            <div className="flex gap-3">
              <button
                onClick={handleToggleStatus}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  marshal.isActive
                    ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {marshal.isActive 
                  ? (language === "ar" ? "⏸️ إيقاف" : "⏸️ Suspend")
                  : (language === "ar" ? "▶️ تفعيل" : "▶️ Activate")
                }
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

          {/* Status Badge */}
          <div className="mb-6">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
              marshal.isActive 
                ? "bg-green-600/20 text-green-500 border border-green-600/50"
                : "bg-red-600/20 text-red-500 border border-red-600/50"
            }`}>
              {marshal.isActive ? "✅" : "⏸️"}
              {marshal.isActive 
                ? (language === "ar" ? "نشط" : "Active")
                : (language === "ar" ? "موقوف" : "Suspended")
              }
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                {language === "ar" ? "صورة الملف الشخصي" : "Profile Picture"}
              </h2>
              <div className="aspect-square rounded-xl overflow-hidden bg-zinc-800 flex items-center justify-center">
                {marshal.image ? (
                  <img
                    src={marshal.image}
                    alt={marshal.name}
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => window.open(marshal.image!, "_blank")}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-600 to-red-800">
                    <span className="text-8xl font-bold text-white">
                      {marshal.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              {marshal.image && (
                <p className="text-center text-sm text-gray-400 mt-3">
                  {language === "ar" ? "اضغط للعرض بالحجم الكامل" : "Click to view full size"}
                </p>
              )}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Personal Info */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                📋 {language === "ar" ? "المعلومات الشخصية" : "Personal Information"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">{language === "ar" ? "الاسم" : "Name"}</p>
                  <p className="text-white font-medium text-lg">{marshal.name}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">{language === "ar" ? "رقم المارشال" : "Marshal Number"}</p>
                  <p className="text-white font-medium text-lg">{marshal.employeeId}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">{language === "ar" ? "الرقم المدني" : "Civil ID"}</p>
                  <p className="text-white font-medium text-lg">{marshal.civilId}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">{language === "ar" ? "تاريخ الميلاد" : "Date of Birth"}</p>
                  <p className="text-white font-medium text-lg">
                    {new Date(marshal.dateOfBirth).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}
                  </p>
                </div>
                {marshal.nationality && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">{language === "ar" ? "الجنسية" : "Nationality"}</p>
                    <p className="text-white font-medium text-lg">{marshal.nationality}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Marshal Types */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                🏁 {language === "ar" ? "أنواع الوظائف" : "Marshal Job Types"}
              </h2>
              <div className="flex flex-wrap gap-3">
                {marshal.marshalTypes && marshal.marshalTypes.split(',').filter(t => t).length > 0 ? (
                  marshal.marshalTypes.split(',').filter(t => t).map((type) => {
                    const typeLabels: Record<string, {en: string, ar: string, icon: string, color: string}> = {
                      'drag-race': {en: 'Drag Race Marshal', ar: 'دراق ريس مارشال', icon: '🏁', color: 'bg-red-600'},
                      'motocross': {en: 'Motocross Marshal', ar: 'موتور كروس مارشال', icon: '🏍️', color: 'bg-orange-600'},
                      'karting': {en: 'Karting Marshal', ar: 'كارتينق مارشال', icon: '🏎️', color: 'bg-yellow-600'},
                      'drift': {en: 'Drift Marshal', ar: 'دريفت مارشال', icon: '💨', color: 'bg-purple-600'},
                      'circuit': {en: 'Circuit Marshal', ar: 'سيركت مارشال', icon: '🏁', color: 'bg-blue-600'},
                      'rescue': {en: 'Rescue Marshal', ar: 'ريسك يو مارشال', icon: '🚑', color: 'bg-green-600'}
                    }
                    const label = typeLabels[type]
                    if (!label) return null
                    return (
                      <span 
                        key={type}
                        className={`${label.color} text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2`}
                      >
                        <span>{label.icon}</span>
                        <span>{language === "ar" ? label.ar : label.en}</span>
                      </span>
                    )
                  })
                ) : (
                  <p className="text-gray-400">
                    {language === "ar" ? "لم يتم تحديد أنواع وظائف" : "No job types assigned"}
                  </p>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                📞 {language === "ar" ? "معلومات الاتصال" : "Contact Information"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">{language === "ar" ? "البريد الإلكتروني" : "Email"}</p>
                  <p className="text-white font-medium text-lg">{marshal.email}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">{language === "ar" ? "رقم الهاتف" : "Phone"}</p>
                  <p className="text-white font-medium text-lg">{marshal.phone}</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                📊 {language === "ar" ? "الإحصائيات" : "Statistics"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-600/10 border border-green-600/30 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">{language === "ar" ? "إجمالي الحضور" : "Total Attendance"}</p>
                  <p className="text-green-500 font-bold text-3xl">{marshal._count.attendances}</p>
                </div>
                <div className="bg-blue-600/10 border border-blue-600/30 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">{language === "ar" ? "تاريخ التسجيل" : "Registered"}</p>
                  <p className="text-blue-500 font-bold text-lg">
                    {new Date(marshal.createdAt).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

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
                ? `هل أنت متأكد من حذف المارشال "${marshal.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`
                : `Are you sure you want to delete marshal "${marshal.name}"? This action cannot be undone.`
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

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-blue-600/50 rounded-2xl p-6 max-w-2xl w-full my-8"
          >
            <h3 className="text-2xl font-bold text-white mb-6">
              ✏️ {language === "ar" ? "تعديل البيانات" : "Edit Information"}
            </h3>
            <div className="max-h-[70vh] overflow-y-auto px-2">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      {language === "ar" ? "الاسم" : "Name"}
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      {language === "ar" ? "البريد الإلكتروني" : "Email"}
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      {language === "ar" ? "رقم الهاتف" : "Phone"}
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      {language === "ar" ? "الجنسية" : "Nationality"}
                    </label>
                    <input
                      type="text"
                      value={editForm.nationality}
                      onChange={(e) => setEditForm({...editForm, nationality: e.target.value})}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-400 text-sm mb-2">
                      🏷️ {language === "ar" ? "الرقم الوظيفي" : "Employee ID"}
                    </label>
                    <input
                      type="text"
                      value={editForm.employeeId}
                      onChange={(e) => setEditForm({...editForm, employeeId: e.target.value})}
                      placeholder="KMT-100"
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-blue-600 focus:outline-none font-mono"
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      {language === "ar" ? "مثال: KMT-100, KMT-101, KMT-102..." : "Example: KMT-100, KMT-101, KMT-102..."}
                    </p>
                  </div>
                </div>

                {/* Marshal Types */}
                <div>
                  <label className="block text-gray-400 text-sm mb-3 font-semibold">
                    {language === "ar" ? "أنواع الوظائف" : "Marshal Job Types"}
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      {value: 'drag-race', labelEn: 'Drag Race Marshal', labelAr: 'دراق ريس مارشال', icon: '🏁'},
                      {value: 'motocross', labelEn: 'Motocross Marshal', labelAr: 'موتور كروس مارشال', icon: '🏍️'},
                      {value: 'karting', labelEn: 'Karting Marshal', labelAr: 'كارتينق مارشال', icon: '🏎️'},
                      {value: 'drift', labelEn: 'Drift Marshal', labelAr: 'دريفت مارشال', icon: '💨'},
                      {value: 'circuit', labelEn: 'Circuit Marshal', labelAr: 'سيركت مارشال', icon: '🏁'},
                      {value: 'rescue', labelEn: 'Rescue Marshal', labelAr: 'ريسك يو مارشال', icon: '🚑'}
                    ].map((type) => (
                      <label key={type.value} className="flex items-center gap-2 p-2 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors">
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
    </div>
  )
}
