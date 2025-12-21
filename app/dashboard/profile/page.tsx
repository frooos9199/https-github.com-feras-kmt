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
  const { language, t } = useLanguage()
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
        text: t("pleaseSelectImage")
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: t("imageSizeLimit")
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
          text: t("imageUploadedSuccessfully")
        })
        fetchProfile()
      } else {
        setMessage({
          type: "error",
          text: data.error || t("failedToUploadImage")
        })
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      setMessage({
        type: "error",
        text: t("errorUploadingImage")
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
          text: t("pleaseEnterCurrentPassword")
        })
        return
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setMessage({
          type: "error",
          text: t("newPasswordsDoNotMatch")
        })
        return
      }
      if (formData.newPassword.length < 6) {
        setMessage({
          type: "error",
          text: t("passwordMinLength")
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
          text: t("changesSavedSuccessfully")
        })
        fetchProfile()
      } else {
        setMessage({
          type: "error",
          text: data.error || t("failedToSaveChanges")
        })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setMessage({
        type: "error",
        text: t("errorSavingChanges")
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-xl border-b border-red-500/20 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="group">
                <div className="w-12 h-12 rounded-xl bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 hover:border-red-500/40 flex items-center justify-center transition-all duration-300 group-hover:scale-105">
                  <svg className="w-6 h-6 text-red-400 group-hover:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {t("profile")}
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  {t("managePersonalInfo")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/10 border border-red-500/20">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-sm text-green-400 font-medium">
                  {t("online")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`mb-8 p-6 rounded-2xl border backdrop-blur-sm shadow-2xl ${
              message.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-emerald-500/10"
                : "bg-red-500/10 border-red-500/30 text-red-300 shadow-red-500/10"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === "success" ? "bg-emerald-500/20" : "bg-red-500/20"
              }`}>
                {message.type === "success" ? "✅" : "❌"}
              </div>
              <p className="font-medium">{message.text}</p>
            </div>
          </motion.div>
        )}

        {/* Profile Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mb-12"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-purple-600/20 to-blue-600/20 rounded-3xl blur-3xl"></div>
          <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Profile Picture */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                <div className="relative">
                  {profile.image ? (
                    <img
                      src={profile.image}
                      alt={profile.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-slate-600/50 shadow-2xl"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-600 via-red-700 to-red-800 flex items-center justify-center text-white text-4xl font-bold shadow-2xl border-4 border-slate-600/50">
                      {profile?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <label className="absolute -bottom-3 -right-3 w-12 h-12 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center cursor-pointer hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-xl border-4 border-slate-800 group">
                    {uploading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="text-lg group-hover:scale-110 transition-transform">📷</span>
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
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-3">
                  {profile.name}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <p className="text-sm text-gray-400 mb-1">📧 Email</p>
                    <p className="text-white font-medium">{profile.email}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <p className="text-sm text-gray-400 mb-1">🆔 Employee ID</p>
                    <p className="text-white font-medium">{profile.employeeId}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <p className="text-sm text-gray-400 mb-1">📱 Phone</p>
                    <p className="text-white font-medium">{profile.phone || t("notSpecified")}</p>
                  </div>
                </div>
              </div>

              {/* Role Badge */}
              <div className="flex-shrink-0">
                <div className={`relative px-6 py-4 rounded-2xl border-2 shadow-2xl ${
                  profile.role === "admin"
                    ? "bg-gradient-to-r from-red-600/20 to-red-700/20 border-red-500/50 shadow-red-500/20"
                    : "bg-gradient-to-r from-blue-600/20 to-blue-700/20 border-blue-500/50 shadow-blue-500/20"
                }`}>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-xs">⭐</span>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">{profile.role === "admin" ? "👑" : "🏁"}</div>
                    <div className={`text-lg font-bold ${
                      profile.role === "admin" ? "text-red-300" : "text-blue-300"
                    }`}>
                      {language === "ar"
                        ? profile.role === "admin" ? "مدير" : "مارشال"
                        : profile.role === "admin" ? "Admin" : "Marshal"
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex flex-col sm:flex-row gap-4 bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-2 shadow-2xl">
            {[
              { key: 'personal', label: t("personal"), icon: "👤", desc: t("basicInformation") },
              { key: 'documents', label: t("documents"), icon: "📄", desc: t("imagesAndFiles") },
              { key: 'security', label: t("security"), icon: "🔒", desc: t("password") },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 group relative overflow-hidden rounded-xl p-6 transition-all duration-300 ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-red-600/20 to-red-700/20 border-2 border-red-500/50 shadow-lg shadow-red-500/20"
                    : "hover:bg-slate-700/30 border-2 border-transparent hover:border-slate-600/50"
                }`}
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-2">
                    <div className={`text-3xl ${activeTab === tab.key ? 'animate-bounce' : ''}`}>
                      {tab.icon}
                    </div>
                    <div className="text-left">
                      <h3 className={`font-bold text-lg ${
                        activeTab === tab.key ? "text-white" : "text-gray-300 group-hover:text-white"
                      }`}>
                        {tab.label}
                      </h3>
                      <p className={`text-sm ${
                        activeTab === tab.key ? "text-red-300" : "text-gray-500 group-hover:text-gray-400"
                      }`}>
                        {tab.desc}
                      </p>
                    </div>
                  </div>
                  {activeTab === tab.key && (
                    <div className="w-full h-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full mt-4"></div>
                  )}
                </div>
                {activeTab === tab.key && (
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent animate-pulse"></div>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        {activeTab === 'personal' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-red-600/10 rounded-3xl blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600/20 to-blue-700/20 border border-blue-500/30 flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {t('personalInformation')}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {t('updateBasicInfo')}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Name */}
                  <div className="group">
                    <label className="block text-gray-300 mb-3 text-sm font-medium flex items-center gap-2">
                      <span className="text-blue-400">📝</span>
                      {t('fullName')} *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full px-5 py-4 bg-slate-800/50 border border-slate-600/50 rounded-2xl text-white placeholder-gray-500 focus:border-blue-500/70 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 hover:border-slate-500/70"
                        placeholder={t('enterFullName')}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="group">
                    <label className="block text-gray-300 mb-3 text-sm font-medium flex items-center gap-2">
                      <span className="text-green-400">📱</span>
                      {t('phoneNumber')}
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-800/50 border border-slate-600/50 rounded-2xl text-white placeholder-gray-500 focus:border-green-500/70 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all duration-300 hover:border-slate-500/70"
                        placeholder={t('enterPhoneNumber')}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  {/* Civil ID */}
                  <div className="group">
                    <label className="block text-gray-300 mb-3 text-sm font-medium flex items-center gap-2">
                      <span className="text-purple-400">🆔</span>
                      {t('civilId')}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.civilId}
                        onChange={(e) => setFormData({ ...formData, civilId: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-800/50 border border-slate-600/50 rounded-2xl text-white placeholder-gray-500 focus:border-purple-500/70 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 hover:border-slate-500/70"
                        placeholder={t('enterCivilId')}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div className="group">
                    <label className="block text-gray-300 mb-3 text-sm font-medium flex items-center gap-2">
                      <span className="text-pink-400">🎂</span>
                      {t('dateOfBirth')}
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-800/50 border border-slate-600/50 rounded-2xl text-white focus:border-pink-500/70 focus:outline-none focus:ring-2 focus:ring-pink-500/20 transition-all duration-300 hover:border-slate-500/70"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-600/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  {/* Nationality */}
                  <div className="group">
                    <label className="block text-gray-300 mb-3 text-sm font-medium flex items-center gap-2">
                      <span className="text-yellow-400">🌍</span>
                      {t('nationality')}
                    </label>
                    <div className="relative">
                      <select
                        value={formData.nationality}
                        onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-800/50 border border-slate-600/50 rounded-2xl text-white focus:border-yellow-500/70 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 transition-all duration-300 hover:border-slate-500/70 appearance-none"
                      >
                        <option value="" className="bg-slate-800">
                          {t('selectNationality')}
                        </option>
                        {NATIONALITIES.map((nat) => (
                          <option key={nat.value} value={nat.value} className="bg-slate-800">
                            {language === "ar" ? nat.label.ar : nat.label.en}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  {/* Blood Type */}
                  <div className="group">
                    <label className="block text-gray-300 mb-3 text-sm font-medium flex items-center gap-2">
                      <span className="text-red-400">🩸</span>
                      {t('bloodType')}
                    </label>
                    <div className="relative">
                      <select
                        value={formData.bloodType}
                        onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-800/50 border border-slate-600/50 rounded-2xl text-white focus:border-red-500/70 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all duration-300 hover:border-slate-500/70 appearance-none"
                      >
                        <option value="" className="bg-slate-800">
                          {t('selectBloodType')}
                        </option>
                        {BLOOD_TYPES.map((type) => (
                          <option key={type.value} value={type.value} className="bg-slate-800">
                            {type.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-6 border-t border-slate-700/50">
                  <button
                    type="submit"
                    disabled={saving}
                    className="group relative px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transform hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center gap-3">
                      {saving ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{t('saving')}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-lg">💾</span>
                          <span>{t('saveChanges')}</span>
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {activeTab === 'documents' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-8"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-green-600/10 rounded-3xl blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-600/20 to-purple-700/20 border border-purple-500/30 flex items-center justify-center">
                    <span className="text-2xl">📄</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {language === "ar" ? "الوثائق والصور" : "Documents & Images"}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {language === "ar" ? "عرض وإدارة وثائقك الرسمية" : "View and manage your official documents"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Civil ID Front */}
                  <div className="group">
                    <label className="block text-gray-300 mb-4 text-sm font-medium flex items-center gap-2">
                      <span className="text-blue-400">🆔</span>
                      {language === "ar" ? "البطاقة المدنية - الأمام" : "Civil ID - Front"}
                    </label>
                    {profile.civilIdImage ? (
                      <div className="relative group overflow-hidden rounded-2xl border border-slate-600/50 shadow-lg">
                        <img
                          src={profile.civilIdImage}
                          alt="Civil ID Front"
                          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-white text-sm font-medium">
                            {language === "ar" ? "البطاقة المدنية" : "Civil ID"}
                          </span>
                          <a
                            href={profile.civilIdImage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2"
                          >
                            <span>👁️</span>
                            {language === "ar" ? "عرض" : "View"}
                          </a>
                        </div>
                        <div className="absolute top-4 right-4 w-3 h-3 bg-green-400 rounded-full animate-pulse" title="Verified"></div>
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-2 border-dashed border-slate-600/50 rounded-2xl flex flex-col items-center justify-center text-gray-500 transition-all duration-300 hover:border-slate-500/70 hover:bg-slate-800/30">
                        <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-4">
                          <span className="text-3xl">📄</span>
                        </div>
                        <p className="text-sm font-medium">
                          {language === "ar" ? "لم يتم رفع الصورة" : "No image uploaded"}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {language === "ar" ? "سيتم رفعها من قبل الإدارة" : "Will be uploaded by admin"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Civil ID Back */}
                  <div className="group">
                    <label className="block text-gray-300 mb-4 text-sm font-medium flex items-center gap-2">
                      <span className="text-blue-400">🆔</span>
                      {language === "ar" ? "البطاقة المدنية - الخلف" : "Civil ID - Back"}
                    </label>
                    {profile.civilIdBackImage ? (
                      <div className="relative group overflow-hidden rounded-2xl border border-slate-600/50 shadow-lg">
                        <img
                          src={profile.civilIdBackImage}
                          alt="Civil ID Back"
                          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-white text-sm font-medium">
                            {language === "ar" ? "الجانب الخلفي" : "Back Side"}
                          </span>
                          <a
                            href={profile.civilIdBackImage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2"
                          >
                            <span>👁️</span>
                            {language === "ar" ? "عرض" : "View"}
                          </a>
                        </div>
                        <div className="absolute top-4 right-4 w-3 h-3 bg-green-400 rounded-full animate-pulse" title="Verified"></div>
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-2 border-dashed border-slate-600/50 rounded-2xl flex flex-col items-center justify-center text-gray-500 transition-all duration-300 hover:border-slate-500/70 hover:bg-slate-800/30">
                        <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-4">
                          <span className="text-3xl">📄</span>
                        </div>
                        <p className="text-sm font-medium">
                          {language === "ar" ? "لم يتم رفع الصورة" : "No image uploaded"}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {language === "ar" ? "سيتم رفعها من قبل الإدارة" : "Will be uploaded by admin"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* License Front */}
                  <div className="group">
                    <label className="block text-gray-300 mb-4 text-sm font-medium flex items-center gap-2">
                      <span className="text-green-400">🚗</span>
                      {language === "ar" ? "رخصة القيادة - الأمام" : "License - Front"}
                    </label>
                    {profile.licenseFrontImage ? (
                      <div className="relative group overflow-hidden rounded-2xl border border-slate-600/50 shadow-lg">
                        <img
                          src={profile.licenseFrontImage}
                          alt="License Front"
                          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-white text-sm font-medium">
                            {language === "ar" ? "رخصة القيادة" : "Driver License"}
                          </span>
                          <a
                            href={profile.licenseFrontImage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2"
                          >
                            <span>👁️</span>
                            {language === "ar" ? "عرض" : "View"}
                          </a>
                        </div>
                        <div className="absolute top-4 right-4 w-3 h-3 bg-green-400 rounded-full animate-pulse" title="Verified"></div>
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-2 border-dashed border-slate-600/50 rounded-2xl flex flex-col items-center justify-center text-gray-500 transition-all duration-300 hover:border-slate-500/70 hover:bg-slate-800/30">
                        <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-4">
                          <span className="text-3xl">�</span>
                        </div>
                        <p className="text-sm font-medium">
                          {language === "ar" ? "لم يتم رفع الصورة" : "No image uploaded"}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {language === "ar" ? "سيتم رفعها من قبل الإدارة" : "Will be uploaded by admin"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* License Back */}
                  <div className="group">
                    <label className="block text-gray-300 mb-4 text-sm font-medium flex items-center gap-2">
                      <span className="text-green-400">🚗</span>
                      {language === "ar" ? "رخصة القيادة - الخلف" : "License - Back"}
                    </label>
                    {profile.licenseBackImage ? (
                      <div className="relative group overflow-hidden rounded-2xl border border-slate-600/50 shadow-lg">
                        <img
                          src={profile.licenseBackImage}
                          alt="License Back"
                          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-white text-sm font-medium">
                            {language === "ar" ? "الجانب الخلفي" : "Back Side"}
                          </span>
                          <a
                            href={profile.licenseBackImage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2"
                          >
                            <span>👁️</span>
                            {language === "ar" ? "عرض" : "View"}
                          </a>
                        </div>
                        <div className="absolute top-4 right-4 w-3 h-3 bg-green-400 rounded-full animate-pulse" title="Verified"></div>
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-2 border-dashed border-slate-600/50 rounded-2xl flex flex-col items-center justify-center text-gray-500 transition-all duration-300 hover:border-slate-500/70 hover:bg-slate-800/30">
                        <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-4">
                          <span className="text-3xl">�</span>
                        </div>
                        <p className="text-sm font-medium">
                          {language === "ar" ? "لم يتم رفع الصورة" : "No image uploaded"}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {language === "ar" ? "سيتم رفعها من قبل الإدارة" : "Will be uploaded by admin"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Box */}
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">💡</span>
                    </div>
                    <div>
                      <h4 className="text-blue-300 font-semibold mb-2">
                        {language === "ar" ? "تحديث الوثائق" : "Document Updates"}
                      </h4>
                      <p className="text-blue-200 text-sm leading-relaxed">
                        {language === "ar"
                          ? "لتحديث أو رفع وثائق جديدة، يرجى التواصل مع الإدارة. جميع الوثائق تخضع للتحقق والاعتماد من قبل الفريق المختص."
                          : "To update or upload new documents, please contact administration. All documents are subject to verification and approval by the specialized team."
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-8"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-orange-600/10 to-yellow-600/10 rounded-3xl blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-red-600/20 to-red-700/20 border border-red-500/30 flex items-center justify-center">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {language === "ar" ? "إعدادات الأمان" : "Security Settings"}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {language === "ar" ? "حافظ على أمان حسابك بتحديث كلمة المرور" : "Keep your account secure by updating your password"}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 gap-8">
                    {/* Current Password */}
                    <div className="group">
                      <label className="block text-gray-300 mb-3 text-sm font-medium flex items-center gap-2">
                        <span className="text-orange-400">🔑</span>
                        {language === "ar" ? "كلمة المرور الحالية" : "Current Password"} *
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={formData.currentPassword}
                          onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                          className="w-full px-5 py-4 bg-slate-800/50 border border-slate-600/50 rounded-2xl text-white placeholder-gray-500 focus:border-orange-500/70 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 hover:border-slate-500/70 pr-12"
                          placeholder={language === "ar" ? "أدخل كلمة المرور الحالية" : "Enter current password"}
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                          <span className="text-lg">🔒</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="group">
                      <label className="block text-gray-300 mb-3 text-sm font-medium flex items-center gap-2">
                        <span className="text-green-400">🆕</span>
                        {language === "ar" ? "كلمة المرور الجديدة" : "New Password"}
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={formData.newPassword}
                          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                          className="w-full px-5 py-4 bg-slate-800/50 border border-slate-600/50 rounded-2xl text-white placeholder-gray-500 focus:border-green-500/70 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all duration-300 hover:border-slate-500/70 pr-12"
                          placeholder={language === "ar" ? "أدخل كلمة مرور قوية" : "Enter a strong password"}
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                          <span className="text-lg">🛡️</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <span className="text-green-400">✓</span>
                        <span>{language === "ar" ? "يجب أن تكون 6 أحرف على الأقل" : "Must be at least 6 characters"}</span>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div className="group">
                      <label className="block text-gray-300 mb-3 text-sm font-medium flex items-center gap-2">
                        <span className="text-blue-400">✅</span>
                        {language === "ar" ? "تأكيد كلمة المرور الجديدة" : "Confirm New Password"}
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          className="w-full px-5 py-4 bg-slate-800/50 border border-slate-600/50 rounded-2xl text-white placeholder-gray-500 focus:border-blue-500/70 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 hover:border-slate-500/70 pr-12"
                          placeholder={language === "ar" ? "أعد إدخال كلمة المرور الجديدة" : "Re-enter new password"}
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                          <span className="text-lg">🔄</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </div>
                  </div>

                  {/* Security Tips */}
                  <div className="p-6 bg-gradient-to-r from-yellow-600/10 to-orange-600/10 border border-yellow-500/20 rounded-2xl backdrop-blur-sm">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-yellow-600/20 border border-yellow-500/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">💡</span>
                      </div>
                      <div>
                        <h4 className="text-yellow-300 font-semibold mb-2">
                          {language === "ar" ? "نصائح الأمان" : "Security Tips"}
                        </h4>
                        <ul className="text-yellow-200 text-sm space-y-1 leading-relaxed">
                          <li>• {language === "ar" ? "استخدم كلمة مرور قوية تحتوي على أحرف وأرقام ورموز" : "Use a strong password with letters, numbers, and symbols"}</li>
                          <li>• {language === "ar" ? "لا تشارك كلمة المرور مع أي شخص" : "Never share your password with anyone"}</li>
                          <li>• {language === "ar" ? "غير كلمة المرور بانتظام" : "Change your password regularly"}</li>
                          <li>• {language === "ar" ? "تأكد من تسجيل الخروج عند الانتهاء" : "Make sure to log out when finished"}</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-6 border-t border-slate-700/50">
                    <button
                      type="submit"
                      disabled={saving}
                      className="group relative px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transform hover:scale-105"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center gap-3">
                        {saving ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>{language === "ar" ? "جاري الحفظ..." : "Saving..."}</span>
                          </>
                        ) : (
                          <>
                            <span className="text-lg">🔒</span>
                            <span>{language === "ar" ? "تحديث كلمة المرور" : "Update Password"}</span>
                          </>
                        )}
                      </div>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
