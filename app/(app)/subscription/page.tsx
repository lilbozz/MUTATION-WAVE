"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Crown, Star, Zap, X, AlertTriangle } from "lucide-react"
import { useLang, useAuth, useWallet, useNotifications } from "@/components/providers"
import type { Tier } from "@/lib/store"
import { PageTransition, FadeIn } from "@/components/page-transition"

const PLANS: {
  tier: Tier
  price: number
  icon: typeof Crown
  features: string[]
}[] = [
  {
    tier: "free",
    price: 0,
    icon: Star,
    features: [
      "Access free courses",
      "Browse all events",
      "Community access",
      "Basic profile",
    ],
  },
  {
    tier: "member",
    price: 9.99,
    icon: Zap,
    features: [
      "All Free features",
      "Access Member courses",
      "Priority event booking",
      "Monthly coin bonus (50)",
      "Exclusive badges",
      "Artist Q&A access",
    ],
  },
  {
    tier: "pro",
    price: 24.99,
    icon: Crown,
    features: [
      "All Member features",
      "Access ALL courses",
      "VIP event access",
      "Monthly coin bonus (200)",
      "Exclusive Pro badges",
      "1-on-1 artist sessions",
      "Early access to drops",
      "Dashboard analytics",
    ],
  },
]

const TIER_ORDER: Tier[] = ["free", "member", "pro"]

export default function SubscriptionPage() {
  const { t } = useLang()
  const { user, upgradeTier, updateUser } = useAuth()
  const { addTransaction } = useWallet()
  const { addNotification } = useNotifications()

  const [confirmPlan, setConfirmPlan] = useState<(typeof PLANS)[number] | null>(null)
  const userTier = user?.tier ?? "free"

  function handleUpgrade(plan: (typeof PLANS)[number]) {
    if (!user) return
    const tierIdx = TIER_ORDER.indexOf(plan.tier)
    const currentIdx = TIER_ORDER.indexOf(userTier)
    if (tierIdx <= currentIdx) return

    if (plan.price > 0 && user.walletBalance < plan.price) return

    if (plan.price > 0) {
      updateUser({ walletBalance: user.walletBalance - plan.price })
      addTransaction({
        id: `tx-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        description: `Subscription upgrade to ${plan.tier.charAt(0).toUpperCase() + plan.tier.slice(1)}`,
        amount: plan.price,
        type: "debit",
      })
    }

    upgradeTier(plan.tier)
    addNotification(`You upgraded to ${plan.tier.charAt(0).toUpperCase() + plan.tier.slice(1)} plan!`)
  }

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10">
        <FadeIn>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground mb-2 text-center">
            {t("sub.title")}
          </h1>
          <p className="text-muted-foreground text-center mb-12">
            Unlock premium content and exclusive experiences.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => {
            const isCurrent = userTier === plan.tier
            const canUpgrade = TIER_ORDER.indexOf(plan.tier) > TIER_ORDER.indexOf(userTier)
            const isPro = plan.tier === "pro"
            const Icon = plan.icon

            return (
              <FadeIn key={plan.tier} delay={i * 0.1}>
                <motion.div
                  whileHover={canUpgrade ? { scale: 1.02, y: -4 } : {}}
                  className={`relative bg-card border rounded-2xl p-6 flex flex-col ${
                    isPro
                      ? "border-primary/50 shadow-lg shadow-primary/5"
                      : isCurrent
                        ? "border-primary/30"
                        : "border-border"
                  }`}
                >
                  {isPro && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-[10px] font-bold uppercase rounded-full tracking-wider">
                      Popular
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                      isPro ? "bg-primary/20" : "bg-muted"
                    }`}>
                      <Icon className={`h-5 w-5 ${isPro ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-card-foreground">
                        {t(`sub.${plan.tier}`)}
                      </h3>
                    </div>
                  </div>

                  <div className="mb-6">
                    <span className="font-display font-bold text-3xl text-card-foreground">
                      ${plan.price}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-sm text-muted-foreground">{t("sub.monthly")}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2.5 mb-6 flex-1">
                    {plan.features.map((feat, fi) => (
                      <div key={fi} className="flex items-start gap-2">
                        <Check className={`h-4 w-4 mt-0.5 shrink-0 ${isPro ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="text-sm text-card-foreground">{feat}</span>
                      </div>
                    ))}
                  </div>

                  {isCurrent ? (
                    <div className="py-2.5 text-center text-sm font-semibold text-primary bg-primary/10 rounded-xl">
                      {t("sub.current")}
                    </div>
                  ) : canUpgrade ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setConfirmPlan(plan)}
                      disabled={plan.price > 0 && (user?.walletBalance ?? 0) < plan.price}
                      className={`w-full py-2.5 font-semibold rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        isPro
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-surface border border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      {t("sub.upgrade")} - ${plan.price}{t("sub.monthly")}
                    </motion.button>
                  ) : (
                    <div className="py-2.5 text-center text-sm text-muted-foreground">
                      Included in your plan
                    </div>
                  )}
                </motion.div>
              </FadeIn>
            )
          })}
        </div>

        {/* Balance reminder */}
        <FadeIn delay={0.3}>
          <div className="mt-8 text-center text-xs text-muted-foreground">
            Wallet balance: <span className="font-semibold text-foreground">${user?.walletBalance ?? 0}</span>
            {" "}&middot;{" "}
            Subscriptions are charged from your wallet.
          </div>
        </FadeIn>
      </div>

      {/* Upgrade Confirmation Modal */}
      <AnimatePresence>
        {confirmPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setConfirmPlan(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 text-center">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display font-bold text-lg text-card-foreground mb-2">
                  Confirm Upgrade
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Upgrade to <span className="font-semibold text-foreground">{confirmPlan.tier.charAt(0).toUpperCase() + confirmPlan.tier.slice(1)}</span> for <span className="font-semibold text-primary">${confirmPlan.price}/mo</span>? This will be charged from your wallet balance.
                </p>
              </div>
              <div className="flex border-t border-border">
                <button
                  onClick={() => setConfirmPlan(null)}
                  className="flex-1 py-3 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <div className="w-px bg-border" />
                <button
                  onClick={() => { handleUpgrade(confirmPlan); setConfirmPlan(null) }}
                  className="flex-1 py-3 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
                >
                  Upgrade Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  )
}
