"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, RotateCcw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to monitoring service (no stack traces exposed to user)
    console.error("[MW] Application error:", error.digest || error.message)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 40%, hsl(0 84% 60% / 0.2) 0%, transparent 60%)",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative text-center max-w-md"
      >
        <div className="h-20 w-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="font-display font-bold text-6xl text-foreground mb-2">500</h1>
        <h2 className="font-display font-semibold text-xl text-foreground mb-3">
          Something Went Wrong
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          An unexpected error occurred. Our team has been notified. Please try again.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors text-sm"
        >
          <RotateCcw className="h-4 w-4" />
          Try Again
        </button>
      </motion.div>
    </div>
  )
}
