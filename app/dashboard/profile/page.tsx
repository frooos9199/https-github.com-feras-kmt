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
  { value: "MR", label: { ar: "موريتانيا", en: "Mauritania" } },
  { value: "SO", label: { ar: "الصومال", en: "Somalia" } },
  { value: "DJ", label: { ar: "جيبوتي", en: "Djibouti" } },
  { value: "KM", label: { ar: "جزر القمر", en: "Comoros" } },
  { value: "US", label: { ar: "الولايات المتحدة", en: "United States" } },
  { value: "GB", label: { ar: "المملكة المتحدة", en: "United Kingdom" } },
  { value: "CA", label: { ar: "كندا", en: "Canada" } },
  { value: "AU", label: { ar: "أستراليا", en: "Australia" } },
  { value: "FR", label: { ar: "فرنسا", en: "France" } },
  { value: "DE", label: { ar: "ألمانيا", en: "Germany" } },
  { value: "IT", label: { ar: "إيطاليا", en: "Italy" } },
  { value: "ES", label: { ar: "إسبانيا", en: "Spain" } },
  { value: "NL", label: { ar: "هولندا", en: "Netherlands" } },
  { value: "BE", label: { ar: "بلجيكا", en: "Belgium" } },
  { value: "CH", label: { ar: "سويسرا", en: "Switzerland" } },
  { value: "AT", label: { ar: "النمسا", en: "Austria" } },
  { value: "SE", label: { ar: "السويد", en: "Sweden" } },
  { value: "NO", label: { ar: "النرويج", en: "Norway" } },
  { value: "DK", label: { ar: "الدنمارك", en: "Denmark" } },
  { value: "FI", label: { ar: "فنلندا", en: "Finland" } },
  { value: "PL", label: { ar: "بولندا", en: "Poland" } },
  { value: "AM", label: { ar: "أرمينيا", en: "Armenia" } },
  { value: "TR", label: { ar: "تركيا", en: "Turkey" } },
  { value: "IR", label: { ar: "إيران", en: "Iran" } },
  { value: "PK", label: { ar: "باكستان", en: "Pakistan" } },
  { value: "IN", label: { ar: "الهند", en: "India" } },
  { value: "BD", label: { ar: "بنغلاديش", en: "Bangladesh" } },
  { value: "LK", label: { ar: "سريلانكا", en: "Sri Lanka" } },
  { value: "NP", label: { ar: "نيبال", en: "Nepal" } },
  { value: "PH", label: { ar: "الفلبين", en: "Philippines" } },
  { value: "ID", label: { ar: "إندونيسيا", en: "Indonesia" } },
  { value: "MY", label: { ar: "ماليزيا", en: "Malaysia" } },
  { value: "SG", label: { ar: "سنغافورة", en: "Singapore" } },
  { value: "TH", label: { ar: "تايلاند", en: "Thailand" } },
  { value: "VN", label: { ar: "فيتنام", en: "Vietnam" } },
  { value: "CN", label: { ar: "الصين", en: "China" } },
  { value: "JP", label: { ar: "اليابان", en: "Japan" } },
  { value: "KR", label: { ar: "كوريا الجنوبية", en: "South Korea" } },
  { value: "RU", label: { ar: "روسيا", en: "Russia" } },
  { value: "BR", label: { ar: "البرازيل", en: "Brazil" } },
  { value: "AR", label: { ar: "الأرجنتين", en: "Argentina" } },
  { value: "MX", label: { ar: "المكسيك", en: "Mexico" } },
  { value: "ZA", label: { ar: "جنوب أفريقيا", en: "South Africa" } },
  { value: "NG", label: { ar: "نيجيريا", en: "Nigeria" } },
  { value: "KE", label: { ar: "كينيا", en: "Kenya" } },
  { value: "ET", label: { ar: "إثيوبيا", en: "Ethiopia" } },
  { value: "GH", label: { ar: "غانا", en: "Ghana" } },
]

