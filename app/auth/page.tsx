"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth, useLang } from "@/components/providers"
import { setRememberMe } from "@/lib/store"
import { Eye, EyeOff, ArrowRight, Phone, Mail, KeyRound } from "lucide-react"

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type AuthView = "login" | "register" | "forgot"

export default function AuthPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { t } = useLang()
  const [view, setView] = useState<AuthView>("login")

  if (user) {
    router.replace("/home")
    return null
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
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center"
            >
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#F5F5F7] text-center text-balance">
                {view === "forgot"
                  ? t("auth.forgotTitle")
                  : view === "login"
                  ? t("auth.loginTitle")
                  : t("auth.title")}
              </h1>
              <p className="text-[#F5F5F7]/50 text-sm mt-2 text-center max-w-xs">
                {view === "forgot"
                  ? t("auth.forgotSubtitle")
                  : view === "login"
                  ? t("auth.loginSubtitle")
                  : t("auth.subtitle")}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Tabs (only show for login/register) */}
        {view !== "forgot" && (
          <div className="flex items-center rounded-xl bg-[#141417] border border-[#1C1C22] p-1 mb-8">
            {(["login", "register"] as const).map((tabKey) => (
              <button
                key={tabKey}
                onClick={() => setView(tabKey)}
                className="relative flex-1 py-2.5 text-sm font-semibold text-center rounded-lg transition-colors"
                style={{ color: view === tabKey ? "#F5F5F7" : "rgba(245,245,247,0.4)" }}
              >
                {view === tabKey && (
                  <motion.div
                    layoutId="auth-tab-indicator"
                    className="absolute inset-0 rounded-lg bg-[#1C1C22]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">
                  {tabKey === "login" ? t("auth.tabLogin") : t("auth.tabRegister")}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Form content */}
        <AnimatePresence mode="wait">
          {view === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <LoginForm
                onSwitchToRegister={() => setView("register")}
                onForgotPassword={() => setView("forgot")}
              />
            </motion.div>
          )}
          {view === "register" && (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <RegisterForm onSwitchToLogin={() => setView("login")} />
            </motion.div>
          )}
          {view === "forgot" && (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <ForgotPasswordForm onBack={() => setView("login")} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

const inputClass =
  "w-full px-4 py-3 bg-[#141417] border border-[#1C1C22] rounded-xl text-[#F5F5F7] placeholder:text-[#F5F5F7]/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm"

// ==============================
// LOGIN FORM (Email + Password OR Phone + OTP)
// ==============================
function LoginForm({
  onSwitchToRegister,
  onForgotPassword,
}: {
  onSwitchToRegister: () => void
  onForgotPassword: () => void
}) {
  const router = useRouter()
  const { login, loginWithPhone, verifyPhoneOTP } = useAuth()
  const { t } = useLang()
  const [method, setMethod] = useState<"email" | "phone">("email")

  // Email fields
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // Phone fields
  const [phone, setPhone] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [displayOtp, setDisplayOtp] = useState("")
  const [otpInput, setOtpInput] = useState("")

  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rememberMe, setRememberMeState] = useState(false)

  const handleEmailLogin = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      setError("")
      if (!email.trim() || !password) {
        setError(t("auth.errorFillAll")); return
      }
      if (!emailRegex.test(email.trim())) {
        setError(t("auth.errorInvalidEmail")); return
      }
      // Set remember-me BEFORE login so the setUser call uses the right storage
      setRememberMe(rememberMe)
      setIsSubmitting(true)
      setTimeout(() => {
        const result = login(email.trim(), password)
        setIsSubmitting(false)
        if (result.success) {
          router.push("/home")
        } else if (result.error === "not_found") {
          setError(t("auth.errorNotFound"))
        } else if (result.error === "wrong_password") {
          setError(t("auth.errorWrongPassword"))
        } else if (result.error === "account_locked") {
          setError("Account locked due to too many failed attempts. Try again in 15 minutes.")
        } else if (result.error === "suspended") {
          setError("This account has been suspended. Contact support.")
        }
      }, 300)
    },
    [email, password, rememberMe, login, router, t]
  )

  const handleSendOTP = useCallback(() => {
    setError("")
    if (!phone.trim()) {
      setError(t("auth.errorFillAll")); return
    }
    setIsSubmitting(true)
    setTimeout(() => {
      const result = loginWithPhone(phone.trim())
      setIsSubmitting(false)
      if (result.success && result.otp) {
        setOtpSent(true)
        setDisplayOtp(result.otp)
      } else {
        setError(t("auth.errorPhoneNotFound"))
      }
    }, 300)
  }, [phone, loginWithPhone, t])

  const handleVerifyOTP = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      setError("")
      if (!otpInput.trim()) {
        setError(t("auth.errorFillAll")); return
      }
      setIsSubmitting(true)
      setTimeout(() => {
        const result = verifyPhoneOTP(otpInput.trim(), phone.trim())
        setIsSubmitting(false)
        if (result.success) {
          router.push("/home")
        } else {
          setError(t("auth.errorInvalidOTP"))
        }
      }, 300)
    },
    [otpInput, phone, verifyPhoneOTP, router, t]
  )

  return (
    <div className="flex flex-col gap-5">
      {/* Method toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => { setMethod("email"); setError(""); setOtpSent(false) }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all border ${
            method === "email"
              ? "bg-primary/10 border-primary/30 text-primary"
              : "bg-[#141417] border-[#1C1C22] text-[#F5F5F7]/40 hover:text-[#F5F5F7]/60"
          }`}
        >
          <Mail className="h-3.5 w-3.5" />
          {t("auth.email")}
        </button>
        <button
          type="button"
          onClick={() => { setMethod("phone"); setError("") }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all border ${
            method === "phone"
              ? "bg-primary/10 border-primary/30 text-primary"
              : "bg-[#141417] border-[#1C1C22] text-[#F5F5F7]/40 hover:text-[#F5F5F7]/60"
          }`}
        >
          <Phone className="h-3.5 w-3.5" />
          {t("auth.tabPhoneOTP")}
        </button>
      </div>

      {method === "email" ? (
        <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#F5F5F7]/70 uppercase tracking-wider">{t("auth.email")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError("") }}
              placeholder={t("auth.emailPlaceholder")}
              className={inputClass}
              autoComplete="email"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#F5F5F7]/70 uppercase tracking-wider">{t("auth.password")}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError("") }}
                placeholder={t("auth.passwordPlaceholder")}
                className={`${inputClass} pr-12`}
                autoComplete="current-password"
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
          </div>

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between -mt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMeState(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="h-4 w-4 rounded border border-[#1C1C22] bg-[#141417] peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
                  {rememberMe && (
                    <svg className="h-2.5 w-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-xs text-[#F5F5F7]/50 group-hover:text-[#F5F5F7]/70 transition-colors">
                Remember me
              </span>
            </label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs text-primary/70 hover:text-primary transition-colors"
            >
              {t("auth.forgotPassword")}
            </button>
          </div>

          <ErrorMessage error={error} />
          <SubmitButton isSubmitting={isSubmitting} label={t("auth.login")} />
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#F5F5F7]/70 uppercase tracking-wider">{t("auth.phone")}</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setError("") }}
              placeholder={t("auth.phonePlaceholder")}
              className={inputClass}
              disabled={otpSent}
            />
          </div>

          {!otpSent ? (
            <>
              <ErrorMessage error={error} />
              <motion.button
                type="button"
                onClick={handleSendOTP}
                disabled={isSubmitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
              >
                {isSubmitting ? <Spinner /> : <>{t("auth.sendOTP")} <ArrowRight className="h-4 w-4" /></>}
              </motion.button>
            </>
          ) : (
            <>
              {/* Show OTP (simulated) */}
              <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
                <p className="text-xs text-primary font-medium">{t("auth.otpSent")}</p>
                <p className="text-lg font-display font-bold text-primary mt-1 tracking-widest">{displayOtp}</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#F5F5F7]/70 uppercase tracking-wider">{t("auth.otpCode")}</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#F5F5F7]/30" />
                  <input
                    type="text"
                    value={otpInput}
                    onChange={(e) => { setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6)); setError("") }}
                    placeholder={t("auth.otpPlaceholder")}
                    className={`${inputClass} pl-10`}
                    maxLength={6}
                    autoFocus
                  />
                </div>
              </div>
              <ErrorMessage error={error} />
              <SubmitButton isSubmitting={isSubmitting} label={t("auth.verifyOTP")} />
            </>
          )}
        </form>
      )}

      {/* Switch link */}
      <p className="text-center text-sm text-[#F5F5F7]/40 mt-1">
        {t("auth.noAccount")}{" "}
        <button type="button" onClick={onSwitchToRegister} className="text-primary hover:text-primary/80 font-medium transition-colors">
          {t("auth.tabRegister")}
        </button>
      </p>
    </div>
  )
}

