"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Zap, Crown, X, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/providers"
import { PLAN_DEFINITIONS } from "@/lib/store"

export function UpgradeModal() {
  const { showUpgradeModal, setShowUpgradeModal, user, usage } = useAuth()

  if (!user) return null

  const currentPlan = PLAN_DEFINITIONS[user.tier]
  const nextTier = user.tier === "free" ? "member" : "pro"
  const nextPlan = PLAN_DEFINITIONS[nextTier]

  return (
    <AnimatePresence>
      {showUpgradeModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowUpgradeModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
            className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative p-6 pb-4 border-b border-border">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="absolute top-4 right-4 h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display font-bold text-xl text-card-foreground">
                Upgrade Required
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {user.tier === "free"
                  ? "Your Free plan has 0 mutations. Upgrade to unlock this feature."
                  : `You've reached your ${currentPlan.name} plan limit. Upgrade to continue.`
                }
              </p>
            </div>

            {/* Usage Summary */}
            {usage && (
              <div className="px-6 py-4 bg-muted/30">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-lg font-bold text-card-foreground">{usage.mutationsUsed}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">
                      {currentPlan.mutationLimit === 0 ? "of 0" : currentPlan.mutationLimit === -1 ? "used" : `of ${currentPlan.mutationLimit}`}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Mutations</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-card-foreground">{usage.uploadsUsed}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">
                      {currentPlan.uploadLimit === -1 ? "used" : `of ${currentPlan.uploadLimit}`}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Uploads</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-card-foreground">{usage.storageUsedMb.toFixed(0)}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">
                      {currentPlan.storageLimitMb === -1 ? "MB used" : `of ${currentPlan.storageLimitMb} MB`}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Storage</p>
                  </div>
                </div>
              </div>
            )}

            {/* Upgrade CTA */}
            <div className="p-6">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 mb-4">
                <Crown className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-card-foreground">{nextPlan.name} Plan</p>
                  <p className="text-xs text-muted-foreground">
                    {nextPlan.mutationLimit === -1 ? "Unlimited" : nextPlan.mutationLimit} mutations,{" "}
                    {nextPlan.uploadLimit === -1 ? "Unlimited" : nextPlan.uploadLimit} uploads,{" "}
                    {nextPlan.storageLimitMb === -1 ? "Unlimited" : `${(nextPlan.storageLimitMb / 1024).toFixed(0)} GB`} storage
                  </p>
                </div>
                <span className="text-sm font-bold text-primary">${nextPlan.priceMonthly}/mo</span>
              </div>

              <Link
                href="/subscription"
                onClick={() => setShowUpgradeModal(false)}
                className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors text-sm"
              >
                View Plans
                <ArrowRight className="h-4 w-4" />
              </Link>

              <button
                onClick={() => setShowUpgradeModal(false)}
                className="w-full mt-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
