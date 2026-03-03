"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Eye, EyeOff, ArrowRight } from "lucide-react"
import { supabase } from "@/lib/supabase"

const inputClass =
  "w-full px-4 py-3 bg-[#141417] border border-[#1C1C22] rounded-xl text-[#F5F5F7] placeholder:text-[#F5F5F7]/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm"

function getPasswordErrors(password: string): string[] {
  const errors: string[] = []
  if (password.length > 0 && password.length < 8) {
    errors.push("At least 8 characters")
  }
  if (password.length > 0 && !/\d/.test(password)) {
    errors.push("At least 1 number")
  }
  return errors
}

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const passwordErrors = getPasswordErrors(password)
  const confirmMismatch = confirm.length > 0 && confirm !== password

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!email.trim() || !password || !confirm) {
      setError("Please fill in all fields.")
      return
    }
    if (passwordErrors.length > 0) {
      setError("Password does not meet requirements.")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    const { error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    })
    setLoading(false)

    if (authError) {
      setError(authError.message)
      return
    }
    router.push("/dashboard")
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
            Create account
          </h1>
          <p className="text-[#F5F5F7]/50 text-sm mt-2 text-center">
            Join Mutation Wave
          </p>
        </div>

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
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#F5F5F7]/70 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError("") }}
                placeholder="••••••••"
                className={`${inputClass} pr-12`}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F5F5F7]/40 hover:text-[#F5F5F7]/70 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordErrors.length > 0 && (
              <ul className="flex flex-col gap-0.5 mt-1">
                {passwordErrors.map((msg) => (
                  <li key={msg} className="text-xs text-red-400">
                    {msg}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#F5F5F7]/70 uppercase tracking-wider">
              Confirm password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setError("") }}
                placeholder="••••••••"
                className={`${inputClass} pr-12`}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F5F5F7]/40 hover:text-[#F5F5F7]/70 transition-colors"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmMismatch && (
              <p className="text-xs text-red-400 mt-1">Passwords do not match.</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl transition-all mt-1 flex items-center justify-center gap-2 disabled:opacity-60 text-sm hover:opacity-90"
          >
            {loading ? <Spinner /> : <>Create account <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>

        <p className="text-center text-sm text-[#F5F5F7]/40 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

function Spinner() {
  return (
    <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
  )
}
