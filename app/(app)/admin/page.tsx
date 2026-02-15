"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import {
  DollarSign, Ticket, Users, Crown, AlertTriangle, Activity,
} from "lucide-react"
import { useAuth } from "@/components/providers"
import { PermissionGuard } from "@/components/permission-guard"
import {
  MOCK_EVENTS, getCustomEvents, computePlatformAnalytics,
} from "@/lib/store"
import { PageTransition, FadeIn } from "@/components/page-transition"
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts"



export default function AdminDashboardPage() {
  const { user, can } = useAuth()
  const analytics = useMemo(() => computePlatformAnalytics(), [])
  const allEvents = [...MOCK_EVENTS, ...getCustomEvents()]
  const lowStockEvents = allEvents.filter(e => e.ticketsLeft > 0 && e.ticketsLeft < 20)

  const stats = [
    { label: "Total Revenue", value: `$${analytics.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-primary bg-primary/10" },
    { label: "Tickets Sold", value: analytics.ticketsSold.toString(), icon: Ticket, color: "text-chart-2 bg-chart-2/10" },
    { label: "Active Users (30d)", value: analytics.activeUsers.toString(), icon: Users, color: "text-chart-3 bg-chart-3/10" },
    { label: "Subscriptions", value: analytics.subscribedUsers.toString(), icon: Crown, color: "text-chart-4 bg-chart-4/10" },
  ]

  // Build chart data from real monthly data
  const revenueData = analytics.monthlyData.map(m => ({ month: m.month, value: m.revenue }))
  const ticketData = analytics.monthlyData.map(m => ({ month: m.month, value: m.tickets }))

  return (
    <PermissionGuard requiredPermissions={["canViewAdminDashboard"]}>
      <PageTransition>
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <FadeIn>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground mb-1">Dashboard</h1>
            <p className="text-sm text-muted-foreground mb-6">Overview of platform performance and activity.</p>
          </FadeIn>

          {/* KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.05}>
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-[11px] font-semibold text-muted-foreground">live</span>
                  </div>
                  <p className="font-display font-bold text-2xl text-card-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <FadeIn delay={0.1}>
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold text-sm text-card-foreground mb-4">Revenue Trend</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                        labelStyle={{ color: "hsl(var(--card-foreground))" }}
                      />
                      <Area type="monotone" dataKey="value" stroke="hsl(217, 91%, 60%)" fill="url(#revGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold text-sm text-card-foreground mb-4">Ticket Sales</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ticketData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                      />
                      <Bar dataKey="value" fill="hsl(160, 60%, 45%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2} className="lg:col-span-2">
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold text-sm text-card-foreground mb-4">Platform Summary</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="font-display font-bold text-2xl text-card-foreground">{analytics.totalUsers}</p>
                    <p className="text-xs text-muted-foreground">Total Users</p>
                  </div>
                  <div className="text-center">
                    <p className="font-display font-bold text-2xl text-card-foreground">{analytics.totalMutations}</p>
                    <p className="text-xs text-muted-foreground">Total Mutations</p>
                  </div>
                  <div className="text-center">
                    <p className="font-display font-bold text-2xl text-card-foreground">{analytics.totalStorageMb.toFixed(1)} MB</p>
                    <p className="text-xs text-muted-foreground">Storage Used</p>
                  </div>
                  <div className="text-center">
                    <p className="font-display font-bold text-2xl text-destructive">{analytics.suspendedUsers}</p>
                    <p className="text-xs text-muted-foreground">Suspended</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Bottom: Low Stock Alerts + Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Low Stock Alerts */}
            <FadeIn delay={0.25}>
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold text-sm text-card-foreground mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-chart-5" />
                  Low Stock Alerts
                </h3>
                {lowStockEvents.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">No low stock events.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {lowStockEvents.map(ev => (
                      <div key={ev.id} className="flex items-center justify-between px-3 py-2 bg-chart-5/5 border border-chart-5/20 rounded-lg">
                        <span className="text-xs font-medium text-card-foreground truncate">{ev.name}</span>
                        <span className="text-xs font-bold text-chart-5 shrink-0 ml-2">{ev.ticketsLeft} left</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FadeIn>

            {/* Recent Activity */}
            <FadeIn delay={0.3}>
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold text-sm text-card-foreground mb-4 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Recent Activity
                </h3>
                {analytics.recentActivity.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">No recent activity.</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {analytics.recentActivity.map(entry => (
                      <div key={entry.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-card-foreground truncate">
                            <span className="font-medium">{entry.userName}</span>{" "}
                            <span className="text-muted-foreground">{entry.action.replace(/_/g, " ")}</span>
                          </p>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">
                          {new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FadeIn>
          </div>
        </div>
      </PageTransition>
    </PermissionGuard>
  )
}
