"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/LanguageContext"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, language } = useLanguage()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [token, setToken] = useState("")
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
      validateToken(tokenParam)
    } else {
      setIsValidToken(false)
    }
  }, [searchParams])

  const validateToken = async (token: string) => {
    try {
      const res = await fetch(`/api/auth/validate-reset-token?token=${token}`)
      setIsValidToken(res.ok)
    } catch (error) {
      setIsValidToken(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError(language === "ar" ? "كلمات المرور غير متطابقة" : "Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError(language === "ar" ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong")
      }

      setIsSuccess(true)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isValidToken === false) {
    return (
      <div className="min-h-screen relative flex items-center justify-center py-12">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/70 z-10" />
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/videos/marshal-bg.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-red-900" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-20 w-full max-w-md mx-4"
        >
          <div className="bg-black/80 backdrop-blur-lg border border-red-600/30 rounded-2xl p-8 shadow-2xl text-center">
            <div className="text-red-400 mb-6">
              <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {language === "ar" ? "رابط غير صالح" : "Invalid Link"}
              </h3>
              <p className="text-gray-300">
                {language === "ar"
                  ? "رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية"
                  : "Password reset link is invalid or has expired"
                }
              </p>
            </div>

            <Link
              href="/forgot-password"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors inline-block text-center"
            >
              {language === "ar" ? "طلب رابط جديد" : "Request New Link"}
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  if (isValidToken === null) {
    return (
      <div className="min-h-screen relative flex items-center justify-center py-12">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/70 z-10" />
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/videos/marshal-bg.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-red-900" />
        </div>

        <div className="relative z-20 w-full max-w-md mx-4">
          <div className="bg-black/80 backdrop-blur-lg border border-red-600/30 rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300">
              {language === "ar" ? "جاري التحقق من الرابط..." : "Validating link..."}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen relative flex items-center justify-center py-12">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/70 z-10" />
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/videos/marshal-bg.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-red-900" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-20 w-full max-w-md mx-4"
        >
          <div className="bg-black/80 backdrop-blur-lg border border-green-600/30 rounded-2xl p-8 shadow-2xl text-center">
            <div className="text-green-400 mb-6">
              <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {language === "ar" ? "تم تحديث كلمة المرور" : "Password Updated"}
              </h3>
              <p className="text-gray-300">
                {language === "ar"
                  ? "تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول"
                  : "Your password has been successfully updated. You can now log in"
                }
              </p>
            </div>

            <Link
              href="/login"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors inline-block text-center"
            >
              {language === "ar" ? "تسجيل الدخول" : "Login"}
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/70 z-10" />
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videos/marshal-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-red-900" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 w-full max-w-md mx-4"
      >
        <div className="bg-black/80 backdrop-blur-lg border border-red-600/30 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <img src="/kmt-logo-main.png" alt="KMT" className="h-16 w-auto mx-auto mb-3 rounded" />
            <p className="text-red-500 text-sm tracking-widest">RESET PASSWORD</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {language === "ar" ? "كلمة المرور الجديدة" : "New Password"}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-900/50 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors text-sm"
                placeholder={language === "ar" ? "أدخل كلمة المرور الجديدة" : "Enter new password"}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {language === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-900/50 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors text-sm"
                placeholder={language === "ar" ? "أعد إدخال كلمة المرور" : "Re-enter password"}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {language === "ar" ? "جاري التحديث..." : "Updating..."}
                </>
              ) : (
                <>
                  🔑 {language === "ar" ? "تحديث كلمة المرور" : "Update Password"}
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}