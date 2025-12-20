"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/LanguageContext"

export default function LoginPage() {
  const router = useRouter()
  const { t, language } = useLanguage()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      setError("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center">
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
        {/* Fallback background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-red-900" />
      </div>

      {/* Login Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 w-full max-w-md mx-4"
      >
        <div className="bg-black/80 backdrop-blur-lg border border-red-600/30 rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <img src="/kmt-logo-main.png" alt="KMT" className="h-20 w-auto mx-auto mb-3 rounded" />
            <p className="text-red-500 text-sm tracking-widest">MARSHAL SYSTEM</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t("email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                placeholder="marshal@kmt.kw"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t("password")}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {language === "ar" ? "جاري التحميل..." : "Loading..."}
                </>
              ) : (
                <>
                  🏁 {t("login")}
                </>
              )}
            </button>
          </form>

          {/* Forgot Password & Sign Up Links */}
          <div className="mt-6 text-center space-y-2">
            <div className="text-gray-400">
              <Link href="/forgot-password" className="text-red-500 hover:text-red-400 font-semibold">
                {language === "ar" ? "نسيت كلمة المرور؟" : "Forgot Password?"}
              </Link>
            </div>
            <div className="text-gray-400">
              {language === "ar" ? "ليس لديك حساب؟" : "Don't have an account?"}{" "}
              <Link href="/signup" className="text-red-500 hover:text-red-400 font-semibold">
                {t("signup")}
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-red-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-red-600/20 rounded-full blur-3xl" />
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
