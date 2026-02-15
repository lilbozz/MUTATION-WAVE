"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Home, Calendar, BookOpen, Trophy, BarChart3, Wallet, Crown,
  Gift, Shield, Search, Bell, Sun, Moon, Globe, Menu, X, LogOut,
  User as UserIcon, DollarSign, Settings, ChevronDown,
} from "lucide-react"
import { useAuth, useLang, useTheme, useNotifications } from "@/components/providers"
import { LANGUAGES, type Lang } from "@/lib/i18n"
import { ROLE_META } from "@/lib/permissions"
import type { Permission } from "@/lib/permissions"
import type { User as UserType } from "@/lib/store"

interface NavItem {
  href: string
  icon: typeof Home
  labelKey: string
  requiredPermissions?: Permission[]
}

const NAV_ITEMS: NavItem[] = [
  { href: "/home", icon: Home, labelKey: "nav.home" },
  { href: "/events", icon: Calendar, labelKey: "nav.events" },
  { href: "/learn", icon: BookOpen, labelKey: "nav.learn" },
  { href: "/ranking", icon: Trophy, labelKey: "nav.ranking" },
  { href: "/dashboard", icon: BarChart3, labelKey: "nav.dashboard" },
  { href: "/wallet", icon: Wallet, labelKey: "nav.wallet" },
  { href: "/subscription", icon: Crown, labelKey: "nav.subscription" },
  { href: "/gamification", icon: Gift, labelKey: "nav.gamification" },
  { href: "/admin", icon: Shield, labelKey: "nav.admin", requiredPermissions: ["canViewAdminDashboard", "canManageCMS", "canEditArtists", "canEditEvents", "canViewFinanceDashboard", "canViewAuditLog"] },
]

