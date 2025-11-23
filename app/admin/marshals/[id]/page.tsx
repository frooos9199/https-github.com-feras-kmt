// سطر جديد للتجربة
// تعديل تجريبي للتأكد من وصول التعديلات إلى Vercel
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

  if (!session || session.user.role !== "admin" || !marshal) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      {/* صورة الهيدر خلف الشعارات */}
      <div className="relative w-full flex items-center justify-center h-32 overflow-hidden">
        <div className="absolute inset-0 w-full h-full z-0">
          <div
            style={{
              backgroundImage: 'url(/test.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              width: '100%',
              height: '100%',
              position: 'absolute',
              inset: 0
            }}
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        {/* أيقونات المارشال */}
        <div className="relative flex flex-wrap gap-2 justify-center px-4 z-10">
          {marshal?.marshalTypes && marshal.marshalTypes.split(',').filter(t => t).map((type) => {
            const typeIcons: Record<string, string> = {
              'drag-race': '🏁',
              'motocross': '🏍️',
              'karting': '🏎️',
              'drift': '💨',
              'circuit': '🏁',
              'rescue': '🚑'
            }
            return <span key={type} className="text-3xl">{typeIcons[type] || '�'}</span>
          })}
        </div>
      </div>
      {/* باقي الصفحة */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ...existing code... */}

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
