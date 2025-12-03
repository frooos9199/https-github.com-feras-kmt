// محاولة إعادة نشر الكود على Vercel
// إعادة محاولة نشر الكود - اختبار Vercel
"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
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
  createdAt: string
  isActive: boolean
  marshalTypes?: string | null // إضافة هذا السطر
  _count: {
    attendances: number
  }
}

const MARSHAL_TYPES = [
  { value: "karting", label: { ar: "كارتنج", en: "Karting" }, color: "bg-yellow-500", icon: "🏎️" },
  { value: "motocross", label: { ar: "موتوكروس", en: "Motocross" }, color: "bg-orange-600", icon: "🏍️" },
  { value: "rescue", label: { ar: "إنقاذ", en: "Rescue" }, color: "bg-red-700", icon: "🚑" },
  { value: "circuit", label: { ar: "حلبة", en: "Circuit" }, color: "bg-blue-700", icon: "🏁" },
  { value: "drift", label: { ar: "دريفت", en: "Drift" }, color: "bg-purple-700", icon: "💨" },
  { value: "drag-race", label: { ar: "سباق الدراج", en: "Drag Race" }, color: "bg-pink-600", icon: "🚦" },
  { value: "recovery", label: { ar: "الإخلاء", en: "Recovery" }, color: "bg-green-700", icon: "🚚" },
  { value: "grid", label: { ar: "شبكة الانطلاق", en: "Grid" }, color: "bg-gray-700", icon: "🔢" },
  { value: "pit", label: { ar: "منطقة الصيانة", en: "Pit" }, color: "bg-teal-700", icon: "🛠️" },
]

