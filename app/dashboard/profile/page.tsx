"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { motion } from "framer-motion"
import Link from "next/link"

const NATIONALITIES = [
  { value: "KW", label: { ar: "الكويت", en: "Kuwait" } },
  { value: "SA", label: { ar: "السعودية", en: "Saudi Arabia" } },
  { value: "AE", label: { ar: "الإمارات", en: "UAE" } },
  { value: "BH", label: { ar: "البحرين", en: "Bahrain" } },
  { value: "QA", label: { ar: "قطر", en: "Qatar" } },
  { value: "OM", label: { ar: "عمان", en: "Oman" } },
  { value: "JO", label: { ar: "الأردن", en: "Jordan" } },
  { value: "EG", label: { ar: "مصر", en: "Egypt" } },
  { value: "SY", label: { ar: "سوريا", en: "Syria" } },
  { value: "LB", label: { ar: "لبنان", en: "Lebanon" } },
  { value: "IQ", label: { ar: "العراق", en: "Iraq" } },
  { value: "YE", label: { ar: "اليمن", en: "Yemen" } },
  { value: "PS", label: { ar: "فلسطين", en: "Palestine" } },
  { value: "SD", label: { ar: "السودان", en: "Sudan" } },
  { value: "LY", label: { ar: "ليبيا", en: "Libya" } },
  { value: "TN", label: { ar: "تونس", en: "Tunisia" } },
  { value: "DZ", label: { ar: "الجزائر", en: "Algeria" } },
  { value: "MA", label: { ar: "المغرب", en: "Morocco" } },
  { value: "US", label: { ar: "الولايات المتحدة", en: "United States" } },
  { value: "GB", label: { ar: "المملكة المتحدة", en: "United Kingdom" } },
  { value: "CA", label: { ar: "كندا", en: "Canada" } },
  { value: "AU", label: { ar: "أستراليا", en: "Australia" } },
  { value: "FR", label: { ar: "فرنسا", en: "France" } },
  { value: "DE", label: { ar: "ألمانيا", en: "Germany" } },
  { value: "IT", label: { ar: "إيطاليا", en: "Italy" } },
  { value: "ES", label: { ar: "إسبانيا", en: "Spain" } },
]

const BLOOD_TYPES = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
]

