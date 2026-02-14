"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, FileText, Music, Calendar, Package, ShoppingCart,
  Users, Shield, DollarSign, BarChart3, Settings, ScrollText,
  ChevronLeft, ChevronRight, Menu, X,
} from "lucide-react"
import { useAuth } from "@/components/providers"
import type { Permission } from "@/lib/permissions"

interface AdminNavItem {
  href: string
  icon: typeof LayoutDashboard
  label: string
  requiredPermission?: Permission
}

const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard", requiredPermission: "canViewAdminDashboard" },
  { href: "/admin/content", icon: FileText, label: "Content (CMS)", requiredPermission: "canManageCMS" },
  { href: "/admin/artists", icon: Music, label: "Artists", requiredPermission: "canEditArtists" },
  { href: "/admin/events", icon: Calendar, label: "Events", requiredPermission: "canEditEvents" },
  { href: "/admin/store", icon: Package, label: "Store / Inventory", requiredPermission: "canEditEvents" },
  { href: "/admin/orders", icon: ShoppingCart, label: "Orders", requiredPermission: "canViewAdminDashboard" },
  { href: "/admin/users", icon: Users, label: "Users", requiredPermission: "canManageUsers" },
  { href: "/admin/roles", icon: Shield, label: "Roles", requiredPermission: "canManageUsers" },
  { href: "/admin/finance", icon: DollarSign, label: "Finance", requiredPermission: "canViewFinanceDashboard" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics", requiredPermission: "canViewAdminDashboard" },
  { href: "/admin/settings", icon: Settings, label: "Settings", requiredPermission: "canViewAdminDashboard" },
  { href: "/admin/logs", icon: ScrollText, label: "Audit Logs", requiredPermission: "canViewAuditLog" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, can, canAny, isLoading } = useAuth()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => { setMobileOpen(false) }, [pathname])

  // Redirect unauthorized users (handled by individual pages via PermissionGuard)
  const isAdminUser = canAny([
    "canViewAdminDashboard", "canManageCMS", "canEditArtists",
    "canEditEvents", "canManageUsers", "canViewAuditLog", "canViewFinanceDashboard",
  ])

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="h-10 w-10 rounded-xl bg-primary/20 animate-pulse flex items-center justify-center">
          <span className="font-display font-bold text-sm text-primary">MW</span>
        </div>
      </div>
    )
  }

  if (!user || !isAdminUser) return null

  const filteredNav = ADMIN_NAV.filter(item =>
    !item.requiredPermission || can(item.requiredPermission)
  )

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href)
  }

  const sidebarContent = (
    <nav className="flex flex-col gap-1 p-3">
      {filteredNav.map(item => {
        const active = isActive(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
            {active && (
              <motion.div
                layoutId="admin-nav-active"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 border-r border-border bg-card transition-all duration-300 ${
          collapsed ? "w-16" : "w-56"
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-3 border-b border-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">Admin</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>
        {sidebarContent}
      </aside>

      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-4 left-4 z-50 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
        aria-label="Open admin menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64 bg-card border-r border-border overflow-y-auto"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">Admin Panel</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
