"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react"
import type { Lang } from "@/lib/i18n"
import { t as translate } from "@/lib/i18n"
import {
  getUser, setUser as saveUser, clearUser,
  getLang, setLang as saveLang,
  getTransactions, addTransaction as addTx,
  getNotifications, setNotifications as saveNotifications,
  findUserByEmail, findUserByPhone, saveRegisteredUser,
  generateOTP, verifyOTP, clearOTP, resetPassword,
  ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_USER,
  setLastActivity, getLastActivity, setSessionStart,
  addAuditLogEntry, recordFailedLogin, resetFailedLogins, isAccountLocked,
  type User, type Tier, type Transaction, type Notification, type AuditAction,
} from "@/lib/store"
import { hasPermission, hasAnyPermission, getPermissionsForRole, type Permission, type Role } from "@/lib/permissions"

// ---- Session Timeout ----
const SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes

// --- Auth Context ---
interface AuthContextType {
  user: User | null
  isLoading: boolean
  register: (name: string, email: string, phone: string, password: string) => { success: boolean; error?: string }
  login: (email: string, password: string) => { success: boolean; error?: string }
  loginWithPhone: (phone: string) => { success: boolean; otp?: string; error?: string }
  verifyPhoneOTP: (otp: string, phone: string) => { success: boolean; error?: string }
  forgotPassword: (email: string, newPassword: string) => { success: boolean; error?: string }
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  upgradeTier: (tier: Tier) => void
  isAdmin: boolean
  // PBAC
  can: (permission: Permission) => boolean
  canAny: (permissions: Permission[]) => boolean
  permissions: Permission[]
  // Session
  sessionTimedOut: boolean
  dismissSessionTimeout: () => void
  // Audit
  logAction: (action: AuditAction, targetResource: string, previousValue?: string, newValue?: string) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  register: () => ({ success: false }),
  login: () => ({ success: false }),
  loginWithPhone: () => ({ success: false }),
  verifyPhoneOTP: () => ({ success: false }),
  forgotPassword: () => ({ success: false }),
  logout: () => {},
  updateUser: () => {},
  upgradeTier: () => {},
  isAdmin: false,
  can: () => false,
  canAny: () => false,
  permissions: [],
  sessionTimedOut: false,
  dismissSessionTimeout: () => {},
  logAction: () => {},
})

export function useAuth() { return useContext(AuthContext) }

// --- Language Context ---
interface LangContextType {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: string) => string
}

const LangContext = createContext<LangContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
})

export function useLang() { return useContext(LangContext) }

// --- Theme Context ---
interface ThemeContextType {
  theme: "dark" | "light"
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
})

export function useTheme() { return useContext(ThemeContext) }

// --- Wallet Context ---
interface WalletContextType {
  transactions: Transaction[]
  addTransaction: (tx: Transaction) => void
  refreshTransactions: () => void
}

const WalletContext = createContext<WalletContextType>({
  transactions: [],
  addTransaction: () => {},
  refreshTransactions: () => {},
})

export function useWallet() { return useContext(WalletContext) }

// --- Notification Context ---
interface NotifContextType {
  notifications: Notification[]
  unreadCount: number
  markAllRead: () => void
  addNotification: (msg: string) => void
}

const NotifContext = createContext<NotifContextType>({
  notifications: [],
  unreadCount: 0,
  markAllRead: () => {},
  addNotification: () => {},
})

export function useNotifications() { return useContext(NotifContext) }

