import type { Lang } from "./i18n"
import type { Role } from "./permissions"

// ---- Types ----
export type Tier = "free" | "member" | "pro"

export type { Role } from "./permissions"

export interface User {
  id: string
  name: string
  email: string
  phone: string
  password: string
  role: Role
  tier: Tier
  coins: number
  badges: string[]
  checkedInToday: boolean
  walletBalance: number
  createdAt: string
  suspended?: boolean
  lastLoginAt?: string
  failedLoginAttempts?: number
  lockedUntil?: string
}

// ---- Audit Log ----
export type AuditAction =
  | "login" | "logout" | "login_failed" | "account_locked"
  | "register" | "password_reset"
  | "purchase_ticket" | "refund"
  | "add_funds" | "wallet_update"
  | "create_event" | "edit_event" | "delete_event" | "publish_event" | "unpublish_event"
  | "create_course" | "edit_course" | "delete_course" | "publish_course" | "unpublish_course"
  | "create_news" | "edit_news" | "delete_news" | "publish_news" | "unpublish_news"
  | "edit_artist" | "edit_homepage"
  | "upload_media" | "delete_media"
  | "upgrade_subscription" | "role_change" | "suspend_user" | "unsuspend_user"
  | "session_timeout"

export interface AuditLogEntry {
  id: string
  userId: string
  userName: string
  role: Role
  action: AuditAction
  targetResource: string
  previousValue?: string
  newValue?: string
  timestamp: string
  ip?: string
}

// ---- News ----
export interface NewsPost {
  id: string
  title: string
  body: string
  coverImage: string
  published: boolean
  pinned: boolean
  createdAt: string
  updatedAt: string
  authorId: string
  authorName: string
}

// ---- Homepage Config ----
export interface HomepageConfig {
  heroTitle: string
  heroSubtitle: string
  heroImage: string
  featuredArtistIds: string[]
  featuredEventIds: string[]
}

export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: "credit" | "debit" | "refund"
}

export interface Notification {
  id: string
  message: string
  read: boolean
  date: string
}

// ---- Mock Data ----
export interface MWEvent {
  id: string
  name: string
  date: string
  location: string
  category: "concert" | "workshop" | "festival" | "conference"
  price: number
  image: string
  description: string
  ticketsLeft: number
  published: boolean
}

export interface Course {
  id: string
  name: string
  artist: string
  artistImage: string
  image: string
  lessons: number
  progress: number
  tier: Tier
  published: boolean
  description: string
}

export interface Artist {
  id: string
  name: string
  image: string
  genre: string
  points: number
  monthlyPoints: number
  country: string
}

export interface Fan {
  id: string
  name: string
  points: number
  monthlyPoints: number
}

export const MOCK_EVENTS: MWEvent[] = [
  { id: "e1", name: "Tokyo Neon Nights", date: "2026-04-15", location: "Tokyo, Japan", category: "concert", price: 120, image: "/images/event-1.jpg", description: "An immersive concert experience featuring Asia's top electronic music producers under Tokyo's iconic neon skyline.", ticketsLeft: 42, published: true },
  { id: "e2", name: "Berlin Sound Lab", date: "2026-05-22", location: "Berlin, Germany", category: "workshop", price: 80, image: "/images/event-2.jpg", description: "A hands-on workshop exploring cutting-edge production techniques with world-class sound designers.", ticketsLeft: 18, published: true },
  { id: "e3", name: "Seoul Wave Festival", date: "2026-06-10", location: "Seoul, Korea", category: "festival", price: 200, image: "/images/event-3.jpg", description: "Three days of music, art, and cultural exchange at Seoul's premier outdoor venue.", ticketsLeft: 156, published: true },
  { id: "e4", name: "Future of Music Summit", date: "2026-07-08", location: "London, UK", category: "conference", price: 150, image: "/images/event-4.jpg", description: "Industry leaders discuss the future of music technology, AI, and the creator economy.", ticketsLeft: 0, published: true },
  { id: "e5", name: "Bangkok Bass Culture", date: "2026-08-20", location: "Bangkok, Thailand", category: "concert", price: 90, image: "/images/event-5.jpg", description: "Underground bass music meets Thai cultural artistry in an unforgettable night.", ticketsLeft: 75, published: true },
  { id: "e6", name: "Shanghai Mix Masters", date: "2026-09-15", location: "Shanghai, China", category: "workshop", price: 110, image: "/images/event-6.jpg", description: "Master the art of mixing and mastering with Asia's top audio engineers.", ticketsLeft: 30, published: true },
]