// ==============================
// REGISTER FORM
// ==============================
function RegisterForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const router = useRouter()
  const { register } = useAuth()
  const { t } = useLang()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      setError("")
      if (!name.trim() || !email.trim() || !phone.trim() || !password) {
        setError(t("auth.errorFillAll")); return
      }
      if (!emailRegex.test(email.trim())) {
        setError(t("auth.errorInvalidEmail")); return
      }
      if (password.length < 6) {
        setError(t("auth.errorMinPassword")); return
      }
      setIsSubmitting(true)
      setTimeout(() => {
        const result = register(name.trim(), email.trim(), phone.trim(), password)
        setIsSubmitting(false)
        if (result.success) {
          router.push("/home")
        } else if (result.error === "duplicate") {
          setError(t("auth.errorDuplicate"))
        } else if (result.error === "blocked") {
          setError(t("auth.errorBlocked"))
        }
      }, 300)
    },
    [name, email, phone, password, register, router, t]
  )

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#F5F5F7]/70 uppercase tracking-wider">{t("auth.name")}</label>
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setError("") }}
          placeholder={t("auth.namePlaceholder")}
          className={inputClass}
          autoComplete="name"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#F5F5F7]/70 uppercase tracking-wider">{t("auth.email")}</label>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError("") }}
          placeholder={t("auth.emailPlaceholder")}
          className={inputClass}
          autoComplete="email"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#F5F5F7]/70 uppercase tracking-wider">{t("auth.phone")}</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => { setPhone(e.target.value); setError("") }}
          placeholder={t("auth.phonePlaceholder")}
          className={inputClass}
          autoComplete="tel"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#F5F5F7]/70 uppercase tracking-wider">{t("auth.password")}</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError("") }}
            placeholder={t("auth.passwordPlaceholder")}
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
      </div>
      <ErrorMessage error={error} />
      <SubmitButton isSubmitting={isSubmitting} label={t("auth.register")} />
      <p className="text-center text-sm text-[#F5F5F7]/40 mt-1">
        {t("auth.hasAccount")}{" "}
        <button type="button" onClick={onSwitchToLogin} className="text-primary hover:text-primary/80 font-medium transition-colors">
          {t("auth.tabLogin")}
        </button>
      </p>
    </form>
  )
}

