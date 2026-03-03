"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { supabase } from "@/lib/supabase"

const inputClass =
  "w-full px-4 py-3 bg-[#141417] border border-[#1C1C22] rounded-xl text-[#F5F5F7] placeholder:text-[#F5F5F7]/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!email.trim()) {
      setError("Please enter your email address.")
      return
    }
    setLoading(true)
    const { error: authError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${window.location.origin}/reset-password` }
    )
    setLoading(false)
    if (authError) {
      setError(authError.message)
      return
    }
    setSuccess(true)
  }

  return (
    <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center px-6">
      <div
        className="fixed inset-0 opacity-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 50%, hsl(217 91% 60% / 0.2) 0%, transparent 60%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center mb-4">
            <span className="font-display font-bold text-lg text-primary-foreground">MW</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#F5F5F7] text-center">
            Reset password
          </h1>
          <p className="text-[#F5F5F7]/50 text-sm mt-2 text-center">
            We&apos;ll send you a reset link
          </p>
        </div>

        {success ? (
          <div className="flex flex-col gap-6">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-6 py-4 text-center">
              <p className="text-sm text-green-400 font-medium">
                Check your email for a password reset link.
              </p>
            </div>
            <Link
              href="/login"
              className="w-full py-3 bg-[#141417] border border-[#1C1C22] text-[#F5F5F7]/70 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 hover:text-[#F5F5F7] transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#F5F5F7]/70 uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError("") }}
                  placeholder="you@example.com"
                  className={inputClass}
                  autoComplete="email"
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl transition-all mt-1 flex items-center justify-center gap-2 disabled:opacity-60 text-sm hover:opacity-90"
              >
                {loading ? <Spinner /> : <>Send reset link <ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>

            <p className="text-center text-sm text-[#F5F5F7]/40 mt-6">
              <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  )
}

function Spinner() {
  return (
    <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
  )
}
