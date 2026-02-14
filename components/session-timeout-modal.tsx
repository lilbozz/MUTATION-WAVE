"use client"

import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, LogOut } from "lucide-react"
import { useAuth } from "@/components/providers"

export function SessionTimeoutModal() {
  const { sessionTimedOut, dismissSessionTimeout } = useAuth()
  const router = useRouter()

  function handleSignIn() {
    dismissSessionTimeout()
    router.replace("/auth")
  }

  return (
    <AnimatePresence>
      {sessionTimedOut && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-xl flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
            className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center"
          >
            <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <Clock className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="font-display font-bold text-xl text-card-foreground mb-2">
              Session Expired
            </h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Your session has expired due to 30 minutes of inactivity. Please sign in again to continue.
            </p>
            <button
              onClick={handleSignIn}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign In Again
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
