"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  BarChart3, TrendingUp, DollarSign, Users, Ticket, Globe,
  ArrowUpRight, ArrowDownRight, BookOpen, Crown, Wallet,
  Download, FileText, Zap, HardDrive, Upload,
} from "lucide-react"
import { useLang, useWallet, useAuth } from "@/components/providers"
import {
  getPurchasedTickets, getCourseProgress, getTransactions,
  computePlatformAnalytics, PLAN_DEFINITIONS,
} from "@/lib/store"
import { PageTransition, FadeIn } from "@/components/page-transition"

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
  const { user, usage, subscription } = useAuth()
  const { transactions } = useWallet()
  const purchasedTickets = getPurchasedTickets()
  const courseProgress = getCourseProgress()

  const plan = user ? PLAN_DEFINITIONS[user.tier] : PLAN_DEFINITIONS.free

  const totalSpent = transactions.filter(tx => tx.type === "debit").reduce((sum, tx) => sum + tx.amount, 0)
  const totalTickets = purchasedTickets.reduce((sum, pt) => sum + pt.qty, 0)
  const activeCourses = Object.keys(courseProgress).length

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

      {/* Plan Usage */}
      <FadeIn delay={0.15}>
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <h2 className="font-display font-semibold text-lg text-card-foreground mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Plan Usage
            <span className="ml-auto text-xs font-medium px-2 py-1 rounded-md bg-primary/10 text-primary capitalize">{plan.name}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Mutations */}
            <div>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-muted-foreground flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> Mutations</span>
                <span className="text-card-foreground font-medium">
                  {usage?.mutationsUsed ?? 0} / {plan.mutationLimit === -1 ? "Unlimited" : plan.mutationLimit === 0 ? "0" : plan.mutationLimit}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: plan.mutationLimit <= 0 ? "0%" : `${Math.min(100, ((usage?.mutationsUsed ?? 0) / plan.mutationLimit) * 100)}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full rounded-full bg-primary"
                />
              </div>
            </div>
            {/* Uploads */}
            <div>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-muted-foreground flex items-center gap-1.5"><Upload className="h-3.5 w-3.5" /> Uploads</span>
                <span className="text-card-foreground font-medium">
                  {usage?.uploadsUsed ?? 0} / {plan.uploadLimit === -1 ? "Unlimited" : plan.uploadLimit}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: plan.uploadLimit <= 0 ? "0%" : plan.uploadLimit === -1 ? "0%" : `${Math.min(100, ((usage?.uploadsUsed ?? 0) / plan.uploadLimit) * 100)}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full rounded-full bg-chart-2"
                />
              </div>
            </div>
            {/* Storage */}
            <div>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-muted-foreground flex items-center gap-1.5"><HardDrive className="h-3.5 w-3.5" /> Storage</span>
                <span className="text-card-foreground font-medium">
                  {(usage?.storageUsedMb ?? 0).toFixed(0)} MB / {plan.storageLimitMb === -1 ? "Unlimited" : `${plan.storageLimitMb} MB`}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: plan.storageLimitMb <= 0 ? "0%" : plan.storageLimitMb === -1 ? "0%" : `${Math.min(100, ((usage?.storageUsedMb ?? 0) / plan.storageLimitMb) * 100)}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full rounded-full bg-chart-4"
                />
              </div>
            </div>
          </div>
          {subscription && subscription.tier !== "free" && (
            <p className="text-xs text-muted-foreground mt-3">
              Period resets: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </p>
          )}
        </div>
      </FadeIn>

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
                <span className="text-sm text-muted-foreground">Status</span>
                <span className={`text-sm font-semibold ${subscription?.status === "active" ? "text-chart-2" : "text-destructive"}`}>
                  {subscription?.status ?? "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Coins</span>
                <span className="text-sm font-semibold text-card-foreground">{user?.coins?.toLocaleString() ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Badges</span>
                <div className="flex items-center gap-1">
                  {user?.badges && user.badges.length > 0 ? user.badges.map(b => (
                    <span key={b} className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary">{b}</span>
                  )) : (
                    <span className="text-xs text-muted-foreground">None</span>
                  )}
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

  const analytics = useMemo(() => computePlatformAnalytics(), [])

  const stats = [
    { label: t("dash.revenue"), value: `$${analytics.totalRevenue.toLocaleString()}`, icon: DollarSign, detail: analytics.totalRevenue === 0 ? "No revenue yet" : undefined },
    { label: t("dash.ticketSales"), value: analytics.ticketsSold.toString(), icon: Ticket },
    { label: "Registered Users", value: analytics.totalUsers.toString(), icon: Users },
    { label: "Subscribed", value: analytics.subscribedUsers.toString(), icon: Crown },
  ]

  const maxRevenue = analytics.monthlyData.length > 0 ? Math.max(...analytics.monthlyData.map(d => d.revenue), 1) : 1

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
              <span className="text-xs text-muted-foreground">
                {analytics.monthlyData.length === 0 ? "No data" : `Last ${analytics.monthlyData.length} months`}
              </span>
            </div>
            {analytics.monthlyData.length === 0 ? (
              <div className="h-48 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No revenue data yet. Revenue will appear as transactions occur.</p>
              </div>
            ) : (
              <div className="flex items-end gap-3 h-48">
                {analytics.monthlyData.map((d, i) => {
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
            )}
          </div>
        </FadeIn>

        {/* Platform Stats */}
        <FadeIn delay={0.25}>
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-display font-semibold text-lg text-card-foreground flex items-center gap-2 mb-6">
              <Globe className="h-5 w-5 text-primary" />
              Platform Stats
            </h2>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Users (30d)</span>
                <span className="text-sm font-semibold text-card-foreground">{analytics.activeUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Mutations</span>
                <span className="text-sm font-semibold text-card-foreground">{analytics.totalMutations}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Storage Used</span>
                <span className="text-sm font-semibold text-card-foreground">{analytics.totalStorageMb.toFixed(1)} MB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Suspended</span>
                <span className="text-sm font-semibold text-destructive">{analytics.suspendedUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Net Revenue</span>
                <span className="text-sm font-semibold text-chart-2">${analytics.netRevenue.toLocaleString()}</span>
              </div>
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
          {analytics.recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {analytics.recentActivity.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{entry.userName} - {entry.action.replace(/_/g, " ")}</p>
                    <p className="text-xs text-muted-foreground">{entry.targetResource}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(entry.timestamp).toLocaleString()}
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

// ======================== FINANCE DASHBOARD ========================
function FinanceDashboard() {
  const analytics = useMemo(() => computePlatformAnalytics(), [])
  const allTransactions = getTransactions()

  const financeStats = [
    { label: "Gross Revenue", value: `$${analytics.totalRevenue.toLocaleString()}`, icon: DollarSign },
    { label: "Total Refunds", value: `$${analytics.totalRefunds.toLocaleString()}`, icon: ArrowDownRight },
    { label: "Net Revenue", value: `$${analytics.netRevenue.toLocaleString()}`, icon: TrendingUp },
    { label: "Total Tickets Sold", value: analytics.ticketsSold.toString(), icon: Ticket },
  ]

  function handleExport() {
    if (analytics.monthlyData.length === 0) return
    const csv = "Month,Revenue,Refunds,Net,Tickets\n" + analytics.monthlyData.map(m => `${m.month},${m.revenue},${m.refunds},${m.net},${m.tickets}`).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = "revenue-report.csv"; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">Financial overview. All data computed from real transactions.</p>
        <button onClick={handleExport} disabled={analytics.monthlyData.length === 0} className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
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
          {analytics.monthlyData.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">No monthly data yet. Revenue will appear as transactions occur.</p>
            </div>
          ) : (
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
                  {analytics.monthlyData.map((m, i) => (
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
          )}
        </div>
      </FadeIn>

      {/* Transaction Log */}
      <FadeIn delay={0.3}>
        <div className="bg-card border border-border rounded-2xl p-6 mt-6">
          <h2 className="font-display font-semibold text-lg text-card-foreground mb-4">
            Transaction Log
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