export const MOCK_COURSES: Course[] = [
  { id: "c1", name: "Production Fundamentals", artist: "Kai Watanabe", artistImage: "/images/artist-1.jpg", image: "/images/course-1.jpg", lessons: 12, progress: 0, tier: "free", published: true, description: "Learn the basics of modern music production from scratch." },
  { id: "c2", name: "Advanced Mixing Techniques", artist: "Sora Kim", artistImage: "/images/artist-2.jpg", image: "/images/course-2.jpg", lessons: 8, progress: 0, tier: "member", published: true, description: "Deep dive into professional mixing workflows and techniques." },
  { id: "c3", name: "Sound Design Masterclass", artist: "Lena Oberg", artistImage: "/images/artist-3.jpg", image: "/images/course-3.jpg", lessons: 15, progress: 0, tier: "pro", published: true, description: "Create unique sounds from synthesis to sampling." },
  { id: "c4", name: "The Art of Arrangement", artist: "Marco Rossi", artistImage: "/images/artist-4.jpg", image: "/images/course-4.jpg", lessons: 10, progress: 0, tier: "member", published: true, description: "Structure your music like a professional composer." },
]

export const MOCK_ARTISTS: Artist[] = [
  { id: "a1", name: "Kai Watanabe", image: "/images/artist-1.jpg", genre: "Electronic", points: 9820, monthlyPoints: 1450, country: "JP" },
  { id: "a2", name: "Sora Kim", image: "/images/artist-2.jpg", genre: "K-Pop/Experimental", points: 8750, monthlyPoints: 1680, country: "KR" },
  { id: "a3", name: "Lena Oberg", image: "/images/artist-3.jpg", genre: "Ambient/Sound Design", points: 7400, monthlyPoints: 1200, country: "SE" },
  { id: "a4", name: "Marco Rossi", image: "/images/artist-4.jpg", genre: "Neo-Classical", points: 6980, monthlyPoints: 980, country: "IT" },
  { id: "a5", name: "Ananya Devi", image: "/images/artist-5.jpg", genre: "Fusion/World", points: 6200, monthlyPoints: 1320, country: "IN" },
  { id: "a6", name: "Chen Wei", image: "/images/artist-6.jpg", genre: "Hip-Hop/Trap", points: 5850, monthlyPoints: 1100, country: "CN" },
  { id: "a7", name: "Yuki Tanaka", image: "/images/artist-7.jpg", genre: "Jazz/Lo-Fi", points: 5400, monthlyPoints: 890, country: "JP" },
  { id: "a8", name: "Priya Sharma", image: "/images/artist-8.jpg", genre: "Electronic/Desi Bass", points: 4950, monthlyPoints: 760, country: "IN" },
]

export const MOCK_FANS: Fan[] = [
  { id: "f1", name: "Alex Thunder", points: 4200, monthlyPoints: 680 },
  { id: "f2", name: "Maya Swift", points: 3800, monthlyPoints: 720 },
  { id: "f3", name: "Leo Wave", points: 3500, monthlyPoints: 550 },
  { id: "f4", name: "Nina Beats", points: 3100, monthlyPoints: 490 },
  { id: "f5", name: "Raj Pulse", points: 2800, monthlyPoints: 610 },
  { id: "f6", name: "Sakura Dream", points: 2500, monthlyPoints: 430 },
]

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "n1", message: "Seoul Wave Festival tickets are selling fast!", read: false, date: "2026-02-14" },
  { id: "n2", message: "New course: Sound Design Masterclass is live!", read: false, date: "2026-02-13" },
  { id: "n3", message: "You earned 50 coins from daily check-in!", read: true, date: "2026-02-12" },
  { id: "n4", message: "Kai Watanabe just released a new lesson.", read: true, date: "2026-02-11" },
]

