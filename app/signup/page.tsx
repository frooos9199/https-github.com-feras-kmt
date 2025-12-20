"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/LanguageContext"

export default function SignupPage() {
  const router = useRouter()
  const { t, language } = useLanguage()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    civilId: "",
    dateOfBirth: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z\d]/.test(password)) strength++
    return strength
  }

  const getPasswordStrengthText = (strength: number) => {
    if (strength <= 1) return { text: "Weak", color: "text-red-500" }
    if (strength <= 3) return { text: "Medium", color: "text-yellow-500" }
    return { text: "Strong", color: "text-green-500" }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    // Phone validation (Kuwaiti format)
    const phoneRegex = /^(\+965|00965|965)?[569]\d{7}$/
    if (!formData.phone) {
      newErrors.phone = "Phone number is required"
    } else if (!phoneRegex.test(formData.phone.replace(/\s+/g, ''))) {
      newErrors.phone = "Please enter a valid Kuwaiti phone number"
    }

    // Civil ID validation (optional but if provided, must be valid)
    if (formData.civilId && !/^\d{12}$/.test(formData.civilId)) {
      newErrors.civilId = "Civil ID must be 12 digits"
    }

    // Date of birth validation (optional but if provided, must be reasonable)
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      
      if (isNaN(birthDate.getTime())) {
        newErrors.dateOfBirth = "Please enter a valid date"
      } else if (age < 16) {
        newErrors.dateOfBirth = "You must be at least 16 years old"
      } else if (age > 100) {
        newErrors.dateOfBirth = "Please enter a valid date of birth"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // Special handling for civil ID - only allow numbers
    if (name === 'civilId') {
      const numericValue = value.replace(/\D/g, '')
      setFormData({ ...formData, [name]: numericValue })
    } else {
      setFormData({ ...formData, [name]: value })
    }
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const submitData = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        phone: formData.phone.replace(/\s+/g, ''),
        ...(formData.civilId && { civilId: formData.civilId }),
        ...(formData.dateOfBirth && { dateOfBirth: formData.dateOfBirth }),
      }

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error?.includes("Email already registered")) {
          setErrors({ email: "This email is already registered" })
        } else {
          setErrors({ general: data.error || "Something went wrong" })
        }
        return
      }

      router.push("/login")
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setErrors({ general: "Network error. Please check your connection and try again." })
      } else {
        setErrors({ general: "An unexpected error occurred. Please try again." })
      }
    } finally {
      setIsLoading(false)
    }
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

      {/* Signup Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 w-full max-w-md mx-4"
      >
        <div className="bg-black/80 backdrop-blur-lg border border-red-600/30 rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-6">
            <img src="/kmt-logo-main.png" alt="KMT" className="h-16 w-auto mx-auto mb-3 rounded" />
            <p className="text-red-500 text-sm tracking-widest">MARSHAL REGISTRATION</p>
          </div>

          {/* General Error Message */}
          {errors.general && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6 text-sm">
              {errors.general}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <fieldset className="space-y-4">
              <legend className="sr-only">Registration Information</legend>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                {t("name")}
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-zinc-900/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors text-sm ${
                  errors.name ? 'border-red-500' : 'border-zinc-700'
                }`}
                placeholder="Enter your full name"
                aria-describedby={errors.name ? "name-error" : undefined}
                aria-invalid={!!errors.name}
                required
              />
              {errors.name && (
                <p id="name-error" className="text-red-500 text-xs mt-1" role="alert">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                {t("email")}
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-zinc-900/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors text-sm ${
                  errors.email ? 'border-red-500' : 'border-zinc-700'
                }`}
                placeholder="your@email.com"
                autoComplete="email"
                aria-describedby={errors.email ? "email-error" : undefined}
                aria-invalid={!!errors.email}
                required
              />
              {errors.email && (
                <p id="email-error" className="text-red-500 text-xs mt-1" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                {t("password")}
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-zinc-900/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors text-sm ${
                  errors.password ? 'border-red-500' : 'border-zinc-700'
                }`}
                placeholder="Create a strong password"
                autoComplete="new-password"
                aria-describedby={errors.password ? "password-error" : formData.password ? "password-strength" : undefined}
                aria-invalid={!!errors.password}
                required
              />
              {formData.password && !errors.password && (
                <div className="mt-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-zinc-700 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full transition-all ${
                          getPasswordStrength(formData.password) <= 1 ? 'bg-red-500 w-1/4' :
                          getPasswordStrength(formData.password) <= 3 ? 'bg-yellow-500 w-3/4' :
                          'bg-green-500 w-full'
                        }`}
                      />
                    </div>
                    <span className={`text-xs ${getPasswordStrengthText(getPasswordStrength(formData.password)).color}`}>
                      {getPasswordStrengthText(getPasswordStrength(formData.password)).text}
                    </span>
                  </div>
                </div>
              )}
              {errors.password && (
                <p id="password-error" className="text-red-500 text-xs mt-1" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-zinc-900/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors text-sm ${
                  errors.confirmPassword ? 'border-red-500' : 'border-zinc-700'
                }`}
                placeholder="Confirm your password"
                autoComplete="new-password"
                required
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {t("phone")}
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-zinc-900/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors text-sm ${
                  errors.phone ? 'border-red-500' : 'border-zinc-700'
                }`}
                placeholder="+965 9999 9999"
                autoComplete="tel"
                required
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {t("civilId")} <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                name="civilId"
                value={formData.civilId}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-zinc-900/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors text-sm ${
                  errors.civilId ? 'border-red-500' : 'border-zinc-700'
                }`}
                placeholder="12-digit Civil ID"
                maxLength={12}
              />
              {errors.civilId && (
                <p className="text-red-500 text-xs mt-1">{errors.civilId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {t("dateOfBirth")} <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-zinc-900/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors text-sm ${
                  errors.dateOfBirth ? 'border-red-500' : 'border-zinc-700'
                }`}
                max={new Date(Date.now() - 16 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              />
              {errors.dateOfBirth && (
                <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              aria-describedby={isLoading ? "loading-status" : undefined}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <>
                  <div 
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                    aria-hidden="true"
                  />
                  <span id="loading-status">
                    {language === "ar" ? "جاري التسجيل..." : "Registering..."}
                  </span>
                </>
              ) : (
                <>
                  <span aria-hidden="true">🏁</span> {t("signup")}
                </>
              )}
            </button>
            </fieldset>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-gray-400 text-sm">
            {language === "ar" ? "لديك حساب؟" : "Already have an account?"}{" "}
            <Link href="/login" className="text-red-500 hover:text-red-400 font-semibold">
              {t("login")}
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
