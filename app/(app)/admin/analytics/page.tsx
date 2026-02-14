"use client"

import { useMemo } from "react"
import {
  Users, TrendingUp, Eye, Repeat, Star,
} from "lucide-react"
import { PermissionGuard } from "@/components/permission-guard"
import { PageTransition, FadeIn } from "@/components/page-transition"
import { MOCK_EVENTS, MOCK_ARTISTS, getAllRegisteredUsers, getPurchasedTickets } from "@/lib/store"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts"

const COLORS = ["hsl(217,91%,60%)", "hsl(160,60%,45%)", "hsl(30,80%,55%)", "hsl(280,65%,60%)", "hsl(340,75%,55%)"]

export default function AnalyticsPage() {
  const users = getAllRegisteredUsers()
  const tickets = getPurchasedTickets()

  const dau = Math.max(1, Math.round(users.length * 0.35))
  const conversionRate = tickets.length > 0 ? Math.min(100, ((tickets.length / Math.max(users.length, 1)) * 100)).toFixed(1) : "0"
  const retentionRate = "68.4"

  const topEvents = useMemo(() =>
    MOCK_EVENTS.map(e => ({
      name: e.name.length > 18 ? e.name.slice(0, 18) + "..." : e.name,
      views: Math.floor(Math.random() * 5000) + 1000,
    })).sort((a, b) => b.views - a.views).slice(0, 5)
  , [])

  const topArtists = useMemo(() =>
    MOCK_ARTISTS.map(a => ({
      name: a.name,
      views: a.points + Math.floor(Math.random() * 2000),
    })).sort((a, b) => b.views - a.views).slice(0, 5)
  , [])

  const dailyActiveData = Array.from({ length: 14 }, (_, i) => ({
    day: `Day ${i + 1}`,
    dau: Math.round(dau * (0.7 + Math.random() * 0.6)),
  }))

  const kpis = [
    { label: "DAU", value: dau.toString(), icon: Users, color: "text-primary bg-primary/10" },
    { label: "Conversion Rate", value: `${conversionRate}%`, icon: TrendingUp, color: "text-chart-2 bg-chart-2/10" },
    { label: "Avg. Views/Event", value: Math.round(topEvents.reduce((s, e) => s + e.views, 0) / topEvents.length).toLocaleString(), icon: Eye, color: "text-chart-3 bg-chart-3/10" },
    { label: "Retention Rate", value: `${retentionRate}%`, icon: Repeat, color: "text-chart-4 bg-chart-4/10" },
  ]

  return (
    <PermissionGuard requiredPermissions={["canViewAdminDashboard"]}>
      <PageTransition>
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <FadeIn>
            <h1 className="font-display font-bold text-2xl text-foreground mb-1">Analytics</h1>
            <p className="text-sm text-muted-foreground mb-6">Platform engagement and performance metrics.</p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {kpis.map((kpi, i) => (
              <FadeIn key={kpi.label} delay={i * 0.05}>
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center mb-3 ${kpi.color}`}>
                    <kpi.icon className="h-4 w-4" />
                  </div>
                  <p className="font-display font-bold text-2xl text-card-foreground">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <FadeIn delay={0.1}>
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold text-sm text-card-foreground mb-4">Daily Active Users (14d)</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyActiveData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Line type="monotone" dataKey="dau" stroke="hsl(217,91%,60%)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold text-sm text-card-foreground mb-4">Top Events by Views</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topEvents} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="views" fill="hsl(160,60%,45%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.2}>
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-sm text-card-foreground mb-4 flex items-center gap-2">
                <Star className="h-4 w-4 text-chart-4" /> Most Viewed Artists
              </h3>
              <div className="flex flex-col gap-2">
                {topArtists.map((a, i) => (
                  <div key={a.name} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/30 transition-colors">
                    <span className="text-xs font-bold text-muted-foreground w-5 text-right">{i + 1}</span>
                    <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0" style={{ background: COLORS[i % COLORS.length] + "22" }}>
                      <span className="text-[10px] font-bold" style={{ color: COLORS[i % COLORS.length] }}>{a.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground truncate">{a.name}</p>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">{a.views.toLocaleString()} views</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </PageTransition>
    </PermissionGuard>
  )
}
