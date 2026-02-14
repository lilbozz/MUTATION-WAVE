"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { getUser } from "@/lib/store"
import { useLang } from "@/components/providers"

export default function IntroPage() {
  const router = useRouter()
  const { t } = useLang()
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1400),
      setTimeout(() => setPhase(4), 1800),
      setTimeout(() => setPhase(5), 2500),
      setTimeout(() => {
        const user = getUser()
        router.replace(user ? "/home" : "/auth")
      }, 3200),
    ]
    return () => timers.forEach(clearTimeout)
  }, [router])

  return (
    <div className="fixed inset-0 bg-[#0B0B0D] flex items-center justify-center overflow-hidden">
      {/* Ambient background */}
      <AnimatePresence>
        {phase >= 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse at center, hsl(217 91% 60% / 0.3) 0%, transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

      <div className="relative flex flex-col items-center gap-6">
        {/* Logo */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center"
            >
              {/* Logo mark */}
              <motion.div
                animate={phase >= 3 ? {
                  boxShadow: [
                    "0 0 0 0 hsl(217 91% 60% / 0)",
                    "0 0 40px 8px hsl(217 91% 60% / 0.3)",
                    "0 0 0 0 hsl(217 91% 60% / 0)",
                  ],
                } : {}}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center mb-6"
              >
                <span className="font-display font-bold text-2xl text-primary-foreground">MW</span>
              </motion.div>

              <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-[#F5F5F7] tracking-tight text-center">
                MUTATION WAVE
              </h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tagline */}
        <AnimatePresence>
          {phase >= 4 && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-[#F5F5F7]/60 text-base sm:text-lg font-medium tracking-wide text-center"
            >
              {t("intro.tagline")}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Fade out overlay */}
        <AnimatePresence>
          {phase >= 5 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, ease: "easeIn" }}
              className="fixed inset-0 bg-[#0B0B0D] z-50"
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
