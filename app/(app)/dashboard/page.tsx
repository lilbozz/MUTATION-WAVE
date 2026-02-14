"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  BarChart3, TrendingUp, DollarSign, Users, Ticket, Globe,
  ArrowUpRight, ArrowDownRight, BookOpen, Trophy, Crown, Wallet,
  Star, Download, FileText,
} from "lucide-react"
import { useLang, useWallet, useAuth } from "@/components/providers"
import { MOCK_EVENTS, MOCK_COURSES, getPurchasedTickets, getCourseProgress, getAuditLog, getAllRegisteredUsers, getTransactions } from "@/lib/store"
import { PageTransition, FadeIn } from "@/components/page-transition"

const MONTHLY_DATA = [
  { month: "Sep", revenue: 4200, tickets: 38 },
  { month: "Oct", revenue: 5800, tickets: 52 },
  { month: "Nov", revenue: 7100, tickets: 64 },
  { month: "Dec", revenue: 6300, tickets: 55 },
  { month: "Jan", revenue: 8500, tickets: 71 },
  { month: "Feb", revenue: 9200, tickets: 82 },
]

const GEO_DATA = [
  { country: "Japan", pct: 28, color: "bg-primary" },
  { country: "Korea", pct: 22, color: "bg-chart-2" },
  { country: "Thailand", pct: 18, color: "bg-chart-3" },
  { country: "China", pct: 15, color: "bg-chart-4" },
  { country: "Other", pct: 17, color: "bg-chart-5" },
]

export default function DashboardPage() {
  const { user, can, canAny } = useAuth()
  const showAdminDash = canAny(["canViewAdminDashboard", "canViewAnalytics"])
  const showFinanceDash = can("canViewFinanceDashboard")
  const tabs = [
    { key: "user" as const, label: "My Dashboard", show: true },
    ...(showAdminDash ? [{ key: "admin" as const, label: "Admin Analytics", show: true }] : []),
    ...(showFinanceDash ? [{ key: "finance" as const, label: "Finance", show: true }] : []),
  ]
  const [activeTab, setActiveTab] = useState<"user" | "admin" | "finance">("user")

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
        <FadeIn>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground mb-4">
            Dashboard
          </h1>
        </FadeIn>

        {/* Dashboard Tabs */}
        {tabs.length > 1 && (
          <FadeIn delay={0.05}>
            <div className="flex items-center gap-2 mb-8">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.key ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </FadeIn>
        )}

        {activeTab === "user" && <UserDashboard />}
        {activeTab === "admin" && showAdminDash && <AdminDashboard />}
        {activeTab === "finance" && showFinanceDash && <FinanceDashboard />}
      </div>
    </PageTransition>
  )
}

