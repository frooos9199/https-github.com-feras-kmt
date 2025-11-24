"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { motion } from "framer-motion"

interface MarshalProfile {
  id: string
  employeeId: string
  name: string
  email: string
  phone: string | null
  civilId: string | null
  dateOfBirth: string | null
  nationality: string | null
  image: string | null
  licenseFrontImage: string | null
  licenseBackImage: string | null
  isActive: boolean
  marshalTypes: string | null
  createdAt: string
  _count?: { attendances: number }
}

export default function AdminMarshalProfile() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const { language } = useLanguage()
  const [profile, setProfile] = useState<MarshalProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingLicenseFront, setUploadingLicenseFront] = useState(false)
  const [uploadingLicenseBack, setUploadingLicenseBack] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    civilId: "",
    dateOfBirth: "",
    nationality: "",
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
      fetchMarshalProfile(params.id as string)
    }
  }, [params])

  const fetchMarshalProfile = async (id: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/marshals/${id}`)
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        setFormData({
          name: data.name || "",
          phone: data.phone || "",
          civilId: data.civilId || "",
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : "",
          nationality: data.nationality || "",
        })
      } else {
        router.push("/admin/marshals")
      }
    } catch (error) {
      router.push("/admin/marshals")
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: language === "ar" ? "الرجاء اختيار صورة فقط" : "Please select an image file" })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: language === "ar" ? "حجم الصورة يجب أن يكون أقل من 5 ميجابايت" : "Image size must be less than 5MB" })
      return
    }
    setUploading(true)
    setMessage(null)
    try {
      const formDataObj = new FormData()
      formDataObj.append("file", file)
      formDataObj.append("userId", profile.id)
      const res = await fetch("/api/upload", { method: "POST", body: formDataObj })
      const data = await res.json()
      if (res.ok) {
        setMessage({ type: "success", text: language === "ar" ? "تم رفع الصورة بنجاح!" : "Image uploaded successfully!" })
        fetchMarshalProfile(profile.id)
      } else {
        setMessage({ type: "error", text: data.error || (language === "ar" ? "فشل رفع الصورة" : "Failed to upload image") })
      }
    } catch (error) {
      setMessage({ type: "error", text: language === "ar" ? "حدث خطأ أثناء رفع الصورة" : "An error occurred while uploading" })
    } finally {
      setUploading(false)
    }
  }

  const handleLicenseFrontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: language === "ar" ? "الرجاء اختيار صورة فقط" : "Please select an image file" })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: language === "ar" ? "حجم الصورة يجب أن يكون أقل من 5 ميجابايت" : "Image size must be less than 5MB" })
      return
    }
    setUploadingLicenseFront(true)
    setMessage(null)
    try {
      const formDataObj = new FormData()
      formDataObj.append("file", file)
      formDataObj.append("imageType", "licenseFront")
      formDataObj.append("userId", profile.id)
      const res = await fetch("/api/upload", { method: "POST", body: formDataObj })
      const data = await res.json()
      if (res.ok) {
        setMessage({ type: "success", text: language === "ar" ? "تم رفع صورة الرخصة (الأمام) بنجاح!" : "License front image uploaded successfully!" })
        fetchMarshalProfile(profile.id)
      } else {
        setMessage({ type: "error", text: data.error || (language === "ar" ? "فشل رفع صورة الرخصة" : "Failed to upload license image") })
      }
    } catch (error) {
      setMessage({ type: "error", text: language === "ar" ? "حدث خطأ أثناء رفع صورة الرخصة" : "An error occurred while uploading" })
    } finally {
      setUploadingLicenseFront(false)
    }
  }

  const handleLicenseBackUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: language === "ar" ? "الرجاء اختيار صورة فقط" : "Please select an image file" })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: language === "ar" ? "حجم الصورة يجب أن يكون أقل من 5 ميجابايت" : "Image size must be less than 5MB" })
      return
    }
    setUploadingLicenseBack(true)
    setMessage(null)
    try {
      const formDataObj = new FormData()
      formDataObj.append("file", file)
      formDataObj.append("imageType", "licenseBack")
      formDataObj.append("userId", profile.id)
      const res = await fetch("/api/upload", { method: "POST", body: formDataObj })
      const data = await res.json()
      if (res.ok) {
        setMessage({ type: "success", text: language === "ar" ? "تم رفع صورة الرخصة (الخلف) بنجاح!" : "License back image uploaded successfully!" })
        fetchMarshalProfile(profile.id)
      } else {
        setMessage({ type: "error", text: data.error || (language === "ar" ? "فشل رفع صورة الرخصة" : "Failed to upload license image") })
      }
    } catch (error) {
      setMessage({ type: "error", text: language === "ar" ? "حدث خطأ أثناء رفع صورة الرخصة" : "An error occurred while uploading" })
    } finally {
      setUploadingLicenseBack(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    setMessage(null)
    try {
      const updateData: any = {
        name: formData.name,
        phone: formData.phone,
        civilId: formData.civilId,
        dateOfBirth: formData.dateOfBirth,
        nationality: formData.nationality,
      }
      const res = await fetch(`/api/admin/marshals/${profile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
      })
      const data = await res.json()
      if (res.ok) {
        setProfile(data)
        setFormData({
          name: data.name || "",
          phone: data.phone || "",
          civilId: data.civilId || "",
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : "",
          nationality: data.nationality || "",
        })
        setShowEdit(false)
        setMessage({ type: "success", text: language === "ar" ? "تم تحديث البيانات بنجاح!" : "Profile updated successfully!" })
      } else {
        setMessage({ type: "error", text: data.error || (language === "ar" ? "حدث خطأ" : "An error occurred") })
      }
    } catch (error) {
      setMessage({ type: "error", text: language === "ar" ? "حدث خطأ في التحديث" : "Update failed" })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!profile) return
    if (!confirm(language === "ar" ? "هل أنت متأكد من حذف هذا المارشال؟" : "Are you sure you want to delete this marshal?")) return
    try {
      const res = await fetch(`/api/admin/marshals/${profile.id}`, { method: "DELETE" })
      if (res.ok) {
        router.push("/admin/marshals")
      } else {
        setMessage({ type: "error", text: language === "ar" ? "فشل الحذف" : "Delete failed" })
      }
    } catch (error) {
      setMessage({ type: "error", text: language === "ar" ? "حدث خطأ أثناء الحذف" : "Delete error" })
    }
  }

  const handleToggleStatus = async () => {
    if (!profile) return
    try {
      const res = await fetch(`/api/admin/marshals/${profile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !profile.isActive })
      })
      if (res.ok) {
        fetchMarshalProfile(profile.id)
      } else {
        setMessage({ type: "error", text: language === "ar" ? "فشل تغيير الحالة" : "Status change failed" })
      }
    } catch (error) {
      setMessage({ type: "error", text: language === "ar" ? "حدث خطأ أثناء تغيير الحالة" : "Status change error" })
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session || session.user.role !== "admin" || !profile) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">👤 {language === "ar" ? "بيانات المارشال" : "Marshal Profile"}</h1>
          <p className="text-gray-400">{language === "ar" ? "إدارة بيانات المارشال" : "Manage marshal information"}</p>
        </motion.div>

        {/* Message Alert */}
        {message && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`mb-6 p-4 rounded-lg ${message.type === "success" ? "bg-green-600/20 border border-green-600/30 text-green-500" : "bg-red-600/20 border border-red-600/30 text-red-500"}`}>{message.text}</motion.div>
        )}

        {/* أزرار الأدمن */}
        <div className="flex flex-row-reverse gap-4 mb-8">
          <button onClick={() => setShowEdit(true)} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all text-base shadow-md">✏️ {language === "ar" ? "تعديل" : "Edit"}</button>
          <button onClick={handleToggleStatus} className={`px-5 py-2 rounded-xl font-bold transition-all text-base shadow-md ${profile.isActive ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}>{profile.isActive ? (language === "ar" ? '⏸️ إيقاف' : 'Deactivate') : (language === "ar" ? '▶️ تفعيل' : 'Activate')}</button>
          <button onClick={handleDelete} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all text-base shadow-md">🗑️ {language === "ar" ? "حذف" : "Delete"}</button>
        </div>

        {/* عرض البيانات أو نموذج التعديل */}
        {!showEdit ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="p-6 space-y-6">
              {/* صورة الملف الشخصي */}
              <div className="flex justify-center">
                <div className="relative">
                  {profile.image ? (
                    <img src={profile.image} alt={profile.name} className="w-32 h-32 rounded-full object-cover border-4 border-red-600" />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white text-4xl font-bold">{profile.name.charAt(0).toUpperCase()}</div>
                  )}
                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-700 transition-colors">
                    {uploading ? (<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />) : (<span className="text-xl">📸</span>)}
                    <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                  </label>
                </div>
              </div>
              {/* بيانات أساسية */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-2 text-sm">{language === "ar" ? "الاسم" : "Name"}</label>
                  <input type="text" value={profile.name} disabled className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2 text-sm">{language === "ar" ? "البريد الإلكتروني" : "Email"}</label>
                  <input type="email" value={profile.email} disabled className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2 text-sm">{language === "ar" ? "الرقم الوظيفي" : "Employee ID"}</label>
                  <input type="text" value={profile.employeeId} disabled className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white cursor-not-allowed font-bold" />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2 text-sm">{language === "ar" ? "رقم الهاتف" : "Phone Number"}</label>
                  <input type="tel" value={profile.phone || ""} disabled className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2 text-sm">{language === "ar" ? "الرقم المدني" : "Civil ID"}</label>
                  <input type="text" value={profile.civilId || ""} disabled className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2 text-sm">{language === "ar" ? "تاريخ الميلاد" : "Date of Birth"}</label>
                  <input type="text" value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('ar-EG') : ""} disabled className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2 text-sm">{language === "ar" ? "الجنسية" : "Nationality"}</label>
                  <input type="text" value={profile.nationality || ""} disabled className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2 text-sm">{language === "ar" ? "عدد الحضور" : "Attendance Count"}</label>
                  <input type="text" value={profile._count?.attendances ?? 0} disabled className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white cursor-not-allowed" />
                </div>
              </div>
              {/* أنواع الوظائف */}
              <div className="mt-4">
                <label className="block text-gray-400 mb-2 text-sm">{language === "ar" ? "أنواع الوظائف" : "Marshal Types"}</label>
                <div className="flex flex-wrap gap-2">
                  {profile.marshalTypes && profile.marshalTypes.split(',').filter(t => t).length > 0 ? (
                    profile.marshalTypes.split(',').filter(t => t).map((type) => (
                      <span key={type} className="inline-flex items-center gap-1 px-4 py-1 rounded-full bg-zinc-800 text-white text-base font-bold border border-zinc-700">{type}</span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-base">{language === "ar" ? "لا يوجد أنواع وظائف" : "No marshal types"}</span>
                  )}
                </div>
              </div>
              {/* رخص القيادة */}
              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold text-white border-b border-zinc-700 pb-2">{language === "ar" ? "رخصة القيادة (اختياري)" : "Driver License (Optional)"}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-2 text-sm">{language === "ar" ? "الرخصة - الأمام" : "License - Front"}</label>
                    <div className="space-y-3">
                      {profile.licenseFrontImage && (
                        <div className="relative group">
                          <img src={profile.licenseFrontImage} alt="License Front" className="w-full h-48 object-cover rounded-lg border-2 border-zinc-700" />
                          <a href={profile.licenseFrontImage} target="_blank" rel="noopener noreferrer" className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white px-3 py-1 rounded-lg text-sm transition-colors">{language === "ar" ? "عرض" : "View"}</a>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2 text-sm">{language === "ar" ? "الرخصة - الخلف" : "License - Back"}</label>
                    <div className="space-y-3">
                      {profile.licenseBackImage && (
                        <div className="relative group">
                          <img src={profile.licenseBackImage} alt="License Back" className="w-full h-48 object-cover rounded-lg border-2 border-zinc-700" />
                          <a href={profile.licenseBackImage} target="_blank" rel="noopener noreferrer" className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white px-3 py-1 rounded-lg text-sm transition-colors">{language === "ar" ? "عرض" : "View"}</a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.form onSubmit={handleEdit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden p-6 space-y-6">
            {/* صورة الملف الشخصي */}
            <div className="flex justify-center">
              <div className="relative">
                {profile.image ? (
                  <img src={profile.image} alt={profile.name} className="w-32 h-32 rounded-full object-cover border-4 border-red-600" />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white text-4xl font-bold">{profile.name.charAt(0).toUpperCase()}</div>
                )}
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-700 transition-colors">
                  {uploading ? (<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />) : (<span className="text-xl">📸</span>)}
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                </label>
              </div>
            </div>
            {/* نموذج التعديل */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 mb-2 text-sm">{language === "ar" ? "الاسم" : "Name"}</label>
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:border-red-600 focus:outline-none" />
              </div>
              <div>
                <label className="block text-gray-400 mb-2 text-sm">{language === "ar" ? "رقم الهاتف" : "Phone Number"}</label>
                <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:border-red-600 focus:outline-none" />
              </div>
              <div>
                <label className="block text-gray-400 mb-2 text-sm">{language === "ar" ? "الرقم المدني" : "Civil ID"}</label>
                <input type="text" value={formData.civilId} onChange={e => setFormData({ ...formData, civilId: e.target.value })} className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:border-red-600 focus:outline-none" />
              </div>
              <div>
                <label className="block text-gray-400 mb-2 text-sm">{language === "ar" ? "تاريخ الميلاد" : "Date of Birth"}</label>
                <input type="date" value={formData.dateOfBirth} onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })} className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:border-red-600 focus:outline-none" />
              </div>
              <div>
                <label className="block text-gray-400 mb-2 text-sm">{language === "ar" ? "الجنسية" : "Nationality"}</label>
                <input type="text" value={formData.nationality} onChange={e => setFormData({ ...formData, nationality: e.target.value })} className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:border-red-600 focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="submit" disabled={saving} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50">{saving ? (<span className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />{language === "ar" ? "جاري الحفظ..." : "Saving..."}</span>) : (<>💾 {language === "ar" ? "حفظ التغييرات" : "Save Changes"}</>)}</button>
              <button type="button" onClick={() => setShowEdit(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-lg transition-colors">{language === "ar" ? "إلغاء" : "Cancel"}</button>
            </div>
          </motion.form>
        )}
      </main>
    </div>
  )
}