// --- Combined Provider ---
export function AppProviders({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lang, setLangState] = useState<Lang>("en")
  const [theme, setThemeState] = useState<"dark" | "light">("dark")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [notifications, setNotificationsState] = useState<Notification[]>([])
  const [sessionTimedOut, setSessionTimedOut] = useState(false)
  const activityTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const u = getUser()
    setUserState(u)
    setLangState(getLang())
    const stored = typeof window !== "undefined" ? localStorage.getItem("mw_theme") : null
    setThemeState((stored as "dark" | "light") || "dark")
    setTransactions(getTransactions())
    setNotificationsState(getNotifications())
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark")
      document.documentElement.classList.toggle("light", theme === "light")
    }
  }, [theme])

  // ---- Session Timeout Tracking ----
  useEffect(() => {
    if (!user) return

    // Track user activity
    const updateActivity = () => setLastActivity()
    const events = ["mousedown", "keydown", "scroll", "touchstart"]
    events.forEach(e => window.addEventListener(e, updateActivity, { passive: true }))
    setLastActivity()

    // Check for inactivity every 60 seconds
    activityTimerRef.current = setInterval(() => {
      const last = getLastActivity()
      const elapsed = Date.now() - last
      if (elapsed > SESSION_TIMEOUT_MS) {
        setSessionTimedOut(true)
        // Log timeout
        addAuditLogEntry({
          userId: user.id,
          userName: user.name,
          role: user.role,
          action: "session_timeout",
          targetResource: "session",
        })
      }
    }, 60000)

    return () => {
      events.forEach(e => window.removeEventListener(e, updateActivity))
      if (activityTimerRef.current) clearInterval(activityTimerRef.current)
    }
  }, [user])

  const dismissSessionTimeout = useCallback(() => {
    setSessionTimedOut(false)
    clearUser()
    setUserState(null)
  }, [])

  // --- Audit Logging ---
  const logAction = useCallback((action: AuditAction, targetResource: string, previousValue?: string, newValue?: string) => {
    if (!user) return
    addAuditLogEntry({
      userId: user.id,
      userName: user.name,
      role: user.role,
      action,
      targetResource,
      previousValue,
      newValue,
    })
  }, [user])

  // --- Register ---
  const register = useCallback((name: string, email: string, phone: string, password: string): { success: boolean; error?: string } => {
    const normalizedEmail = email.trim().toLowerCase()
    if (normalizedEmail === ADMIN_EMAIL) {
      return { success: false, error: "blocked" }
    }
    const existing = findUserByEmail(normalizedEmail)
    if (existing) {
      return { success: false, error: "duplicate" }
    }
    const newUser: User = {
      id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      email: normalizedEmail,
      phone: phone.trim(),
      password,
      role: "user" as Role,
      tier: "free",
      coins: 100,
      badges: ["early-adopter"],
      checkedInToday: false,
      walletBalance: 500,
      createdAt: new Date().toISOString(),
      suspended: false,
      failedLoginAttempts: 0,
      lastLoginAt: new Date().toISOString(),
    }
    saveRegisteredUser(newUser)
    saveUser(newUser)
    setUserState(newUser)
    setSessionStart()
    setLastActivity()
    addAuditLogEntry({
      userId: newUser.id,
      userName: newUser.name,
      role: newUser.role,
      action: "register",
      targetResource: `user:${newUser.email}`,
    })
    return { success: true }
  }, [])

  // --- Login (Email + Password) ---
  const login = useCallback((email: string, password: string): { success: boolean; error?: string } => {
    const normalizedEmail = email.trim().toLowerCase()

    // Check hardcoded admin first
    if (normalizedEmail === ADMIN_EMAIL) {
      if (password === ADMIN_PASSWORD) {
        saveUser(ADMIN_USER)
        setUserState(ADMIN_USER)
        setSessionStart()
        setLastActivity()
        addAuditLogEntry({
          userId: ADMIN_USER.id,
          userName: ADMIN_USER.name,
          role: ADMIN_USER.role,
          action: "login",
          targetResource: `user:${ADMIN_USER.email}`,
        })
        return { success: true }
      }
      addAuditLogEntry({
        userId: "unknown",
        userName: normalizedEmail,
        role: "user",
        action: "login_failed",
        targetResource: `user:${normalizedEmail}`,
        newValue: "wrong_password (admin)",
      })
      return { success: false, error: "wrong_password" }
    }

    // Check account lock
    if (isAccountLocked(normalizedEmail)) {
      return { success: false, error: "account_locked" }
    }

    const found = findUserByEmail(normalizedEmail)
    if (!found) {
      return { success: false, error: "not_found" }
    }

    if (found.suspended) {
      return { success: false, error: "suspended" }
    }

    if (found.password !== password) {
      const result = recordFailedLogin(normalizedEmail)
      addAuditLogEntry({
        userId: found.id,
        userName: found.name,
        role: found.role,
        action: result.locked ? "account_locked" : "login_failed",
        targetResource: `user:${normalizedEmail}`,
        newValue: result.locked ? `locked after ${5} failed attempts` : `${result.attemptsLeft} attempts left`,
      })
      if (result.locked) {
        return { success: false, error: "account_locked" }
      }
      return { success: false, error: "wrong_password" }
    }

    // Successful login - reset failed attempts
    resetFailedLogins(normalizedEmail)
    const updatedUser = { ...found, lastLoginAt: new Date().toISOString(), failedLoginAttempts: 0 }
    saveRegisteredUser(updatedUser)
    saveUser(updatedUser)
    setUserState(updatedUser)
    setSessionStart()
    setLastActivity()
    addAuditLogEntry({
      userId: found.id,
      userName: found.name,
      role: found.role,
      action: "login",
      targetResource: `user:${normalizedEmail}`,
    })
    return { success: true }
  }, [])

  // --- Login with Phone (step 1: send OTP) ---
  const loginWithPhone = useCallback((phone: string): { success: boolean; otp?: string; error?: string } => {
    const found = findUserByPhone(phone.trim())
    if (!found) {
      return { success: false, error: "not_found" }
    }
    if (found.suspended) {
      return { success: false, error: "suspended" }
    }
    const otp = generateOTP()
    return { success: true, otp }
  }, [])

  // --- Verify Phone OTP (step 2) ---
  const verifyPhoneOTP = useCallback((otp: string, phone: string): { success: boolean; error?: string } => {
    const valid = verifyOTP(otp)
    if (!valid) {
      return { success: false, error: "invalid_otp" }
    }
    clearOTP()
    const found = findUserByPhone(phone.trim())
    if (!found) {
      return { success: false, error: "not_found" }
    }
    if (found.suspended) {
      return { success: false, error: "suspended" }
    }
    const updatedUser = { ...found, lastLoginAt: new Date().toISOString() }
    saveRegisteredUser(updatedUser)
    saveUser(updatedUser)
    setUserState(updatedUser)
    setSessionStart()
    setLastActivity()
    addAuditLogEntry({
      userId: found.id,
      userName: found.name,
      role: found.role,
      action: "login",
      targetResource: `user:${found.phone} (phone OTP)`,
    })
    return { success: true }
  }, [])

  // --- Forgot Password ---
  const forgotPasswordFn = useCallback((email: string, newPassword: string): { success: boolean; error?: string } => {
    const normalizedEmail = email.trim().toLowerCase()
    if (normalizedEmail === ADMIN_EMAIL) {
      return { success: false, error: "admin_blocked" }
    }
    const found = findUserByEmail(normalizedEmail)
    if (!found) {
      return { success: false, error: "not_found" }
    }
    const ok = resetPassword(normalizedEmail, newPassword)
    if (!ok) {
      return { success: false, error: "not_found" }
    }
    addAuditLogEntry({
      userId: found.id,
      userName: found.name,
      role: found.role,
      action: "password_reset",
      targetResource: `user:${normalizedEmail}`,
    })
    return { success: true }
  }, [])

  const logout = useCallback(() => {
    if (user) {
      addAuditLogEntry({
        userId: user.id,
        userName: user.name,
        role: user.role,
        action: "logout",
        targetResource: `user:${user.email}`,
      })
    }
    clearUser()
    setUserState(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("mw_last_activity")
      localStorage.removeItem("mw_session_start")
    }
  }, [user])

  const updateUser = useCallback((updates: Partial<User>) => {
    setUserState(prev => {
      if (!prev) return prev
      const updated = { ...prev, ...updates }
      saveUser(updated)
      if (updated.role !== "admin") {
        saveRegisteredUser(updated)
      }
      return updated
    })
  }, [])

  const upgradeTier = useCallback((tier: Tier) => {
    updateUser({ tier })
  }, [updateUser])

  // ---- PBAC ----
  const can = useCallback((permission: Permission): boolean => {
    if (!user) return false
    return hasPermission(user.role, permission)
  }, [user])

  const canAny = useCallback((permissions: Permission[]): boolean => {
    if (!user) return false
    return hasAnyPermission(user.role, permissions)
  }, [user])

  const permissions = user ? getPermissionsForRole(user.role) : []

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    saveLang(l)
  }, [])

  const tFn = useCallback((key: string) => translate(key, lang), [lang])

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      const next = prev === "dark" ? "light" : "dark"
      if (typeof window !== "undefined") localStorage.setItem("mw_theme", next)
      return next
    })
  }, [])

  const addTransactionFn = useCallback((tx: Transaction) => {
    addTx(tx)
    setTransactions(getTransactions())
  }, [])

  const refreshTransactions = useCallback(() => {
    setTransactions(getTransactions())
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = useCallback(() => {
    const updated = notifications.map(n => ({ ...n, read: true }))
    setNotificationsState(updated)
    saveNotifications(updated)
  }, [notifications])

  const addNotification = useCallback((msg: string) => {
    const newNotif: Notification = {
      id: `n-${Date.now()}`,
      message: msg,
      read: false,
      date: new Date().toISOString().split("T")[0],
    }
    const updated = [newNotif, ...notifications]
    setNotificationsState(updated)
    saveNotifications(updated)
  }, [notifications])

  const isAdmin = user?.role === "admin"

  return (
    <AuthContext.Provider value={{
      user, isLoading, register, login, loginWithPhone, verifyPhoneOTP,
      forgotPassword: forgotPasswordFn, logout, updateUser, upgradeTier, isAdmin,
      can, canAny, permissions,
      sessionTimedOut, dismissSessionTimeout,
      logAction,
    }}>
      <LangContext.Provider value={{ lang, setLang, t: tFn }}>
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
          <WalletContext.Provider value={{ transactions, addTransaction: addTransactionFn, refreshTransactions }}>
            <NotifContext.Provider value={{ notifications, unreadCount, markAllRead, addNotification }}>
              {children}
            </NotifContext.Provider>
          </WalletContext.Provider>
        </ThemeContext.Provider>
      </LangContext.Provider>
    </AuthContext.Provider>
  )
}