interface UserProfile {
  id: string
  employeeId: string
  name: string
  email: string
  phone: string | null
  civilId: string | null
  dateOfBirth: string | null
  nationality: string | null
  bloodType: string | null
  image: string | null
  civilIdImage: string | null
  civilIdBackImage: string | null
  licenseFrontImage: string | null
  licenseBackImage: string | null
  role: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { language } = useLanguage()
  console.log("language in profile:", language)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingCivilId, setUploadingCivilId] = useState(false)
  const [uploadingCivilIdBack, setUploadingCivilIdBack] = useState(false)
  const [uploadingLicenseFront, setUploadingLicenseFront] = useState(false)
  const [uploadingLicenseBack, setUploadingLicenseBack] = useState(false)
  const [editing, setEditing] = useState(true) // مفعّل دائماً
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

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setMessage({
        type: "error",
        text: language === "ar" ? "الرجاء اختيار صورة فقط" : "Please select an image file"
      })
      return
    }

    // Validate file size (5MB max)
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
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({
          type: "success",
          text: language === "ar" ? "تم رفع الصورة بنجاح!" : "Image uploaded successfully!"
        })
        fetchProfile() // Refresh profile to show new image
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

  const handleCivilIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploadingCivilId(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("imageType", "civilId")

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({
          type: "success",
          text: language === "ar" ? "تم رفع صورة البطاقة المدنية بنجاح!" : "Civil ID image uploaded successfully!"
        })
        fetchProfile()
      } else {
        setMessage({
          type: "error",
          text: data.error || (language === "ar" ? "فشل رفع صورة البطاقة" : "Failed to upload civil ID image")
        })
      }
    } catch (error) {
      console.error("Error uploading civil ID:", error)
      setMessage({
        type: "error",
        text: language === "ar" ? "حدث خطأ أثناء رفع صورة البطاقة" : "An error occurred while uploading"
      })
    } finally {
      setUploadingCivilId(false)
    }
  }

  const handleCivilIdBackUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploadingCivilIdBack(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("imageType", "civilIdBack")

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({
          type: "success",
          text: language === "ar" ? "تم رفع صورة البطاقة المدنية (الخلف) بنجاح!" : "Civil ID back image uploaded successfully!"
        })
        fetchProfile()
      } else {
        setMessage({
          type: "error",
          text: data.error || (language === "ar" ? "فشل رفع صورة البطاقة" : "Failed to upload civil ID back image")
        })
      }
    } catch (error) {
      console.error("Error uploading civil ID back:", error)
      setMessage({
        type: "error",
        text: language === "ar" ? "حدث خطأ أثناء رفع صورة البطاقة" : "An error occurred while uploading"
      })
    } finally {
      setUploadingCivilIdBack(false)
    }
  }

  const handleLicenseFrontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setMessage({
        type: "error",
        text: language === "ar" ? "الرجاء اختيار صورة فقط" : "Please select an image file"
      })
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: language === "ar" ? "حجم الصورة يجب أن يكون أقل من 5 ميجابايت" : "Image size must be less than 5MB"
      })
      return
    }

    setUploadingLicenseFront(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("imageType", "licenseFront")

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({
          type: "success",
          text: language === "ar" ? "تم رفع صورة الرخصة (الأمام) بنجاح!" : "License front image uploaded successfully!"
        })
        fetchProfile() // Refresh profile to show new image
      } else {
        setMessage({
          type: "error",
          text: data.error || (language === "ar" ? "فشل رفع صورة الرخصة" : "Failed to upload license image")
        })
      }
    } catch (error) {
      console.error("Error uploading license front:", error)
      setMessage({
        type: "error",
        text: language === "ar" ? "حدث خطأ أثناء رفع صورة الرخصة" : "An error occurred while uploading"
      })
    } finally {
      setUploadingLicenseFront(false)
    }
  }

  const handleLicenseBackUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setMessage({
        type: "error",
        text: language === "ar" ? "الرجاء اختيار صورة فقط" : "Please select an image file"
      })
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: language === "ar" ? "حجم الصورة يجب أن يكون أقل من 5 ميجابايت" : "Image size must be less than 5MB"
      })
      return
    }

    setUploadingLicenseBack(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("imageType", "licenseBack")

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({
          type: "success",
          text: language === "ar" ? "تم رفع صورة الرخصة (الخلف) بنجاح!" : "License back image uploaded successfully!"
        })
        fetchProfile() // Refresh profile to show new image
      } else {
        setMessage({
          type: "error",
          text: data.error || (language === "ar" ? "فشل رفع صورة الرخصة" : "Failed to upload license image")
        })
      }
    } catch (error) {
      console.error("Error uploading license back:", error)
      setMessage({
        type: "error",
        text: language === "ar" ? "حدث خطأ أثناء رفع صورة الرخصة" : "An error occurred while uploading"
      })
    } finally {
      setUploadingLicenseBack(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate password change
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
        setMessage({
          type: "success",
          text: language === "ar" ? "تم تحديث الملف الشخصي بنجاح!" : "Profile updated successfully!"
        })
      } else {
        setMessage({
          type: "error",
          text: data.error || (language === "ar" ? "حدث خطأ" : "An error occurred")
        })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setMessage({
        type: "error",
        text: language === "ar" ? "حدث خطأ في التحديث" : "Update failed"
      })
    } finally {
      setSaving(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session || !profile) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-lg border-b border-red-600/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center gap-3">
              <img src="/kmt-logo-main.png" alt="KMT" className="h-12 w-auto rounded px-2 py-1" />
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← {language === "ar" ? "العودة" : "Back"}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            👤 {language === "ar" ? "الملف الشخصي" : "Profile"}
          </h1>
          <p className="text-gray-400">
            {language === "ar" ? "إدارة معلوماتك الشخصية" : "Manage your personal information"}
          </p>
        </motion.div>

        {/* Message Alert */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success" 
                ? "bg-green-600/20 border border-green-600/30 text-green-500"
                : "bg-red-600/20 border border-red-600/30 text-red-500"
            }`}
          >
            {message.text}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden"
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Profile Picture */}
            <div className="flex justify-center">
              <div className="relative">
                {profile.image ? (
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-red-600"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white text-4xl font-bold">
                    {profile?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-700 transition-colors">
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="text-xl">📸</span>
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

            {/* Email (Read-only) */}
            <div>
              <label className="block text-gray-400 mb-2 text-sm">
                {language === "ar" ? "البريد الإلكتروني" : "Email"}
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white cursor-not-allowed"
              />
            </div>

            {/* Employee ID (Read-only) */}
            <div>
              <label className="block text-gray-400 mb-2 text-sm">
                {language === "ar" ? "الرقم الوظيفي" : "Employee ID"}
              </label>
              <input
                type="text"
                value={profile.employeeId}
                disabled
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white cursor-not-allowed font-bold"
              />
            </div>

            {/* Phone Number (Read-only in view mode, shown here) */}
            <div>
              <label className="block text-gray-400 mb-2 text-sm">
                {language === "ar" ? "رقم الهاتف" : "Phone Number"}
              </label>
              <input
                type="text"
                value={profile.phone || (language === "ar" ? "غير محدد" : "Not specified")}
                disabled
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white cursor-not-allowed"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-gray-400 mb-2 text-sm">
                {language === "ar" ? "الاسم" : "Name"} *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!editing}
                required
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:border-red-600 focus:outline-none disabled:cursor-not-allowed"
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
                disabled={!editing}
                placeholder="+965 XXXX XXXX"
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:border-red-600 focus:outline-none disabled:cursor-not-allowed"
              />
            </div>

            {/* Civil ID */}
            <div>
              <label className="block text-gray-400 mb-2 text-sm">
                {language === "ar" ? "الرقم المدني" : "Civil ID"}
              </label>
              <input
                type="text"
                value={formData.civilId}
                onChange={(e) => setFormData({ ...formData, civilId: e.target.value })}
                disabled={!editing}
                placeholder="XXXXXXXXXXXX"
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:border-red-600 focus:outline-none disabled:cursor-not-allowed"
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
                disabled={!editing}
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:border-red-600 focus:outline-none disabled:cursor-not-allowed"
              />
              {/* عرض التاريخ بشكل مقروء حسب اللغة */}
              {formData.dateOfBirth && (
                <div className="mt-2 text-gray-400 text-sm">
                  {language === "ar"
                    ? new Date(formData.dateOfBirth).toLocaleDateString("ar-EG")
                    : new Date(formData.dateOfBirth).toLocaleDateString("en-GB")}
                </div>
              )}
            </div>

            {/* Nationality */}
            <div>
              <label className="block text-gray-400 mb-2 text-sm">
                {language === "ar" ? "الجنسية" : "Nationality"}
              </label>
              <select
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                disabled={!editing}
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:border-red-600 focus:outline-none disabled:cursor-not-allowed cursor-pointer"
              >
                <option value="">{language === "ar" ? "اختر الجنسية" : "Select Nationality"}</option>
                {NATIONALITIES.map(nat => (
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
                disabled={!editing}
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:border-red-600 focus:outline-none disabled:cursor-not-allowed"
              >
                <option value="">{language === "ar" ? "اختر فصيلة الدم" : "Select Blood Type"}</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            {/* License Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-zinc-700 pb-2">
                {language === "ar" ? "المستندات (اختياري)" : "Documents (Optional)"}
              </h3>

              {/* Civil ID Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Civil ID Front */}
                <div>
                  <label className="block text-gray-400 mb-2 text-sm">
                    {language === "ar" ? "البطاقة المدنية - الأمام" : "Civil ID - Front"}
                  </label>
                  <div className="space-y-3">
                    {profile.civilIdImage && (
                      <div className="relative group">
                        <img
                          src={profile.civilIdImage}
                          alt="Civil ID Front"
                          className="w-full h-48 object-cover rounded-lg border-2 border-zinc-700"
                        />
                        <a
                          href={profile.civilIdImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                        >
                          {language === "ar" ? "عرض" : "View"}
                        </a>
                      </div>
                    )}
                    <label className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white hover:bg-zinc-800 transition-colors cursor-pointer">
                      {uploadingCivilId ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{language === "ar" ? "جاري الرفع..." : "Uploading..."}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xl">🪪</span>
                          <span>{language === "ar" ? "رفع صورة الأمام" : "Upload Front"}</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCivilIdUpload}
                        disabled={uploadingCivilId}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Civil ID Back */}
                <div>
                  <label className="block text-gray-400 mb-2 text-sm">
                    {language === "ar" ? "البطاقة المدنية - الخلف" : "Civil ID - Back"}
                  </label>
                  <div className="space-y-3">
                    {profile.civilIdBackImage && (
                      <div className="relative group">
                        <img
                          src={profile.civilIdBackImage}
                          alt="Civil ID Back"
                          className="w-full h-48 object-cover rounded-lg border-2 border-zinc-700"
                        />
                        <a
                          href={profile.civilIdBackImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                        >
                          {language === "ar" ? "عرض" : "View"}
                        </a>
                      </div>
                    )}
                    <label className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white hover:bg-zinc-800 transition-colors cursor-pointer">
                      {uploadingCivilIdBack ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{language === "ar" ? "جاري الرفع..." : "Uploading..."}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xl">🪪</span>
                          <span>{language === "ar" ? "رفع صورة الخلف" : "Upload Back"}</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCivilIdBackUpload}
                        disabled={uploadingCivilIdBack}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* License Front */}
                <div>
                  <label className="block text-gray-400 mb-2 text-sm">
                    {language === "ar" ? "الرخصة - الأمام" : "License - Front"}
                  </label>
                  <div className="space-y-3">
                    {profile.licenseFrontImage && (
                      <div className="relative group">
                        <img
                          src={profile.licenseFrontImage}
                          alt="License Front"
                          className="w-full h-48 object-cover rounded-lg border-2 border-zinc-700"
                        />
                        <a
                          href={profile.licenseFrontImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                        >
                          {language === "ar" ? "عرض" : "View"}
                        </a>
                      </div>
                    )}
                    <label className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white hover:bg-zinc-800 transition-colors cursor-pointer">
                      {uploadingLicenseFront ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{language === "ar" ? "جاري الرفع..." : "Uploading..."}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xl">📄</span>
                          <span>{language === "ar" ? "رفع صورة الأمام" : "Upload Front Image"}</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLicenseFrontUpload}
                        disabled={uploadingLicenseFront}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* License Back */}
                <div>
                  <label className="block text-gray-400 mb-2 text-sm">
                    {language === "ar" ? "الرخصة - الخلف" : "License - Back"}
                  </label>
                  <div className="space-y-3">
                    {profile.licenseBackImage && (
                      <div className="relative group">
                        <img
                          src={profile.licenseBackImage}
                          alt="License Back"
                          className="w-full h-48 object-cover rounded-lg border-2 border-zinc-700"
                        />
                        <a
                          href={profile.licenseBackImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                        >
                          {language === "ar" ? "عرض" : "View"}
                        </a>
                      </div>
                    )}
                    <label className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white hover:bg-zinc-800 transition-colors cursor-pointer">
                      {uploadingLicenseBack ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{language === "ar" ? "جاري الرفع..." : "Uploading..."}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xl">📄</span>
                          <span>{language === "ar" ? "رفع صورة الخلف" : "Upload Back Image"}</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLicenseBackUpload}
                        disabled={uploadingLicenseBack}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Password Change Section */}
            <div className="pt-6 border-t border-zinc-800 space-y-4">
              <h3 className="text-lg font-bold text-white">
                🔒 {language === "ar" ? "تغيير كلمة المرور (اختياري)" : "Change Password (Optional)"}
              </h3>
                
                <div>
                  <label className="block text-gray-400 mb-2 text-sm">
                    {language === "ar" ? "كلمة المرور الحالية" : "Current Password"}
                  </label>
                  <input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
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
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-2 text-sm">
                    {language === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
                  />
                </div>
              </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {language === "ar" ? "جاري الحفظ..." : "Saving..."}
                  </span>
                ) : (
                  <>💾 {language === "ar" ? "حفظ التغييرات" : "Save Changes"}</>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Role Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-center"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg text-gray-400">
            {profile.role === "admin" ? "👑" : "🏁"}
            {language === "ar" 
              ? profile.role === "admin" ? "مدير" : "مارشال"
              : profile.role === "admin" ? "Admin" : "Marshal"
            }
          </span>
        </motion.div>
      </main>
    </div>
  )
}