// ======================== USER DASHBOARD ========================
function UserDashboard() {
  const { t } = useLang()
  const { user } = useAuth()
  const { transactions } = useWallet()
  const purchasedTickets = getPurchasedTickets()
  const courseProgress = getCourseProgress()

  const totalSpent = transactions.filter(tx => tx.type === "debit").reduce((sum, tx) => sum + tx.amount, 0)
  const totalTickets = purchasedTickets.reduce((sum, pt) => sum + pt.qty, 0)
  const activeCourses = Object.keys(courseProgress).length
  const completedCourses = Object.values(courseProgress).filter(p => p >= 100).length

  const userStats = [
    { label: "Events Attended", value: totalTickets.toString(), icon: Ticket, color: "text-primary" },
    { label: "Active Courses", value: activeCourses.toString(), icon: BookOpen, color: "text-chart-2" },
    { label: "Wallet Balance", value: `$${user?.walletBalance?.toLocaleString() ?? "0"}`, icon: Wallet, color: "text-chart-4" },
    { label: "Total Spent", value: `$${totalSpent.toLocaleString()}`, icon: DollarSign, color: "text-chart-5" },
  ]

  return (
    <>
      {/* User Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {userStats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <FadeIn key={i} delay={i * 0.05}>
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <p className="font-display font-bold text-2xl text-card-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            </FadeIn>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Tickets */}
        <FadeIn delay={0.2}>
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-display font-semibold text-lg text-card-foreground mb-4 flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" />
              My Tickets
            </h2>
            {purchasedTickets.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tickets purchased yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {purchasedTickets.slice(0, 5).map(pt => (
                  <div key={pt.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{pt.eventName}</p>
                      <p className="text-xs text-muted-foreground">{pt.qty} ticket(s) &middot; {new Date(pt.purchasedAt).toLocaleDateString()}</p>
                    </div>
                    <span className="text-sm font-semibold text-primary">${pt.totalPaid}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </FadeIn>

        {/* Subscription & Profile */}
        <FadeIn delay={0.25}>
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-display font-semibold text-lg text-card-foreground mb-4 flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Profile Summary
            </h2>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subscription</span>
                <span className="text-sm font-semibold text-card-foreground capitalize">{user?.tier}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Coins</span>
                <span className="text-sm font-semibold text-card-foreground">{user?.coins?.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Badges</span>
                <div className="flex items-center gap-1">
                  {user?.badges?.map(b => (
                    <span key={b} className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary">{b}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Member Since</span>
                <span className="text-sm text-card-foreground">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</span>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Recent Transactions */}
      <FadeIn delay={0.3}>
        <div className="bg-card border border-border rounded-2xl p-6 mt-6">
          <h2 className="font-display font-semibold text-lg text-card-foreground mb-4">
            Recent Transactions
          </h2>
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {transactions.slice(0, 5).map(tx => (
                <div key={tx.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                  </div>
                  <span className={`text-sm font-semibold ${tx.type === "debit" ? "text-card-foreground" : "text-green-500"}`}>
                    {tx.type === "debit" ? "-" : "+"}${tx.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </FadeIn>
    </>
  )
}

// ======================== ADMIN DASHBOARD ========================
function AdminDashboard() {
  const { t } = useLang()
  const { transactions } = useWallet()
  const purchasedTickets = getPurchasedTickets()
  const registeredUsers = getAllRegisteredUsers()

  const totalRevenue = transactions.filter(tx => tx.type === "debit").reduce((sum, tx) => sum + tx.amount, 0)
  const totalTickets = purchasedTickets.reduce((sum, pt) => sum + pt.qty, 0)
  const maxRevenue = Math.max(...MONTHLY_DATA.map(d => d.revenue))

  const stats = [
    { label: t("dash.revenue"), value: `$${(totalRevenue + 9200).toLocaleString()}`, change: "+12.5%", up: true, icon: DollarSign },
    { label: t("dash.ticketSales"), value: `${totalTickets + 82}`, change: "+8.2%", up: true, icon: Ticket },
    { label: "Registered Users", value: registeredUsers.length.toString(), change: "+15.3%", up: true, icon: Users },
    { label: t("dash.conversionRate"), value: "4.8%", change: "-0.3%", up: false, icon: TrendingUp },
  ]

  const ACTIVITY = [
    { action: "New ticket purchase", detail: "Tokyo Neon Nights x2", time: "2 min ago" },
    { action: "Course enrollment", detail: "Sound Design Masterclass", time: "15 min ago" },
    { action: "Subscription upgrade", detail: "Free to Member", time: "1 hr ago" },
    { action: "Refund processed", detail: "Seoul Wave Festival x1", time: "3 hrs ago" },
    { action: "New fan follow", detail: "+12 followers today", time: "5 hrs ago" },
  ]

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <FadeIn key={i} delay={i * 0.05}>
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className={`flex items-center gap-0.5 text-xs font-semibold ${stat.up ? "text-green-500" : "text-destructive"}`}>
                    {stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {stat.change}
                  </span>
                </div>
                <p className="font-display font-bold text-2xl text-card-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            </FadeIn>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <FadeIn delay={0.2} className="lg:col-span-2">
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-lg text-card-foreground flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                {t("dash.revenue")}
              </h2>
              <span className="text-xs text-muted-foreground">Last 6 months</span>
            </div>
            <div className="flex items-end gap-3 h-48">
              {MONTHLY_DATA.map((d, i) => {
                const height = (d.revenue / maxRevenue) * 100
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-semibold text-muted-foreground">${(d.revenue / 1000).toFixed(1)}k</span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.6, delay: 0.3 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full bg-primary/80 rounded-t-lg hover:bg-primary transition-colors cursor-default"
                    />
                    <span className="text-[10px] text-muted-foreground">{d.month}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </FadeIn>

        {/* Geographic Distribution */}
        <FadeIn delay={0.25}>
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-display font-semibold text-lg text-card-foreground flex items-center gap-2 mb-6">
              <Globe className="h-5 w-5 text-primary" />
              {t("dash.geoMap")}
            </h2>
            <div className="flex flex-col gap-4">
              {GEO_DATA.map((geo, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-card-foreground font-medium">{geo.country}</span>
                    <span className="text-muted-foreground">{geo.pct}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${geo.pct}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                      className={`h-full rounded-full ${geo.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Activity Feed */}
      <FadeIn delay={0.3}>
        <div className="bg-card border border-border rounded-2xl p-6 mt-6">
          <h2 className="font-display font-semibold text-lg text-card-foreground mb-4">
            {t("dash.activity")}
          </h2>
          <div className="flex flex-col divide-y divide-border">
            {ACTIVITY.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-card-foreground">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </>
  )
}

// ======================== FINANCE DASHBOARD ========================
function FinanceDashboard() {
  const allTransactions = getTransactions()
  const purchasedTickets = getPurchasedTickets()

  const totalRevenue = allTransactions.filter(tx => tx.type === "debit").reduce((sum, tx) => sum + tx.amount, 0)
  const totalRefunds = allTransactions.filter(tx => tx.type === "refund").reduce((sum, tx) => sum + tx.amount, 0)
  const netRevenue = totalRevenue - totalRefunds

  // Monthly summary (simulated)
  const monthlySummary = MONTHLY_DATA.map(m => ({
    ...m,
    refunds: Math.floor(m.revenue * 0.05),
    net: Math.floor(m.revenue * 0.95),
  }))

  const financeStats = [
    { label: "Gross Revenue", value: `$${(totalRevenue + 41100).toLocaleString()}`, icon: DollarSign },
    { label: "Total Refunds", value: `$${(totalRefunds + 2055).toLocaleString()}`, icon: ArrowDownRight },
    { label: "Net Revenue", value: `$${(netRevenue + 39045).toLocaleString()}`, icon: TrendingUp },
    { label: "Total Tickets Sold", value: `${purchasedTickets.reduce((s, p) => s + p.qty, 0) + 362}`, icon: Ticket },
  ]

  function handleExport() {
    // Simulated export
    const csv = "Month,Revenue,Refunds,Net\n" + monthlySummary.map(m => `${m.month},${m.revenue},${m.refunds},${m.net}`).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = "revenue-report.csv"; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">Read-only financial overview. Revenue data is pre-aggregated.</p>
        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors">
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {financeStats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <FadeIn key={i} delay={i * 0.05}>
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <p className="font-display font-bold text-2xl text-card-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            </FadeIn>
          )
        })}
      </div>

      {/* Monthly Breakdown Table */}
      <FadeIn delay={0.2}>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="font-display font-semibold text-lg text-card-foreground">Monthly Revenue Summary</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Month</th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase text-right">Revenue</th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase text-right">Tickets</th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase text-right">Refunds</th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase text-right">Net</th>
                </tr>
              </thead>
              <tbody>
                {monthlySummary.map((m, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-card-foreground">{m.month}</td>
                    <td className="px-5 py-3.5 text-sm text-card-foreground text-right">${m.revenue.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground text-right">{m.tickets}</td>
                    <td className="px-5 py-3.5 text-sm text-destructive text-right">-${m.refunds.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-green-500 text-right">${m.net.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </FadeIn>

      {/* Transaction Log (read-only) */}
      <FadeIn delay={0.3}>
        <div className="bg-card border border-border rounded-2xl p-6 mt-6">
          <h2 className="font-display font-semibold text-lg text-card-foreground mb-4">
            Transaction Log (Read-Only)
          </h2>
          {allTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No transactions recorded.</p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {allTransactions.slice(0, 10).map(tx => (
                <div key={tx.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{tx.date} &middot; ID: {tx.id}</p>
                  </div>
                  <span className={`text-sm font-semibold ${tx.type === "debit" ? "text-card-foreground" : tx.type === "refund" ? "text-chart-4" : "text-green-500"}`}>
                    {tx.type === "debit" ? "-" : "+"}${tx.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </FadeIn>
    </>
  )
}
