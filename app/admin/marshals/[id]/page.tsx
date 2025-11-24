"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { motion } from "framer-motion"

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
  licenseFrontImage: string | null
  licenseBackImage: string | null
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
  const [uploadingLicenseFront, setUploadingLicenseFront] = useState(false)
  const [uploadingLicenseBack, setUploadingLicenseBack] = useState(false)
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
      console.log('MarshalDetails: params.id =', params.id)
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
      console.log('MarshalDetails: fetching /api/admin/marshals/' + marshalId)
      const res = await fetch(`/api/admin/marshals/${marshalId}`)
      if (res.ok) {
        const data = await res.json()
        console.log('MarshalDetails: fetched data =', data)
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
        console.warn('MarshalDetails: API returned status', res.status)
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

  const handleLicenseFrontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !marshal) return

    if (!file.type.startsWith("image/")) {
      alert(language === "ar" ? "الرجاء اختيار صورة فقط" : "Please select an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(language === "ar" ? "حجم الصورة يجب أن يكون أقل من 5 ميجابايت" : "Image size must be less than 5MB")
      return
    }

    setUploadingLicenseFront(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("imageType", "licenseFront")
      formData.append("userId", marshal.id)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      })

      if (res.ok) {
        alert(language === "ar" ? "تم رفع صورة الرخصة (الأمام) بنجاح!" : "License front image uploaded successfully!")
        fetchMarshal()
      } else {
        const data = await res.json()
        alert(data.error || (language === "ar" ? "فشل رفع صورة الرخصة" : "Failed to upload license image"))
      }
    } catch (error) {
      console.error("Error uploading license front:", error)
      alert(language === "ar" ? "حدث خطأ أثناء رفع صورة الرخصة" : "An error occurred while uploading")
    } finally {
      setUploadingLicenseFront(false)
    }
  }

  const handleLicenseBackUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !marshal) return

    if (!file.type.startsWith("image/")) {
      alert(language === "ar" ? "الرجاء اختيار صورة فقط" : "Please select an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(language === "ar" ? "حجم الصورة يجب أن يكون أقل من 5 ميجابايت" : "Image size must be less than 5MB")
      return
    }

    setUploadingLicenseBack(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("imageType", "licenseBack")
      formData.append("userId", marshal.id)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      })

      if (res.ok) {
        alert(language === "ar" ? "تم رفع صورة الرخصة (الخلف) بنجاح!" : "License back image uploaded successfully!")
        fetchMarshal()
      } else {
        const data = await res.json()
        alert(data.error || (language === "ar" ? "فشل رفع صورة الرخصة" : "Failed to upload license image"))
      }
    } catch (error) {
      console.error("Error uploading license back:", error)
      alert(language === "ar" ? "حدث خطأ أثناء رفع صورة الرخصة" : "An error occurred while uploading")
    } finally {
      setUploadingLicenseBack(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session || session.user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black">
        <div className="bg-zinc-900/70 border border-yellow-600/40 rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">⚠️ {language === "ar" ? "يجب تسجيل الدخول كأدمن" : "Admin login required"}</h2>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-bold transition-all"
          >
            {language === "ar" ? "تسجيل الدخول" : "Login"}
          </button>
        </div>
      </div>
    )
  }

  if (!marshal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black">
        <div className="bg-zinc-900/70 border border-red-600/40 rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">⚠️ {language === "ar" ? "لا يوجد بيانات لهذا المارشال" : "No marshal data found"}</h2>
          <p className="text-gray-400 mb-6">{language === "ar" ? "تأكد من صحة الرابط أو الرجوع لقائمة المارشالات." : "Check the URL or return to the marshals list."}</p>
          <button
            onClick={() => router.push("/admin/marshals")}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all"
          >
            {language === "ar" ? "العودة لقائمة المارشالات" : "Back to Marshals List"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* تصميم عصري لعرض بيانات المارشال مع زر تفعيل/إيقاف وأنواع الوظائف */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-8 max-w-3xl mx-auto mt-8 shadow-lg">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* صورة الملف الشخصي */}
            <div className="flex-shrink-0">
              {marshal.image ? (
                <img src={marshal.image} alt={marshal.name} className="w-32 h-32 rounded-full object-cover border-4 border-red-600 shadow" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-4xl text-white font-bold">
                  {marshal.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {/* بيانات أساسية وزر */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-4 mb-2">
                <h2 className="text-2xl font-bold text-white">{marshal.name}</h2>
                <button
                  onClick={handleToggleStatus}
                  className={`px-4 py-2 rounded-lg font-bold transition-all text-sm shadow ${marshal.isActive ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                >
                  {marshal.isActive ? '⏸️ إيقاف' : '▶️ تفعيل'}
                </button>
              </div>
              <div className="text-gray-400 text-sm">{marshal.employeeId}</div>
              <div className="text-gray-300">{marshal.email}</div>
              <div className="text-gray-300">{marshal.phone}</div>
              <div className="text-gray-400 text-sm">🆔 {marshal.civilId}</div>
              <div className="text-gray-400 text-sm">📅 {new Date(marshal.dateOfBirth).toLocaleDateString('ar-EG')}</div>
              <div className="text-gray-400 text-sm">🌍 {marshal.nationality || '-'}</div>
              {/* أنواع الوظائف */}
              <div className="flex flex-wrap gap-2 mt-2">
                {marshal.marshalTypes && marshal.marshalTypes.split(',').filter(t => t).length > 0 ? (
                  marshal.marshalTypes.split(',').filter(t => t).map((type) => {
                    const typeIcons: Record<string, string> = {
                      'drag-race': '🏁',
                      'motocross': '🏍️',
                      'karting': '�️',
                      'drift': '💨',
                      'circuit': '🏁',
                      'rescue': '🚑'
                    };
                    const typeLabels: Record<string, string> = {
                      'drag-race': 'دراق ريس',
                      'motocross': 'موتوكروس',
                      'karting': 'كارتينج',
                      'drift': 'دريفت',
                      'circuit': 'سيركت',
                      'rescue': 'ريسكيو'
                    };
                    return (
                      <span key={type} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-800 text-white text-xs font-bold border border-zinc-700">
                        <span>{typeIcons[type] || '🏁'}</span>
                        <span>{typeLabels[type] || type}</span>
                      </span>
                    )
                  })
                ) : (
                  <span className="text-gray-500 text-xs">لا يوجد أنواع وظائف</span>
                )}
              </div>
              <div className="text-gray-400 text-sm mt-2">الحالة: <span className={marshal.isActive ? 'text-green-500' : 'text-red-500'}>{marshal.isActive ? 'نشط' : 'موقوف'}</span></div>
              <div className="text-gray-400 text-sm">عدد الحضور: <span className="text-white font-bold">{marshal._count.attendances}</span></div>
              <div className="text-gray-400 text-sm">تاريخ التسجيل: {new Date(marshal.createdAt).toLocaleDateString('ar-EG')}</div>
            </div>
          </div>
          {/* رخص القيادة */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">رخصة القيادة (أمام)</h3>
              {marshal.licenseFrontImage ? (
                <img src={marshal.licenseFrontImage} alt="license front" className="w-full h-40 object-cover rounded-lg border-2 border-zinc-700" />
              ) : (
                <div className="h-40 flex items-center justify-center bg-zinc-800 text-gray-500 rounded-lg">لا يوجد صورة</div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">رخصة القيادة (خلف)</h3>
              {marshal.licenseBackImage ? (
                <img src={marshal.licenseBackImage} alt="license back" className="w-full h-40 object-cover rounded-lg border-2 border-zinc-700" />
              ) : (
                <div className="h-40 flex items-center justify-center bg-zinc-800 text-gray-500 rounded-lg">لا يوجد صورة</div>
              )}
            </div>
          </div>
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