export default function MarshalsManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { language } = useLanguage()
  const [marshals, setMarshals] = useState<Marshal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard")
    }
  }, [status, session, router])


  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchMarshals();
      // إعادة جلب البيانات عند العودة من صفحة التفاصيل
      const handleVisibility = () => {
        if (document.visibilityState === "visible") {
          fetchMarshals();
        }
      };
      document.addEventListener("visibilitychange", handleVisibility);
      return () => {
        document.removeEventListener("visibilitychange", handleVisibility);
      };
    }
  }, [session]);

  const fetchMarshals = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/marshals")
      const data = await res.json()
      setMarshals(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching marshals:", error)
      setMarshals([])
    } finally {
      setLoading(false)
    }
  }

  const filteredMarshals = Array.isArray(marshals) ? marshals.filter(marshal =>
    marshal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    marshal.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    marshal.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    marshal.civilId.toLowerCase().includes(searchTerm.toLowerCase())
  ) : []

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session || session.user.role !== "admin") return null

  const isArabic = language === "ar";
  return (
    <div className={`min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black${isArabic ? ' rtl' : ''}`} dir={isArabic ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-lg border-b border-red-600/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between h-16${isArabic ? ' flex-row-reverse' : ''}`}>
            <Link href="/admin" className="flex items-center gap-3">
              <img src="/kmt-logo-main.png" alt="KMT" className="h-12 w-auto rounded px-2 py-1" />
              <span className="text-yellow-500 font-bold text-sm">👑 ADMIN</span>
            </Link>
            <Link
              href="/admin"
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isArabic ? "العودة →" : "← Back"}
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
          <h1 className={`text-3xl font-bold text-white mb-2${isArabic ? ' text-right' : ''}`}>
            👥 {isArabic ? "إدارة المارشال" : "Marshals Management"}
          </h1>
          <p className={`text-gray-400${isArabic ? ' text-right' : ''}`}>
            {isArabic ? "إدارة المارشال" : "Marshal Management"}
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <input
            type="text"
            placeholder={isArabic ? "بحث بالاسم، البريد، الرقم الوظيفي أو الرقم المدني..." : "Search by name, email, employee ID or civil ID..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full px-6 py-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder-gray-500 focus:border-red-600 focus:outline-none${isArabic ? ' text-right' : ''}`}
          />
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-8${isArabic ? ' text-right' : ''}`}
        >
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <span className="text-3xl">👥</span>
              <div className={`text-right`}>
                <p className="text-gray-400 text-sm">{isArabic ? "إجمالي المارشالات" : "Total Marshals"}</p>
                <p className="text-3xl font-bold text-white">{marshals.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <span className="text-3xl">✅</span>
              <div className={`text-right`}>
                <p className="text-gray-400 text-sm">{isArabic ? "المسجلين حالياً" : "Active Today"}</p>
                <p className="text-3xl font-bold text-white">{filteredMarshals.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <span className="text-3xl">🏁</span>
              <div className={`text-right`}>
                <p className="text-gray-400 text-sm">{isArabic ? "إجمالي الحضور" : "Total Attendance"}</p>
                <p className="text-3xl font-bold text-white">
                  {marshals.reduce((sum, m) => sum + m._count.attendances, 0)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Marshals List */}
        {filteredMarshals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-12 text-center"
          >
            <p className="text-gray-400 text-lg">
              {isArabic ? "لا توجد نتائج" : "No results found"}
            </p>
          </motion.div>
        ) : (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" dir={isArabic ? "rtl" : "ltr"}>
                <thead className="bg-zinc-800/50">
                  <tr>
                    <th className={`px-6 py-4 ${isArabic ? 'text-right' : 'text-left'} text-sm font-bold text-gray-400`}>
                      {isArabic ? "المارشال" : "Marshal"}
                    </th>
                    <th className={`px-6 py-4 ${isArabic ? 'text-right' : 'text-left'} text-sm font-bold text-gray-400`}>
                      {isArabic ? "معلومات الاتصال" : "Contact"}
                    </th>
                    <th className={`px-6 py-4 ${isArabic ? 'text-right' : 'text-left'} text-sm font-bold text-gray-400`}>
                      {isArabic ? "البيانات الشخصية" : "Personal Info"}
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-400">
                      {isArabic ? "الحالة" : "Status"}
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-400">
                      {isArabic ? "الحضور" : "Attendance"}
                    </th>
                    <th className={`px-6 py-4 ${isArabic ? 'text-right' : 'text-left'} text-sm font-bold text-gray-400`}>
                      {isArabic ? "تاريخ التسجيل" : "Registered"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {filteredMarshals.map((marshal, index) => (
                    <motion.tr
                      key={marshal.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => {
                        router.push(`/admin/marshals/${marshal.id}`)
                      }}
                      className={`hover:bg-zinc-800/30 transition-colors cursor-pointer${isArabic ? ' text-right' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {marshal.image ? (
                            <img 
                              src={marshal.image} 
                              alt={marshal.name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-red-600"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-bold">
                              {marshal.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-white font-medium">{marshal.name}</p>
                            <p className="text-xs text-gray-500">{marshal.employeeId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-300">{marshal.email}</p>
                          <p className="text-gray-400">{marshal.phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-300">🆔 {marshal.civilId}</p>
                          <p className="text-gray-400">
                            📅 {new Date(marshal.dateOfBirth).toLocaleDateString(isArabic ? "ar-EG" : "en-US")}
                          </p>
                          {marshal.nationality && (
                            <p className="text-gray-400">🌍 {marshal.nationality}</p>
                          )}
                        </div>
                      </td>
                      {/* الحالة */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full font-bold text-sm ${marshal.isActive ? 'bg-green-600/20 text-green-600 border border-green-600' : 'bg-red-600/20 text-red-600 border border-red-600'}`}>
                          {marshal.isActive ? (isArabic ? 'نشط' : 'Active') : (isArabic ? 'موقوف' : 'Inactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-600/20 text-green-500 font-bold">
                          {marshal._count.attendances}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-400">
                          {new Date(marshal.createdAt).toLocaleDateString(isArabic ? "ar-EG" : "en-US")}
                        </p>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ...تم حذف قسم أنواع الوظائف أسفل الجدول... */}
      </main>
    </div>
  )
}