interface UserProfile {
  id: string
  name: string
  email: string
  employeeId: string
  phone: string
  civilId: string
  dateOfBirth: string
  nationality: string
  bloodType: string
  image: string
  civilIdImage: string
  civilIdBackImage: string
  licenseFrontImage: string
  licenseBackImage: string
  role: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { language } = useLanguage()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<'personal' | 'documents' | 'security'>('personal')
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    civilId: "",
    dateOfBirth: "",
    nationality: "",
    bloodType: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchProfile()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile")
      const data = await res.json()
      setProfile(data)
      setFormData({
        name: data.name || "",
        phone: data.phone || "",
        civilId: data.civilId || "",
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : "",
        nationality: data.nationality || "",
        bloodType: data.bloodType || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setMessage({
        type: "error",
        text: language === "ar" ? "الرجاء اختيار صورة فقط" : "Please select an image file"
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: language === "ar" ? "حجم الصورة يجب أن يكون أقل من 5 ميجابايت" : "Image size must be less than 5MB"
      })
      return
    }

    setUploading(true)
    setMessage(null)

    try {
      const formDataUpload = new FormData()
      formDataUpload.append("file", file)
      formDataUpload.append("imageType", "profile")

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({
          type: "success",
          text: language === "ar" ? "تم رفع الصورة بنجاح!" : "Image uploaded successfully!"
        })
        fetchProfile()
      } else {
        setMessage({
          type: "error",
          text: data.error || (language === "ar" ? "فشل رفع الصورة" : "Failed to upload image")
        })
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      setMessage({
        type: "error",
        text: language === "ar" ? "حدث خطأ أثناء رفع الصورة" : "An error occurred while uploading"
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.newPassword) {
      if (!formData.currentPassword) {
        setMessage({
          type: "error",
          text: language === "ar" ? "الرجاء إدخال كلمة المرور الحالية" : "Please enter current password"
        })
        return
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setMessage({
          type: "error",
          text: language === "ar" ? "كلمات المرور الجديدة غير متطابقة" : "New passwords do not match"
        })
        return
      }
      if (formData.newPassword.length < 6) {
        setMessage({
          type: "error",
          text: language === "ar" ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters"
        })
        return
      }
    }

    setSaving(true)
    setMessage(null)

    try {
      const updateData: any = {
        name: formData.name,
        phone: formData.phone,
        civilId: formData.civilId,
        dateOfBirth: formData.dateOfBirth,
        nationality: formData.nationality,
        bloodType: formData.bloodType,
      }

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword
        updateData.newPassword = formData.newPassword
      }

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({
          type: "success",
          text: language === "ar" ? "تم حفظ التغييرات بنجاح!" : "Changes saved successfully!"
        })
        fetchProfile()
      } else {
        setMessage({
          type: "error",
          text: data.error || (language === "ar" ? "فشل حفظ التغيرات" : "Failed to save changes")
        })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setMessage({
        type: "error",
        text: language === "ar" ? "حدث خطأ أثناء حفظ التغييرات" : "An error occurred while saving"
      })
    } finally {
      setSaving(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session || !profile) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-lg border-b border-red-600/30 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-red-600 hover:text-red-500 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-xl font-bold text-white">
                👤 {language === "ar" ? "الملف الشخصي" : "Profile"}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg border ${
              message.type === "success"
                ? "bg-green-600/20 border-green-600/30 text-green-400"
                : "bg-red-600/20 border-red-600/30 text-red-400"
            }`}
          >
            {message.text}
          </motion.div>
        )}

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Profile Picture */}
            <div className="relative">
              {profile.image ? (
                <img
                  src={profile.image}
                  alt={profile.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-red-600"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white text-2xl font-bold">
                  {profile?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-700 transition-colors border-2 border-zinc-900">
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-sm">📷</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-white mb-2">{profile.name}</h2>
              <div className="space-y-1 text-sm text-gray-400">
                <p>📧 {profile.email}</p>
                <p>�� {profile.employeeId}</p>
                <p>📱 {profile.phone || (language === "ar" ? "غير محدد" : "Not specified")}</p>
              </div>
            </div>

            {/* Role Badge */}
            <div className="flex-shrink-0">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                profile.role === "admin"
                  ? "bg-red-600/20 text-red-400 border border-red-600/30"
                  : "bg-blue-600/20 text-blue-400 border border-blue-600/30"
              }`}>
                {profile.role === "admin" ? "👑" : "🏁"}
                {language === "ar"
                  ? profile.role === "admin" ? "مدير" : "مارشال"
                  : profile.role === "admin" ? "Admin" : "Marshal"
                }
              </span>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex space-x-1 bg-zinc-900/50 border border-zinc-800 rounded-lg p-1">
            {[
              { key: 'personal', label: language === "ar" ? "الشخصية" : "Personal", icon: "👤" },
              { key: 'documents', label: language === "ar" ? "الوثائق" : "Documents", icon: "📄" },
              { key: 'security', label: language === "ar" ? "الأمان" : "Security", icon: "🔒" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-red-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        {activeTab === 'personal' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              👤 {language === "ar" ? "المعلومات الشخصية" : "Personal Information"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-gray-400 mb-2 text-sm">
                    {language === "ar" ? "الاسم" : "Name"} *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-gray-400 mb-2 text-sm">
                    {language === "ar" ? "رقم الهاتف" : "Phone Number"}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
                  />
                </div>

                {/* Civil ID */}
                <div>
                  <label className="block text-gray-400 mb-2 text-sm">
                    {language === "ar" ? "رقم البطاقة المدنية" : "Civil ID"}
                  </label>
                  <input
                    type="text"
                    value={formData.civilId}
                    onChange={(e) => setFormData({ ...formData, civilId: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-gray-400 mb-2 text-sm">
                    {language === "ar" ? "تاريخ الميلاد" : "Date of Birth"}
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
                  />
                </div>

                {/* Nationality */}
                <div>
                  <label className="block text-gray-400 mb-2 text-sm">
                    {language === "ar" ? "الجنسية" : "Nationality"}
                  </label>
                  <select
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
                  >
                    <option value="">{language === "ar" ? "اختر الجنسية" : "Select nationality"}</option>
                    {NATIONALITIES.map((nat) => (
                      <option key={nat.value} value={nat.value}>
                        {language === "ar" ? nat.label.ar : nat.label.en}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Blood Type */}
                <div>
                  <label className="block text-gray-400 mb-2 text-sm">
                    {language === "ar" ? "فصيلة الدم" : "Blood Type"}
                  </label>
                  <select
                    value={formData.bloodType}
                    onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
                  >
                    <option value="">{language === "ar" ? "اختر فصيلة الدم" : "Select blood type"}</option>
                    {BLOOD_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {language === "ar" ? "جاري الحفظ..." : "Saving..."}
                    </>
                  ) : (
                    <>
                      💾 {language === "ar" ? "حفظ التغييرات" : "Save Changes"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {activeTab === 'documents' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                📄 {language === "ar" ? "الوثائق والصور" : "Documents & Images"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Civil ID Front */}
                <div className="space-y-3">
                  <label className="block text-gray-400 text-sm">
                    {language === "ar" ? "البطاقة المدنية - الأمام" : "Civil ID - Front"}
                  </label>
                  {profile.civilIdImage ? (
                    <div className="relative group">
                      <img
                        src={profile.civilIdImage}
                        alt="Civil ID Front"
                        className="w-full h-32 object-cover rounded-lg border-2 border-zinc-700"
                      />
                      <a
                        href={profile.civilIdImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white px-2 py-1 rounded text-xs transition-colors"
                      >
                        👁️
                      </a>
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-zinc-800/50 border-2 border-dashed border-zinc-700 rounded-lg flex items-center justify-center text-gray-500">
                      📄 {language === "ar" ? "لم يتم رفع الصورة" : "No image uploaded"}
                    </div>
                  )}
                </div>

                {/* Civil ID Back */}
                <div className="space-y-3">
                  <label className="block text-gray-400 text-sm">
                    {language === "ar" ? "البطاقة المدنية - الخلف" : "Civil ID - Back"}
                  </label>
                  {profile.civilIdBackImage ? (
                    <div className="relative group">
                      <img
                        src={profile.civilIdBackImage}
                        alt="Civil ID Back"
                        className="w-full h-32 object-cover rounded-lg border-2 border-zinc-700"
                      />
                      <a
                        href={profile.civilIdBackImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white px-2 py-1 rounded text-xs transition-colors"
                      >
                        👁️
                      </a>
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-zinc-800/50 border-2 border-dashed border-zinc-700 rounded-lg flex items-center justify-center text-gray-500">
                      📄 {language === "ar" ? "لم يتم رفع الصورة" : "No image uploaded"}
                    </div>
                  )}
                </div>

                {/* License Front */}
                <div className="space-y-3">
                  <label className="block text-gray-400 text-sm">
                    {language === "ar" ? "رخصة القيادة - الأمام" : "License - Front"}
                  </label>
                  {profile.licenseFrontImage ? (
                    <div className="relative group">
                      <img
                        src={profile.licenseFrontImage}
                        alt="License Front"
                        className="w-full h-32 object-cover rounded-lg border-2 border-zinc-700"
                      />
                      <a
                        href={profile.licenseFrontImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white px-2 py-1 rounded text-xs transition-colors"
                      >
                        👁️
                      </a>
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-zinc-800/50 border-2 border-dashed border-zinc-700 rounded-lg flex items-center justify-center text-gray-500">
                      📄 {language === "ar" ? "لم يتم رفع الصورة" : "No image uploaded"}
                    </div>
                  )}
                </div>

                {/* License Back */}
                <div className="space-y-3">
                  <label className="block text-gray-400 text-sm">
                    {language === "ar" ? "رخصة القيادة - الخلف" : "License - Back"}
                  </label>
                  {profile.licenseBackImage ? (
                    <div className="relative group">
                      <img
                        src={profile.licenseBackImage}
                        alt="License Back"
                        className="w-full h-32 object-cover rounded-lg border-2 border-zinc-700"
                      />
                      <a
                        href={profile.licenseBackImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white px-2 py-1 rounded text-xs transition-colors"
                      >
                        👁️
                      </a>
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-zinc-800/50 border-2 border-dashed border-zinc-700 rounded-lg flex items-center justify-center text-gray-500">
                      📄 {language === "ar" ? "لم يتم رفع الصورة" : "No image uploaded"}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-600/10 border border-blue-600/30 rounded-lg">
                <p className="text-blue-400 text-sm">
                  💡 {language === "ar"
                    ? "لتحديث الصور، يرجى التواصل مع الإدارة"
                    : "To update images, please contact administration"
                  }
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              🔒 {language === "ar" ? "إعدادات الأمان" : "Security Settings"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 mb-2 text-sm">
                    {language === "ar" ? "كلمة المرور الحالية" : "Current Password"} *
                  </label>
                  <input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
                    placeholder={language === "ar" ? "أدخل كلمة المرور الحالية" : "Enter current password"}
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-2 text-sm">
                    {language === "ar" ? "كلمة المرور الجديدة" : "New Password"}
                  </label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
                    placeholder={language === "ar" ? "أدخل كلمة المرور الجديدة" : "Enter new password"}
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-2 text-sm">
                    {language === "ar" ? "تأكيد كلمة المرور الجديدة" : "Confirm New Password"}
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
                    placeholder={language === "ar" ? "أعد إدخال كلمة المرور الجديدة" : "Re-enter new password"}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {language === "ar" ? "جاري الحفظ..." : "Saving..."}
                    </>
                  ) : (
                    <>
                      🔒 {language === "ar" ? "تحديث كلمة المرور" : "Update Password"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </main>
    </div>
  )
}
