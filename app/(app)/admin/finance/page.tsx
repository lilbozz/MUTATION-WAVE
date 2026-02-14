"use client"

import { useState, useMemo } from "react"
import {
  DollarSign, Calendar, Music, Crown, FileDown, Receipt,
} from "lucide-react"
import { PermissionGuard } from "@/components/permission-guard"
import { PageTransition, FadeIn } from "@/components/page-transition"
import {
  MOCK_EVENTS, MOCK_ARTISTS, getCustomEvents, getPurchasedTickets,
  getTransactions, getAllRegisteredUsers,
} from "@/lib/store"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts"

const COLORS = ["hsl(217,91%,60%)", "hsl(160,60%,45%)", "hsl(30,80%,55%)", "hsl(280,65%,60%)", "hsl(340,75%,55%)", "hsl(43,74%,66%)"]

export default function FinancePage() {
  const transactions = getTransactions()
  const tickets = getPurchasedTickets()
  const users = getAllRegisteredUsers()
  const allEvents = [...MOCK_EVENTS, ...getCustomEvents()]

  const totalRevenue = transactions.filter(t => t.type === "debit").reduce((s, t) => s + t.amount, 0)
  const totalRefunds = transactions.filter(t => t.type === "refund").reduce((s, t) => s + t.amount, 0)
  const netRevenue = totalRevenue - totalRefunds
  const taxRate = 0.07
  const estimatedTax = Math.round(netRevenue * taxRate)

  const subRevenue = users.filter(u => u.tier === "pro").length * 29 + users.filter(u => u.tier === "member").length * 9

  // Revenue per event
  const revenuePerEvent = useMemo(() => {
    const map: Record<string, { name: string; revenue: number }> = {}
    tickets.forEach(t => {
      if (!map[t.eventId]) map[t.eventId] = { name: t.eventName, revenue: 0 }
      map[t.eventId].revenue += t.totalPaid
    })
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 6).map(e => ({
      name: e.name.length > 16 ? e.name.slice(0, 16) + "..." : e.name,
      revenue: e.revenue,
    }))
  }, [tickets])

  // Revenue by type pie
  const revenueByType = [
    { name: "Ticket Sales", value: totalRevenue },
    { name: "Subscriptions", value: subRevenue },
    { name: "Refunds", value: totalRefunds },
  ].filter(d => d.value > 0)

  // Fallback data if no transactions exist
  const hasData = totalRevenue > 0 || subRevenue > 0

  const kpis = [
    { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-primary bg-primary/10" },
    { label: "Net Revenue", value: `$${netRevenue.toLocaleString()}`, icon: Receipt, color: "text-chart-2 bg-chart-2/10" },
    { label: "Subscription Rev.", value: `$${subRevenue.toLocaleString()}/mo`, icon: Crown, color: "text-chart-4 bg-chart-4/10" },
    { label: "Est. Tax (7%)", value: `$${estimatedTax.toLocaleString()}`, icon: FileDown, color: "text-chart-5 bg-chart-5/10" },
  ]

  function handleExport() {
    const csv = ["Date,Description,Amount,Type"]
    transactions.forEach(t => {
      csv.push(`${t.date},"${t.description}",${t.amount},${t.type}`)
    })
    const blob = new Blob([csv.join("\n")], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `finance-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <PermissionGuard requiredPermissions={["canViewFinanceDashboard"]}>
      <PageTransition>
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <FadeIn>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div>
                <h1 className="font-display font-bold text-2xl text-foreground">Finance</h1>
                <p className="text-sm text-muted-foreground">Revenue breakdown, tax summary, and export.</p>
              </div>
              <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:bg-primary/90 transition-colors shrink-0">
                <FileDown className="h-4 w-4" /> Export CSV
              </button>
            </div>
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
                <h3 className="font-semibold text-sm text-card-foreground mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" /> Revenue per Event
                </h3>
                {revenuePerEvent.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-10 text-center">No event revenue data yet. Purchase tickets to see data.</p>
                ) : (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenuePerEvent}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                        <Bar dataKey="revenue" fill="hsl(217,91%,60%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold text-sm text-card-foreground mb-4 flex items-center gap-2">
                  <Music className="h-4 w-4 text-chart-2" /> Revenue Breakdown
                </h3>
                {!hasData ? (
                  <p className="text-xs text-muted-foreground py-10 text-center">No financial data yet.</p>
                ) : (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={revenueByType} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {revenueByType.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </FadeIn>
          </div>

          {/* Transaction Table */}
          <FadeIn delay={0.2}>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="font-semibold text-sm text-card-foreground">All Transactions ({transactions.length})</h3>
              </div>
              {transactions.length === 0 ? (
                <p className="text-xs text-muted-foreground py-10 text-center">No transactions yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase">Date</th>
                        <th className="px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase">Description</th>
                        <th className="px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase text-right">Amount</th>
                        <th className="px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 20).map(tx => (
                        <tr key={tx.id} className="border-b border-border/50 last:border-0">
                          <td className="px-5 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{tx.date}</td>
                          <td className="px-5 py-2.5 text-xs text-card-foreground max-w-[240px] truncate">{tx.description}</td>
                          <td className={`px-5 py-2.5 text-xs font-semibold text-right ${tx.type === "credit" ? "text-chart-2" : tx.type === "refund" ? "text-chart-4" : "text-foreground"}`}>${tx.amount}</td>
                          <td className="px-5 py-2.5">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                              tx.type === "credit" ? "bg-chart-2/10 text-chart-2" :
                              tx.type === "refund" ? "bg-chart-4/10 text-chart-4" :
                              "bg-muted text-muted-foreground"
                            }`}>{tx.type}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </FadeIn>
        </div>
      </PageTransition>
    </PermissionGuard>
  )
}
