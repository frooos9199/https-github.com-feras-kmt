"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"

export default function Home() {
  const { t, language, setLanguage } = useLanguage()

  return (
    <div className="min-h-screen bg-black">
      {/* Language Toggle Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-6 right-6 z-50"
      >
        <button
          onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all backdrop-blur-sm border border-white/20 shadow-lg"
        >
          <span className="text-lg">🌐</span>
          <span>{language === "ar" ? "English" : "العربية"}</span>
        </button>
      </motion.div>

      {/* Hero Section with Video Background */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Gradient Only */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black z-10" />
          <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950 to-black" />
        </div>

        {/* Content */}
        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* KMT Animated Logo */}
            <div className="flex justify-center mb-6">
              <motion.img
                src="/kmt-loading.gif"
                alt="KMT Logo"
                className="w-48 h-48 md:w-64 md:h-64"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              />
            </div>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-2 tracking-wider">
              KUWAIT MOTOR TOWN
            </p>
            <p className="text-lg md:text-xl text-gray-400 mb-8">
              {t("marshalManagementSystem")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-lg transition-colors shadow-lg shadow-red-600/50"
                >
                  {t("signUp")}
                </motion.button>
              </Link>
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg text-lg transition-colors backdrop-blur-sm border border-white/20"
                >
                  {t("login")}
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        >
          <div className="flex flex-col items-center">
            <p className="text-gray-400 text-sm mb-2">
              {t("scrollDown")}
            </p>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-2"
            >
              <div className="w-1 h-3 bg-white/50 rounded-full" />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 bg-zinc-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              {t("aboutTheSystem")}
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {language === "ar"
                ? "نظام متقدم لإدارة المارشال في الفعاليات والسباقات بمدينة الكويت لرياضة المحركات"
                : "Advanced marshal management system for events and races at Kuwait Motor Town"}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🏁",
                titleEn: "Event Registration",
                titleAr: "تسجيل في الفعاليات",
                descEn: "Easy registration for upcoming races and track days",
                descAr: "تسجيل سهل في السباقات والفعاليات القادمة"
              },
              {
                icon: "📊",
                titleEn: "Track Attendance",
                titleAr: "متابعة الحضور",
                descEn: "Monitor your attendance history and statistics",
                descAr: "تابع سجل حضورك وإحصائياتك"
              },
              {
                icon: "⚡",
                titleEn: "Real-time Updates",
                titleAr: "تحديثات فورية",
                descEn: "Get instant notifications about new events",
                descAr: "احصل على إشعارات فورية عن الفعاليات الجديدة"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-black/50 border border-red-600/30 rounded-xl p-6 hover:border-red-600 transition-colors"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {language === "ar" ? feature.titleAr : feature.titleEn}
                </h3>
                <p className="text-gray-400">
                  {language === "ar" ? feature.descAr : feature.descEn}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-zinc-900 to-black">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl font-bold text-white mb-6">
            {t("readyToGetStarted")}
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            {language === "ar"
              ? "انضم إلى فريق المارشال وكن جزءاً من أفضل الفعاليات الرياضية"
              : "Join the marshal team and be part of the best motorsport events"}
          </p>
          <Link href="/signup">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xl transition-colors shadow-lg shadow-red-600/50"
            >
              🏁 {t("registerNow")}
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 bg-black border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p className="mb-1">
            {t("allRightsReserved")}
          </p>
          <p>
            {t("designedAndDevelopedBy")}
            <a 
              href="https://nexdev-portfolio-one.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-red-500 hover:text-red-400 transition-colors"
            >
              NexDev
            </a>
            {" | "}
            <a 
              href="https://wa.me/96550540999" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              +965 5054 0999
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}