// ==============================
// FORGOT PASSWORD FORM
// ==============================
function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const { forgotPassword } = useAuth()
  const { t } = useLang()
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      setError("")
      if (!email.trim() || !newPassword) {
        setError(t("auth.errorFillAll")); return
      }
      if (!emailRegex.test(email.trim())) {
        setError(t("auth.errorInvalidEmail")); return
      }
      if (newPassword.length < 6) {
        setError(t("auth.errorMinPassword")); return
      }
      setIsSubmitting(true)
      setTimeout(() => {
        const result = forgotPassword(email.trim(), newPassword)
        setIsSubmitting(false)
        if (result.success) {
          setSuccess(true)
        } else if (result.error === "admin_blocked") {
          setError(t("auth.errorAdminReset"))
        } else {
          setError(t("auth.errorNotFound"))
        }
      }, 300)
    },
    [email, newPassword, forgotPassword, t]
  )

  if (success) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-6 py-4 text-center">
          <p className="text-sm text-green-400 font-medium">{t("auth.resetSuccess")}</p>
        </div>
        <motion.button
          type="button"
          onClick={onBack}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl text-sm flex items-center justify-center gap-2"
        >
          {t("auth.backToLogin")}
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#F5F5F7]/70 uppercase tracking-wider">{t("auth.email")}</label>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError("") }}
          placeholder={t("auth.emailPlaceholder")}
          className={inputClass}
          autoComplete="email"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#F5F5F7]/70 uppercase tracking-wider">{t("auth.newPassword")}</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setError("") }}
            placeholder={t("auth.newPasswordPlaceholder")}
            className={`${inputClass} pr-12`}
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
      </div>
      <ErrorMessage error={error} />
      <SubmitButton isSubmitting={isSubmitting} label={t("auth.resetPassword")} />
      <p className="text-center text-sm text-[#F5F5F7]/40 mt-1">
        <button type="button" onClick={onBack} className="text-primary hover:text-primary/80 font-medium transition-colors">
          {t("auth.backToLogin")}
        </button>
      </p>
    </form>
  )
}

// ==============================
// Shared Components
// ==============================
function ErrorMessage({ error }: { error: string }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="text-sm text-red-400"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  )
}

function SubmitButton({ isSubmitting, label }: { isSubmitting: boolean; label: string }) {
  return (
    <motion.button
      type="submit"
      disabled={isSubmitting}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="w-full py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl transition-all animate-glow-pulse mt-1 flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
    >
      {isSubmitting ? <Spinner /> : <>{label} <ArrowRight className="h-4 w-4" /></>}
    </motion.button>
  )
}

function Spinner() {
  return <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
}
