"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/LanguageContext"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { t, language } = useLanguage()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.code === "EMAIL_NOT_REGISTERED") {
          throw new Error(data.error)
        }
        throw new Error(data.error || "Something went wrong")
      }

      setIsSuccess(true)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen relative flex items-center justify-center py-12">
        {/* Video Background */}
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

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-20 w-full max-w-md mx-4"
        >
          <div className="bg-black/80 backdrop-blur-lg border border-green-600/30 rounded-2xl p-8 shadow-2xl text-center">
            {/* Logo */}
            <div className="text-center mb-6">
              <img src="/kmt-logo-main.png" alt="KMT" className="h-16 w-auto mx-auto mb-3 rounded" />
              <p className="text-green-500 text-sm tracking-widest">PASSWORD RESET</p>
            </div>

            <div className="text-green-400 mb-6">
              <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {language === "ar" ? "تم إرسال رابط إعادة التعيين" : "Reset Link Sent"}
              </h3>
              <p className="text-gray-300">
                {language === "ar"
                  ? "تحقق من بريدك الإلكتروني واتبع التعليمات لإعادة تعيين كلمة المرور"
                  : "Check your email and follow the instructions to reset your password"
                }
              </p>
            </div>

            <button
              onClick={() => router.push("/login")}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              {language === "ar" ? "العودة لتسجيل الدخول" : "Back to Login"}
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12">
      {/* Video Background */}
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

      {/* Forgot Password Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 w-full max-w-md mx-4"
      >
        <div className="bg-black/80 backdrop-blur-lg border border-red-600/30 rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-6">
            <img src="/kmt-logo-main.png" alt="KMT" className="h-16 w-auto mx-auto mb-3 rounded" />
            <p className="text-red-500 text-sm tracking-widest">FORGOT PASSWORD</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {t("email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-900/50 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors text-sm"
                placeholder="your@email.com"
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
                  {language === "ar" ? "جاري الإرسال..." : "Sending..."}
                </>
              ) : (
                <>
                  📧 {language === "ar" ? "إرسال رابط إعادة التعيين" : "Send Reset Link"}
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center text-gray-400 text-sm">
            <Link href="/login" className="text-red-500 hover:text-red-400 font-semibold">
              {language === "ar" ? "العودة لتسجيل الدخول" : "Back to Login"}
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-gray-600 text-xs">
        <p>
          © 2025 Developed by{" "}
          <a
            href="https://nexdev-portfolio-one.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-500 hover:text-red-400 transition-colors"
          >
            NexDev
          </a>
          {" "}| +965 5054 0999
        </p>
      </div>
    </div>
  )
}