// ---- Hardcoded Admin ----
export const ADMIN_EMAIL = "mutationwave@gmail.com"
export const ADMIN_PASSWORD = "mutation.admin"
export const ADMIN_USER: User = {
  id: "admin-001",
  name: "Mutation Wave Admin",
  email: ADMIN_EMAIL,
  phone: "",
  password: ADMIN_PASSWORD,
  role: "admin",
  tier: "pro",
  coins: 99999,
  badges: ["admin", "founder", "early-adopter"],
  checkedInToday: false,
  walletBalance: 99999,
  createdAt: "2024-01-01T00:00:00.000Z",
  suspended: false,
  lastLoginAt: new Date().toISOString(),
  failedLoginAttempts: 0,
}

// ---- LocalStorage Helpers ----
const isBrowser = typeof window !== "undefined"

// ---- Remember Me ----
export function getRememberMe(): boolean {
  if (!isBrowser) return false
  return localStorage.getItem("mw_remember_me") === "true"
}

export function setRememberMe(value: boolean) {
  if (!isBrowser) return
  if (value) {
    localStorage.setItem("mw_remember_me", "true")
  } else {
    localStorage.removeItem("mw_remember_me")
  }
}

// User session: uses localStorage if "remember me" is on, sessionStorage otherwise
export function getUser(): User | null {
  if (!isBrowser) return null
  // Check localStorage first (remember me), then sessionStorage (session-only)
  const rawLocal = localStorage.getItem("mw_user")
  if (rawLocal) return JSON.parse(rawLocal)
  const rawSession = sessionStorage.getItem("mw_user")
  if (rawSession) return JSON.parse(rawSession)
  return null
}

export function setUser(user: User) {
  if (!isBrowser) return
  const remember = getRememberMe()
  if (remember) {
    localStorage.setItem("mw_user", JSON.stringify(user))
    sessionStorage.removeItem("mw_user")
  } else {
    sessionStorage.setItem("mw_user", JSON.stringify(user))
    localStorage.removeItem("mw_user")
  }
}

export function clearUser() {
  if (!isBrowser) return
  localStorage.removeItem("mw_user")
  sessionStorage.removeItem("mw_user")
  localStorage.removeItem("mw_remember_me")
}

// ---- User Registry (multi-user) ----
export function getAllRegisteredUsers(): User[] {
  if (!isBrowser) return []
  const raw = localStorage.getItem("mw_all_users")
  return raw ? JSON.parse(raw) : []
}

export function saveRegisteredUser(user: User) {
  const users = getAllRegisteredUsers()
  const existing = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase())
  if (existing !== -1) {
    users[existing] = user
  } else {
    users.push(user)
  }
  if (isBrowser) localStorage.setItem("mw_all_users", JSON.stringify(users))
}

export function findUserByEmail(email: string): User | null {
  if (email.trim().toLowerCase() === ADMIN_EMAIL) return null // admin not in registry
  const users = getAllRegisteredUsers()
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null
}

export function findUserByPhone(phone: string): User | null {
  const users = getAllRegisteredUsers()
  return users.find(u => u.phone === phone) || null
}

// ---- OTP Simulation ----
export function generateOTP(): string {
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  if (isBrowser) localStorage.setItem("mw_otp", otp)
  return otp
}

export function verifyOTP(input: string): boolean {
  if (!isBrowser) return false
  const stored = localStorage.getItem("mw_otp")
  return stored === input
}

export function clearOTP() {
  if (isBrowser) localStorage.removeItem("mw_otp")
}

// ---- Forgot Password ----
export function resetPassword(email: string, newPassword: string): boolean {
  const users = getAllRegisteredUsers()
  const idx = users.findIndex(u => u.email.toLowerCase() === email.trim().toLowerCase())
  if (idx === -1) return false
  users[idx].password = newPassword
  if (isBrowser) localStorage.setItem("mw_all_users", JSON.stringify(users))
  // Also update active session if same user
  const current = getUser()
  if (current && current.email.toLowerCase() === email.trim().toLowerCase()) {
    current.password = newPassword
    setUser(current)
  }
  return true
}

export function getLang(): Lang {
  if (!isBrowser) return "en"
  return (localStorage.getItem("mw_lang") as Lang) || "en"
}

export function setLang(lang: Lang) {
  if (!isBrowser) return
  localStorage.setItem("mw_lang", lang)
}

