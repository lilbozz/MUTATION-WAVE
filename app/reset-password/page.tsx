"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Eye, EyeOff, ArrowRight, Mail, Phone } from "lucide-react"
import { supabase } from "@/lib/supabase"

const inputClass =
  "w-full px-4 py-3 bg-[#141417] border border-[#1C1C22] rounded-xl text-[#F5F5F7] placeholder:text-[#F5F5F7]/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm"

type View = "request" | "email_sent" | "phone_otp" | "update" | "updated"
type Method = "email" | "phone"

function getPasswordErrors(password: string): string[] {
  const errors: string[] = []
  if (password.length > 0 && password.length < 8) errors.push("At least 8 characters")
  if (password.length > 0 && !/\d/.test(password)) errors.push("At least 1 number")
  return errors
}

export default function ResetPasswordPage() {
  const [view, setView] = useState<View>("request")
  const [method, setMethod] = useState<Method>("email")
  const [phone, setPhone] = useState("")

  // Email recovery: Supabase fires PASSWORD_RECOVERY when the user
  // arrives via the reset link; transition directly to the update form.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setView("update")
    })
    return () => subscription.unsubscribe()
  }, [])

  const heading = view === "update" || view === "updated" ? "Set new password" : "Reset password"
  const subheading =
    view === "update"     ? "Choose a strong password" :
    view === "updated"    ? "Your password has been updated" :
    view === "phone_otp"  ? "Enter the code we sent you" :
    method === "phone"    ? "We\u2019ll send you a one-time code" :
                            "We\u2019ll send you a reset link"

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
            {heading}
          </h1>
          <p className="text-[#F5F5F7]/50 text-sm mt-2 text-center">{subheading}</p>
        </div>

        {view === "request" && (
          <RequestForm
            method={method}
            setMethod={(m) => { setMethod(m) }}
            onEmailSent={() => setView("email_sent")}
            onPhoneOtp={(p) => { setPhone(p); setView("phone_otp") }}
          />
        )}
        {view === "email_sent" && <EmailSentView />}
        {view === "phone_otp" && (
          <PhoneOtpForm
            phone={phone}
            onVerified={() => setView("update")}
            onBack={() => setView("request")}
          />
        )}
        {view === "update" && <UpdateForm onUpdated={() => setView("updated")} />}
        {view === "updated" && <UpdatedView />}
      </motion.div>
    </div>
  )
}

// ── Method toggle + request forms ──────────────────────────────────────────────
function RequestForm({
  method,
  setMethod,
  onEmailSent,
  onPhoneOtp,
}: {
  method: Method
  setMethod: (m: Method) => void
  onEmailSent: () => void
  onPhoneOtp: (phone: string) => void
}) {
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function switchMethod(m: Method) {
    setMethod(m)
    setError("")
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!email.trim()) { setError("Please enter your email address."); return }
    setLoading(true)
    const { error: authError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${window.location.origin}/reset-password` }
    )
    setLoading(false)
    if (authError) { setError(authError.message); return }
    onEmailSent()
  }

  async function handlePhone(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!phone.trim()) { setError("Please enter your phone number."); return }
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithOtp({ phone: phone.trim() })
    setLoading(false)
    if (authError) { setError(authError.message); return }
    onPhoneOtp(phone.trim())
  }

  return (
    <>
      {/* Method toggle */}
      <div className="flex items-center gap-2 mb-5">
        {(["email", "phone"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMethod(m)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all border ${
              method === m
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-[#141417] border-[#1C1C22] text-[#F5F5F7]/40 hover:text-[#F5F5F7]/60"
            }`}
          >
            {m === "email" ? <Mail className="h-3.5 w-3.5" /> : <Phone className="h-3.5 w-3.5" />}
            {m === "email" ? "Email" : "Phone"}
          </button>
        ))}
      </div>

      {method === "email" ? (
        <form onSubmit={handleEmail} className="flex flex-col gap-4">
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
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl transition-all mt-1 flex items-center justify-center gap-2 disabled:opacity-60 text-sm hover:opacity-90"
          >
            {loading ? <Spinner /> : <>Send reset link <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>
      ) : (
        <form onSubmit={handlePhone} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#F5F5F7]/70 uppercase tracking-wider">
              Phone number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setError("") }}
              placeholder="+1 555 000 0000"
              className={inputClass}
              autoComplete="tel"
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl transition-all mt-1 flex items-center justify-center gap-2 disabled:opacity-60 text-sm hover:opacity-90"
          >
            {loading ? <Spinner /> : <>Send code <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>
      )}

      <p className="text-center text-sm text-[#F5F5F7]/40 mt-6">
        <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
          Back to sign in
        </Link>
      </p>
    </>
  )
}

