"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          return 100
        }
        return prev + 2
      })
    }, 30)

    return () => clearInterval(timer)
  }, [])

  const rotation = (progress / 100) * 270 - 135 // -135 to 135 degrees

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
    >
      <div className="flex flex-col items-center gap-8">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold text-white mb-2">KMT</h1>
          <p className="text-red-500 text-sm tracking-widest">MARSHAL SYSTEM</p>
        </motion.div>

        {/* RPM Gauge */}
        <div className="relative w-64 h-64">
          {/* Gauge Background */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            {/* Background Arc */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#1a1a1a"
              strokeWidth="12"
              strokeDasharray="502.65"
              strokeDashoffset="125.66"
            />
            
            {/* Progress Arc */}
            <motion.circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#DC2626"
              strokeWidth="12"
              strokeDasharray="502.65"
              strokeDashoffset={502.65 - (502.65 * 0.75 * progress) / 100}
              strokeLinecap="round"
              initial={{ strokeDashoffset: 502.65 }}
              animate={{ strokeDashoffset: 502.65 - (502.65 * 0.75 * progress) / 100 }}
              transition={{ duration: 0.3 }}
            />
          </svg>

          {/* Needle */}
          <motion.div
            className="absolute top-1/2 left-1/2 w-1 h-20 bg-white origin-bottom"
            style={{
              transformOrigin: "bottom center",
              bottom: "50%",
              left: "50%",
              marginLeft: "-2px"
            }}
            animate={{ rotate: rotation }}
            transition={{ duration: 0.3 }}
          />

          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-16 h-16 rounded-full bg-zinc-900 border-4 border-red-600 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{progress}</div>
                <div className="text-xs text-gray-400">RPM</div>
              </div>
            </div>
          </div>

          {/* RPM Markers */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full">
              {[0, 2, 4, 6, 8].map((num, i) => {
                const angle = -135 + (i * 67.5)
                const radian = (angle * Math.PI) / 180
                const x = 100 + 90 * Math.cos(radian)
                const y = 100 + 90 * Math.sin(radian)
                
                return (
                  <div
                    key={num}
                    className="absolute text-xs text-gray-500 font-bold"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: "translate(-50%, -50%)"
                    }}
                  >
                    {num}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white text-lg"
        >
          Loading...
        </motion.div>
      </div>
    </motion.div>
  )
}