export function getTransactions(): Transaction[] {
  if (!isBrowser) return []
  const raw = localStorage.getItem("mw_transactions")
  return raw ? JSON.parse(raw) : []
}

export function addTransaction(tx: Transaction) {
  const txs = getTransactions()
  txs.unshift(tx)
  if (isBrowser) localStorage.setItem("mw_transactions", JSON.stringify(txs))
}

export function getNotifications(): Notification[] {
  if (!isBrowser) return MOCK_NOTIFICATIONS
  const raw = localStorage.getItem("mw_notifications")
  return raw ? JSON.parse(raw) : MOCK_NOTIFICATIONS
}

export function setNotifications(notifs: Notification[]) {
  if (!isBrowser) return
  localStorage.setItem("mw_notifications", JSON.stringify(notifs))
}

export function getCourseProgress(): Record<string, number> {
  if (!isBrowser) return {}
  const raw = localStorage.getItem("mw_course_progress")
  return raw ? JSON.parse(raw) : {}
}

export function setCourseProgress(progress: Record<string, number>) {
  if (!isBrowser) return
  localStorage.setItem("mw_course_progress", JSON.stringify(progress))
}

export function getCustomEvents(): MWEvent[] {
  if (!isBrowser) return []
  const raw = localStorage.getItem("mw_custom_events")
  return raw ? JSON.parse(raw) : []
}

export function setCustomEvents(events: MWEvent[]) {
  if (!isBrowser) return
  localStorage.setItem("mw_custom_events", JSON.stringify(events))
}

export function getCustomCourses(): Course[] {
  if (!isBrowser) return []
  const raw = localStorage.getItem("mw_custom_courses")
  return raw ? JSON.parse(raw) : []
}

export function setCustomCourses(courses: Course[]) {
  if (!isBrowser) return
  localStorage.setItem("mw_custom_courses", JSON.stringify(courses))
}

// ---- Purchased Tickets ----
export interface PurchasedTicket {
  id: string
  eventId: string
  eventName: string
  qty: number
  totalPaid: number
  paymentType: "full" | "installment"
  installmentsPaid: number
  installmentsTotal: number
  perMonth: number
  purchasedAt: string
}

export function getPurchasedTickets(): PurchasedTicket[] {
  if (!isBrowser) return []
  const raw = localStorage.getItem("mw_purchased_tickets")
  return raw ? JSON.parse(raw) : []
}

export function addPurchasedTicket(ticket: PurchasedTicket) {
  const tickets = getPurchasedTickets()
  tickets.unshift(ticket)
  if (isBrowser) localStorage.setItem("mw_purchased_tickets", JSON.stringify(tickets))
}

export function updatePurchasedTicket(ticketId: string, updates: Partial<PurchasedTicket>) {
  const tickets = getPurchasedTickets()
  const idx = tickets.findIndex(t => t.id === ticketId)
  if (idx !== -1) {
    tickets[idx] = { ...tickets[idx], ...updates }
    if (isBrowser) localStorage.setItem("mw_purchased_tickets", JSON.stringify(tickets))
  }
}

// ---- Audit Log ----
export function getAuditLog(): AuditLogEntry[] {
  if (!isBrowser) return []
  const raw = localStorage.getItem("mw_audit_log")
  return raw ? JSON.parse(raw) : []
}

export function addAuditLogEntry(entry: Omit<AuditLogEntry, "id" | "timestamp">) {
  const log = getAuditLog()
  const newEntry: AuditLogEntry = {
    ...entry,
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
  }
  log.unshift(newEntry)
  // Retain 90 days worth (or 10000 entries max)
  const trimmed = log.slice(0, 10000)
  if (isBrowser) localStorage.setItem("mw_audit_log", JSON.stringify(trimmed))
  return newEntry
}

// ---- News ----
export function getNewsPosts(): NewsPost[] {
  if (!isBrowser) return []
  const raw = localStorage.getItem("mw_news")
  return raw ? JSON.parse(raw) : []
}

export function setNewsPosts(posts: NewsPost[]) {
  if (!isBrowser) return
  localStorage.setItem("mw_news", JSON.stringify(posts))
}