export function Navbar() {
  const { user, logout, isAdmin, canAny } = useAuth()
  const { t, lang, setLang } = useLang()
  const { theme, toggleTheme } = useTheme()
  const { unreadCount, notifications, markAllRead } = useNotifications()
  const pathname = usePathname()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfileMenu(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!user) return null

  const roleMeta = ROLE_META[user.role]
  const tierBadge = user.role !== "user"
    ? `${roleMeta.bgColor} ${roleMeta.color}`
    : user.tier === "pro" ? "bg-primary text-primary-foreground"
    : user.tier === "member" ? "bg-chart-2 text-foreground"
    : "bg-muted text-muted-foreground"
  const tierLabel = user.role !== "user" ? roleMeta.label.toUpperCase() : user.tier

  function handleLogout() {
    logout()
    setShowProfileMenu(false)
    // Clear all session data
    if (typeof window !== "undefined") {
      localStorage.removeItem("mw_remember_me")
      sessionStorage.clear()
      // Prevent back navigation
      window.history.pushState(null, "", "/auth")
      router.replace("/auth")
    }
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "py-2.5 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm"
            : "py-4 bg-background/50 backdrop-blur-sm"
        }`}
        style={{ maxWidth: "100vw", overflowX: "hidden" }}
      >
        <div className="mx-auto max-w-[1280px] flex items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-display font-bold text-sm text-primary-foreground">MW</span>
            </div>
            <span className="font-display font-bold text-lg text-foreground hidden sm:block">
              MUTATION WAVE
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5 min-w-0 overflow-x-auto scrollbar-none">
            {NAV_ITEMS.filter(item => !item.requiredPermissions || canAny(item.requiredPermissions)).map(item => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{t(item.labelKey)}</span>
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-lg bg-primary/10"
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            {/* Search */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              aria-label={t("nav.search")}
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Notifications */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setShowNotif(!showNotif)}
                className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                aria-label={t("nav.notifications")}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {showNotif && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    className="absolute right-0 top-12 w-80 bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
                  >
                    <div className="flex items-center justify-between p-4 border-b border-border">
                      <h3 className="font-semibold text-sm text-card-foreground">{t("notif.title")}</h3>
                      <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                        {t("notif.markRead")}
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-sm text-muted-foreground">{t("notif.empty")}</p>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            className={`p-3 border-b border-border/50 last:border-0 ${
                              !n.read ? "bg-primary/5" : ""
                            }`}
                          >
                            <p className="text-sm text-card-foreground">{n.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{n.date}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown (Desktop) */}
            <ProfileDropdown
              user={user}
              tierBadge={tierBadge}
              tierLabel={tierLabel}
              showProfileMenu={showProfileMenu}
              setShowProfileMenu={setShowProfileMenu}
              profileRef={profileRef}
              lang={lang}
              setLang={setLang}
              theme={theme}
              toggleTheme={toggleTheme}
              handleLogout={handleLogout}
              t={t}
            />

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors ml-0.5"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu panel */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl pt-20 px-6 overflow-y-auto lg:hidden"
          >
            <div className="flex flex-col gap-2">
              {NAV_ITEMS.filter(item => !item.requiredPermissions || canAny(item.requiredPermissions)).map(item => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                      active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="truncate">{t(item.labelKey)}</span>
                  </Link>
                )
              })}

              {/* Mobile user section */}
              <div className="border-t border-border mt-4 pt-4">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <UserIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate" title={user.name}>{user.name}</p>
                    <span className={`inline-block text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${tierBadge}`}>
                      {tierLabel}
                    </span>
                  </div>
                </div>

                {/* Mobile Language */}
                <div className="px-4 py-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Language</p>
                  <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-0.5">
                    {LANGUAGES.map(l => (
                      <button
                        key={l.code}
                        onClick={() => setLang(l.code as Lang)}
                        className={`relative flex-1 px-2 py-1.5 rounded-md text-xs font-semibold uppercase text-center transition-all ${
                          lang === l.code
                            ? "text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {lang === l.code && (
                          <motion.div
                            layoutId="mobile-lang-pill"
                            className="absolute inset-0 rounded-md bg-primary"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10">{l.code.toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Theme */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-foreground hover:bg-muted w-full transition-colors"
                >
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </button>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-destructive hover:bg-destructive/10 w-full transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  {t("nav.logout")}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search overlay */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/90 backdrop-blur-xl flex items-start justify-center pt-24 px-4"
            onClick={() => setShowSearch(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="w-full max-w-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t("search.placeholder")}
                  className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl text-foreground text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              {searchQuery && (
                <div className="mt-4 bg-card border border-border rounded-2xl overflow-hidden">
                  <SearchResults query={searchQuery} onClose={() => setShowSearch(false)} />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ========== ENTERPRISE PROFILE DROPDOWN ==========
function ProfileDropdown({
  user, tierBadge, tierLabel, showProfileMenu, setShowProfileMenu,
  profileRef, lang, setLang, theme, toggleTheme, handleLogout, t,
}: {
  user: UserType
  tierBadge: string
  tierLabel: string
  showProfileMenu: boolean
  setShowProfileMenu: (v: boolean) => void
  profileRef: React.RefObject<HTMLDivElement | null>
  lang: Lang
  setLang: (l: Lang) => void
  theme: "dark" | "light"
  toggleTheme: () => void
  handleLogout: () => void
  t: (key: string) => string
}) {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [openUp, setOpenUp] = useState(false)

  // Viewport-aware: detect if dropdown should open upward
  useEffect(() => {
    if (!showProfileMenu || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    // Dropdown is ~380px tall max; if less than 400px below, open upward
    setOpenUp(spaceBelow < 400)
  }, [showProfileMenu])

  const positionClass = openUp
    ? "bottom-full mb-2 right-0"
    : "top-full mt-2 right-0"

  return (
    <div ref={profileRef} className="relative hidden sm:block ml-1 pl-1 border-l border-border">
      <button
        ref={triggerRef}
        onClick={() => setShowProfileMenu(!showProfileMenu)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/50 transition-colors"
        aria-label="Profile menu"
        aria-expanded={showProfileMenu}
        aria-haspopup="menu"
      >
        <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <UserIcon className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="hidden md:block max-w-[100px] lg:max-w-[120px]">
          <p className="text-xs font-medium text-foreground leading-none truncate" title={user.name}>
            {user.name}
          </p>
          <span className={`inline-block mt-0.5 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${tierBadge}`}>
            {tierLabel}
          </span>
        </div>
        <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform shrink-0 ${showProfileMenu ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {showProfileMenu && (
          <motion.div
            ref={dropdownRef}
            role="menu"
            initial={{ opacity: 0, scale: 0.95, y: openUp ? 8 : -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: openUp ? 8 : -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute ${positionClass} w-64 bg-card border border-border rounded-xl shadow-2xl z-[100] flex flex-col`}
            style={{ maxHeight: "min(80vh, 420px)" }}
          >
            {/* Section 1: Identity Block */}
            <div className="p-4 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <UserIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-card-foreground truncate" title={user.name}>
                    {user.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate" title={user.email}>
                    {user.email}
                  </p>
                </div>
              </div>
              <span className={`inline-block mt-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded ${tierBadge}`}>
                {tierLabel}
              </span>
            </div>

            {/* Section 2: Quick Actions (scrollable if needed) */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <Link
                href="/dashboard"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-card-foreground hover:bg-muted transition-colors"
                role="menuitem"
              >
                <Settings className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate">Account Settings</span>
              </Link>

              {/* Language */}
              <div className="px-4 py-2.5 border-t border-border/50">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Language</p>
                <div className="flex items-center gap-0.5 bg-surface-soft rounded-lg p-0.5">
                  {LANGUAGES.map(l => (
                    <button
                      key={l.code}
                      onClick={() => setLang(l.code as Lang)}
                      className={`relative flex-1 px-1 py-1 rounded-md text-[10px] font-semibold uppercase text-center transition-all ${
                        lang === l.code
                          ? "text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      role="menuitem"
                    >
                      {lang === l.code && (
                        <motion.div
                          layoutId="profile-lang-pill"
                          className="absolute inset-0 rounded-md bg-primary"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{l.code.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-card-foreground hover:bg-muted transition-colors border-t border-border/50"
                role="menuitem"
              >
                {theme === "dark" ? <Sun className="h-4 w-4 text-muted-foreground shrink-0" /> : <Moon className="h-4 w-4 text-muted-foreground shrink-0" />}
                <span className="truncate">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </button>
            </div>

            {/* Section 3: Logout (always visible, pinned to bottom) */}
            <div className="border-t border-border shrink-0">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors rounded-b-xl"
                role="menuitem"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span className="truncate">{t("nav.logout")}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SearchResults({ query, onClose }: { query: string; onClose: () => void }) {
  const { t } = useLang()
  const { MOCK_EVENTS, MOCK_COURSES, MOCK_ARTISTS } = require("@/lib/store")
  const q = query.toLowerCase()

  const events = (MOCK_EVENTS as Array<{ id: string; name: string; location: string }>).filter(
    (e) => e.name.toLowerCase().includes(q) || e.location.toLowerCase().includes(q)
  )
  const courses = (MOCK_COURSES as Array<{ id: string; name: string; artist: string }>).filter(
    (c) => c.name.toLowerCase().includes(q) || c.artist.toLowerCase().includes(q)
  )
  const artists = (MOCK_ARTISTS as Array<{ id: string; name: string; genre: string }>).filter(
    (a) => a.name.toLowerCase().includes(q) || a.genre.toLowerCase().includes(q)
  )

  const hasResults = events.length > 0 || courses.length > 0 || artists.length > 0

  if (!hasResults) {
    return <p className="p-4 text-sm text-muted-foreground">{t("search.noResults")}</p>
  }

  return (
    <div className="divide-y divide-border">
      {artists.length > 0 && (
        <div className="p-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Artists</p>
          {artists.map((a) => (
            <Link key={a.id} href="/ranking" onClick={onClose} className="block px-3 py-2 rounded-lg hover:bg-muted text-sm text-card-foreground transition-colors truncate">
              {a.name} <span className="text-muted-foreground">- {a.genre}</span>
            </Link>
          ))}
        </div>
      )}
      {events.length > 0 && (
        <div className="p-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Events</p>
          {events.map((e) => (
            <Link key={e.id} href={`/events/${e.id}`} onClick={onClose} className="block px-3 py-2 rounded-lg hover:bg-muted text-sm text-card-foreground transition-colors truncate">
              {e.name} <span className="text-muted-foreground">- {e.location}</span>
            </Link>
          ))}
        </div>
      )}
      {courses.length > 0 && (
        <div className="p-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Courses</p>
          {courses.map((c) => (
            <Link key={c.id} href="/learn" onClick={onClose} className="block px-3 py-2 rounded-lg hover:bg-muted text-sm text-card-foreground transition-colors truncate">
              {c.name} <span className="text-muted-foreground">by {c.artist}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
