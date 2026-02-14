"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Search } from "lucide-react"

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 40%, hsl(var(--primary) / 0.3) 0%, transparent 60%)",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative text-center max-w-md"
      >
        <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
          <Search className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="font-display font-bold text-6xl text-foreground mb-2">404</h1>
        <h2 className="font-display font-semibold text-xl text-foreground mb-3">
          Page Not Found
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/home"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </motion.div>
    </div>
  )
}