// ---- Homepage Config ----
const DEFAULT_HOMEPAGE_CONFIG: HomepageConfig = {
  heroTitle: "The Global Stage for Cultural Innovation",
  heroSubtitle: "Discover, create, and invest in the future of music, art, and culture.",
  heroImage: "/images/event-1.jpg",
  featuredArtistIds: ["a1", "a2", "a3", "a4"],
  featuredEventIds: ["e1", "e2", "e3"],
}

export function getHomepageConfig(): HomepageConfig {
  if (!isBrowser) return DEFAULT_HOMEPAGE_CONFIG
  const raw = localStorage.getItem("mw_homepage_config")
  return raw ? JSON.parse(raw) : DEFAULT_HOMEPAGE_CONFIG
}

export function setHomepageConfig(config: HomepageConfig) {
  if (!isBrowser) return
  localStorage.setItem("mw_homepage_config", JSON.stringify(config))
}

// ---- Session Tracking ----
export function getLastActivity(): number {
  if (!isBrowser) return Date.now()
  const raw = localStorage.getItem("mw_last_activity")
  return raw ? parseInt(raw) : Date.now()
}

export function setLastActivity() {
  if (isBrowser) localStorage.setItem("mw_last_activity", Date.now().toString())
}

export function getSessionStart(): number {
  if (!isBrowser) return Date.now()
  const raw = localStorage.getItem("mw_session_start")
  return raw ? parseInt(raw) : Date.now()
}

export function setSessionStart() {
  if (isBrowser) localStorage.setItem("mw_session_start", Date.now().toString())
}

// ---- Login Attempt Tracking ----
const MAX_LOGIN_ATTEMPTS = 5
const LOCK_DURATION_MS = 15 * 60 * 1000 // 15 minutes

export function recordFailedLogin(email: string): { locked: boolean; attemptsLeft: number } {
  const users = getAllRegisteredUsers()
  const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase())
  if (idx === -1) return { locked: false, attemptsLeft: MAX_LOGIN_ATTEMPTS }

  const user = users[idx]
  const attempts = (user.failedLoginAttempts || 0) + 1
  users[idx] = {
    ...user,
    failedLoginAttempts: attempts,
    lockedUntil: attempts >= MAX_LOGIN_ATTEMPTS
      ? new Date(Date.now() + LOCK_DURATION_MS).toISOString()
      : undefined,
  }
  if (isBrowser) localStorage.setItem("mw_all_users", JSON.stringify(users))
  return {
    locked: attempts >= MAX_LOGIN_ATTEMPTS,
    attemptsLeft: Math.max(0, MAX_LOGIN_ATTEMPTS - attempts),
  }
}

export function resetFailedLogins(email: string) {
  const users = getAllRegisteredUsers()
  const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase())
  if (idx === -1) return
  users[idx] = { ...users[idx], failedLoginAttempts: 0, lockedUntil: undefined }
  if (isBrowser) localStorage.setItem("mw_all_users", JSON.stringify(users))
}

export function isAccountLocked(email: string): boolean {
  const user = findUserByEmail(email)
  if (!user || !user.lockedUntil) return false
  if (new Date(user.lockedUntil) > new Date()) return true
  // Lock expired, reset
  resetFailedLogins(email)
  return false
}

// ---- Idempotency for Purchases ----
export function getPurchaseIdempotencyKeys(): string[] {
  if (!isBrowser) return []
  const raw = localStorage.getItem("mw_idempotency_keys")
  return raw ? JSON.parse(raw) : []
}

export function addPurchaseIdempotencyKey(key: string) {
  const keys = getPurchaseIdempotencyKeys()
  keys.push(key)
  if (isBrowser) localStorage.setItem("mw_idempotency_keys", JSON.stringify(keys))
}

export function hasPurchaseIdempotencyKey(key: string): boolean {
  return getPurchaseIdempotencyKeys().includes(key)
}

// ---- Media Library ----
export interface MediaItem {
  id: string
  name: string
  url: string
  size: number
  type: string
  uploadedAt: string
  uploadedBy: string
}

export function getMediaLibrary(): MediaItem[] {
  if (!isBrowser) return []
  const raw = localStorage.getItem("mw_media_library")
  return raw ? JSON.parse(raw) : []
}

export function setMediaLibrary(items: MediaItem[]) {
  if (!isBrowser) return
  localStorage.setItem("mw_media_library", JSON.stringify(items))
}
