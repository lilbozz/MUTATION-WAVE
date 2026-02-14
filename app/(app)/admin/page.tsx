"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import {
  DollarSign, Ticket, Users, Crown, AlertTriangle, Activity,
  TrendingUp, TrendingDown, ArrowUpRight,
} from "lucide-react"
import { useAuth } from "@/components/providers"
import { PermissionGuard } from "@/components/permission-guard"
import {
  MOCK_EVENTS, getCustomEvents, getPurchasedTickets, getAuditLog,
  getAllRegisteredUsers, getTransactions,
} from "@/lib/store"
import { PageTransition, FadeIn } from "@/components/page-transition"
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line,
} from "recharts"

// Generate mock trend data
function generateTrendData(months: number, baseVal: number, growth: number) {
  const data = []
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  for (let i = 0; i < months; i++) {
    data.push({
      month: labels[i % 12],
      value: Math.round(baseVal + (growth * i) + (Math.random() * baseVal * 0.2)),
    })
  }
  return data
}

const revenueData = generateTrendData(8, 12000, 2500)
const ticketData = generateTrendData(8, 200, 45)
const userGrowthData = generateTrendData(8, 500, 120)

export default function AdminDashboardPage() {
  const { user, can } = useAuth()
  const purchasedTickets = getPurchasedTickets()
  const registeredUsers = getAllRegisteredUsers()
  const transactions = getTransactions()
  const auditLog = getAuditLog()
  const allEvents = [...MOCK_EVENTS, ...getCustomEvents()]

  const totalRevenue = useMemo(() =>
    transactions.filter(t => t.type === "debit").reduce((s, t) => s + t.amount, 0), [transactions])
  const ticketsSold = purchasedTickets.reduce((s, t) => s + t.qty, 0)
  const activeUsers = registeredUsers.filter(u => !u.suspended).length
  const subCount = registeredUsers.filter(u => u.tier !== "free").length
  const lowStockEvents = allEvents.filter(e => e.ticketsLeft > 0 && e.ticketsLeft < 20)
  const recentActivity = auditLog.slice(0, 8)

  const stats = [
    { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, trend: "+12.5%", up: true, color: "text-primary bg-primary/10" },
    { label: "Tickets Sold", value: ticketsSold.toString(), icon: Ticket, trend: "+8.3%", up: true, color: "text-chart-2 bg-chart-2/10" },
    { label: "Active Users", value: activeUsers.toString(), icon: Users, trend: "+24.1%", up: true, color: "text-chart-3 bg-chart-3/10" },
    { label: "Subscriptions", value: subCount.toString(), icon: Crown, trend: "+5.7%", up: true, color: "text-chart-4 bg-chart-4/10" },
  ]

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
                    <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${stat.up ? "text-chart-2" : "text-destructive"}`}>
                      {stat.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {stat.trend}
                    </span>
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
                <h3 className="font-semibold text-sm text-card-foreground mb-4">User Growth</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                      />
                      <Line type="monotone" dataKey="value" stroke="hsl(30, 80%, 55%)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
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
                {recentActivity.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">No recent activity.</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {recentActivity.map(entry => (
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
