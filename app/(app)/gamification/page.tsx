"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Gift, Coins, Trophy, Star, Sparkles, RotateCw, CheckCircle2 } from "lucide-react"
import { useLang, useAuth, useNotifications } from "@/components/providers"
import { PageTransition, FadeIn } from "@/components/page-transition"

const BADGE_LIST = [
  { id: "early-adopter", name: "Early Adopter", desc: "Joined during launch", icon: Star },
  { id: "first-purchase", name: "First Purchase", desc: "Bought your first ticket", icon: Gift },
  { id: "streak-7", name: "7-Day Streak", desc: "Check in 7 days in a row", icon: Trophy },
  { id: "course-complete", name: "Scholar", desc: "Complete your first course", icon: Sparkles },
  { id: "big-spender", name: "Big Spender", desc: "Spend over $500", icon: Coins },
  { id: "social-star", name: "Social Star", desc: "Referred 5 friends", icon: Star },
]

const WHEEL_PRIZES = [10, 25, 5, 50, 15, 100, 20, 75]

export default function GamificationPage() {
  const { t } = useLang()
  const { user, updateUser } = useAuth()
  const { addNotification } = useNotifications()
  const [spinning, setSpinning] = useState(false)
  const [wheelResult, setWheelResult] = useState<number | null>(null)
  const [rotation, setRotation] = useState(0)

  const handleCheckIn = useCallback(() => {
    if (!user || user.checkedInToday) return
    updateUser({
      checkedInToday: true,
      coins: user.coins + 25,
    })
    addNotification("Daily check-in: +25 coins!")
  }, [user, updateUser, addNotification])

  const handleSpin = useCallback(() => {
    if (!user || spinning) return
    if (user.coins < 10) return

    updateUser({ coins: user.coins - 10 })
    setSpinning(true)
    setWheelResult(null)

    const prizeIndex = Math.floor(Math.random() * WHEEL_PRIZES.length)
    const prize = WHEEL_PRIZES[prizeIndex]
    const segmentAngle = 360 / WHEEL_PRIZES.length
    const targetAngle = 360 * 5 + (360 - prizeIndex * segmentAngle - segmentAngle / 2)

    setRotation(prev => prev + targetAngle)

    setTimeout(() => {
      updateUser({ coins: (user.coins - 10) + prize })
      setWheelResult(prize)
      setSpinning(false)
      addNotification(`Spin the wheel: You won ${prize} coins!`)
    }, 3500)
  }, [user, spinning, updateUser, addNotification])

  const userBadges = user?.badges ?? []

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10">
        <FadeIn>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground mb-2">
            {t("game.title")}
          </h1>
          <p className="text-muted-foreground mb-8">
            Earn coins, collect badges, and spin the wheel for rewards.
          </p>
        </FadeIn>

        {/* Coins Banner */}
        <FadeIn delay={0.05}>
          <div className="bg-gradient-to-r from-primary/15 via-card to-card border border-primary/20 rounded-2xl p-6 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-primary/20 flex items-center justify-center">
                <Coins className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("game.coins")}</p>
                <motion.p
                  key={user?.coins}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="font-display font-bold text-3xl text-foreground"
                >
                  {user?.coins ?? 0}
                </motion.p>
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p>Earn coins by:</p>
              <p>Check-ins, spins, purchases</p>
            </div>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Check-In */}
          <FadeIn delay={0.1}>
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-display font-semibold text-lg text-card-foreground mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                {t("game.dailyCheckIn")}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Check in daily to earn 25 coins. Build streaks for bonus rewards.
              </p>
              {user?.checkedInToday ? (
                <div className="py-3 text-center text-sm font-semibold text-green-500 bg-green-500/10 rounded-xl flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  {t("game.claimed")}
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckIn}
                  className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Gift className="h-4 w-4" />
                  {t("game.claim")} (+25 coins)
                </motion.button>
              )}
            </div>
          </FadeIn>

          {/* Spin the Wheel */}
          <FadeIn delay={0.15}>
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-display font-semibold text-lg text-card-foreground mb-4 flex items-center gap-2">
                <RotateCw className="h-5 w-5 text-primary" />
                {t("game.spin")}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Spend 10 coins to spin and win up to 100 coins!
              </p>

              {/* Wheel */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative h-48 w-48">
                  {/* Pointer */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[14px] border-l-transparent border-r-transparent border-t-primary" />
                  <motion.div
                    animate={{ rotate: rotation }}
                    transition={{ duration: 3.5, ease: [0.17, 0.67, 0.12, 0.99] }}
                    className="h-full w-full rounded-full border-4 border-border overflow-hidden relative"
                  >
                    {WHEEL_PRIZES.map((prize, i) => {
                      const angle = (i * 360) / WHEEL_PRIZES.length
                      const isEven = i % 2 === 0
                      return (
                        <div
                          key={i}
                          className="absolute inset-0 flex items-center justify-center"
                          style={{
                            transform: `rotate(${angle}deg)`,
                            clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((angle - 22.5) * Math.PI / 180)}% ${50 - 50 * Math.sin((angle - 22.5) * Math.PI / 180)}%, ${50 + 50 * Math.cos((angle + 22.5) * Math.PI / 180)}% ${50 - 50 * Math.sin((angle + 22.5) * Math.PI / 180)}%)`,
                          }}
                        >
                          <div className={`absolute inset-0 ${isEven ? "bg-primary/20" : "bg-muted/80"}`} />
                        </div>
                      )
                    })}
                    {/* Center labels */}
                    {WHEEL_PRIZES.map((prize, i) => {
                      const angle = (i * 360) / WHEEL_PRIZES.length + 360 / WHEEL_PRIZES.length / 2
                      const rad = (angle - 90) * (Math.PI / 180)
                      const x = 50 + 32 * Math.cos(rad)
                      const y = 50 + 32 * Math.sin(rad)
                      return (
                        <span
                          key={`l-${i}`}
                          className="absolute text-[10px] font-bold text-foreground"
                          style={{
                            left: `${x}%`,
                            top: `${y}%`,
                            transform: "translate(-50%, -50%)",
                          }}
                        >
                          {prize}
                        </span>
                      )
                    })}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-8 w-8 rounded-full bg-card border-2 border-border flex items-center justify-center">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                      </div>
                    </div>
                  </motion.div>
                </div>

                <AnimatePresence>
                  {wheelResult !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-center"
                    >
                      <p className="font-display font-bold text-xl text-primary">
                        +{wheelResult} coins!
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSpin}
                  disabled={spinning || (user?.coins ?? 0) < 10}
                  className="px-8 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {spinning ? "Spinning..." : `${t("game.spin")} (10 coins)`}
                </motion.button>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Badges */}
        <FadeIn delay={0.2}>
          <h2 className="font-display font-bold text-xl text-foreground mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            {t("game.badges")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {BADGE_LIST.map((badge) => {
              const earned = userBadges.includes(badge.id)
              const Icon = badge.icon
              return (
                <div
                  key={badge.id}
                  className={`bg-card border rounded-xl p-4 flex flex-col items-center text-center transition-colors ${
                    earned ? "border-primary/30 bg-primary/5" : "border-border opacity-50"
                  }`}
                >
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-3 ${
                    earned ? "bg-primary/20" : "bg-muted"
                  }`}>
                    <Icon className={`h-6 w-6 ${earned ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <p className="font-semibold text-sm text-card-foreground">{badge.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{badge.desc}</p>
                  {earned && (
                    <span className="mt-2 text-[10px] font-bold uppercase text-primary tracking-wider">
                      Earned
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </FadeIn>
      </div>
    </PageTransition>
  )
}