// ── Email sent confirmation ────────────────────────────────────────────────────
function EmailSentView() {
  return (
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
  )
}

// ── Phone OTP verification ─────────────────────────────────────────────────────
function PhoneOtpForm({
  phone,
  onVerified,
  onBack,
}: {
  phone: string
  onVerified: () => void
  onBack: () => void
}) {
  const [token, setToken] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!token.trim()) { setError("Please enter the code."); return }
    setLoading(true)
    const { error: authError } = await supabase.auth.verifyOtp({
      phone,
      token: token.trim(),
      type: "sms",
    })
    setLoading(false)
    if (authError) { setError(authError.message); return }
    onVerified()
  }

  return (
    <>
      <div className="bg-[#141417] border border-[#1C1C22] rounded-xl px-4 py-3 mb-4">
        <p className="text-xs text-[#F5F5F7]/50">Code sent to</p>
        <p className="text-sm text-[#F5F5F7] font-medium mt-0.5">{phone}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#F5F5F7]/70 uppercase tracking-wider">
            Verification code
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={token}
            onChange={(e) => { setToken(e.target.value.replace(/\D/g, "").slice(0, 6)); setError("") }}
            placeholder="000000"
            className={inputClass}
            maxLength={6}
            autoFocus
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl transition-all mt-1 flex items-center justify-center gap-2 disabled:opacity-60 text-sm hover:opacity-90"
        >
          {loading ? <Spinner /> : <>Verify code <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>

      <p className="text-center text-sm text-[#F5F5F7]/40 mt-6">
        <button
          type="button"
          onClick={onBack}
          className="text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Try a different method
        </button>
      </p>
    </>
  )
}

// ── Set new password ───────────────────────────────────────────────────────────
function UpdateForm({ onUpdated }: { onUpdated: () => void }) {
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
    if (!password || !confirm) { setError("Please fill in all fields."); return }
    if (passwordErrors.length > 0) { setError("Password does not meet requirements."); return }
    if (password !== confirm) { setError("Passwords do not match."); return }
    setLoading(true)
    const { error: authError } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (authError) { setError(authError.message); return }
    onUpdated()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#F5F5F7]/70 uppercase tracking-wider">
          New password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError("") }}
            placeholder="••••••••"
            className={`${inputClass} pr-12`}
            autoComplete="new-password"
            autoFocus
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
              <li key={msg} className="text-xs text-red-400">{msg}</li>
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

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl transition-all mt-1 flex items-center justify-center gap-2 disabled:opacity-60 text-sm hover:opacity-90"
      >
        {loading ? <Spinner /> : <>Update password <ArrowRight className="h-4 w-4" /></>}
      </button>
    </form>
  )
}

// ── Password updated confirmation ──────────────────────────────────────────────
function UpdatedView() {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-6 py-4 text-center">
        <p className="text-sm text-green-400 font-medium">Password updated successfully.</p>
      </div>
      <Link
        href="/login"
        className="w-full py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
      >
        Sign in <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

function Spinner() {
  return (
    <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
  )
}
