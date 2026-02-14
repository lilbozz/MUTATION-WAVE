"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShoppingCart, FileDown, Search, Filter, Ticket,
  CheckCircle2, XCircle, AlertTriangle,
} from "lucide-react"
import { PermissionGuard } from "@/components/permission-guard"
import { PageTransition, FadeIn } from "@/components/page-transition"
import { getPurchasedTickets, getTransactions } from "@/lib/store"
import { useAuth, useWallet, useNotifications } from "@/components/providers"

type FilterType = "all" | "full" | "installment"

export default function OrdersPage() {
  const { user, logAction, updateUser } = useAuth()
  const { addTransaction } = useWallet()
  const { addNotification } = useNotifications()
  const tickets = getPurchasedTickets()
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterType>("all")
  const [refundingId, setRefundingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let result = tickets
    if (filter !== "all") result = result.filter(t => t.paymentType === filter)
    if (search) result = result.filter(t => t.eventName.toLowerCase().includes(search.toLowerCase()))
    return result
  }, [tickets, filter, search])

  function handleRefund(ticketId: string) {
    const ticket = tickets.find(t => t.id === ticketId)
    if (!ticket || !user) return
    updateUser({ walletBalance: user.walletBalance + ticket.totalPaid })
    addTransaction({
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      description: `Refund: ${ticket.eventName} x${ticket.qty}`,
      amount: ticket.totalPaid,
      type: "refund",
    })
    logAction("refund", `order:${ticketId}`, undefined, `$${ticket.totalPaid}`)
    addNotification(`Refunded $${ticket.totalPaid} for ${ticket.eventName}`)
    setRefundingId(null)
  }

  function handleExport() {
    const csv = ["Order ID,Event,Qty,Total Paid,Payment Type,Date"]
    tickets.forEach(t => {
      csv.push(`${t.id},"${t.eventName}",${t.qty},${t.totalPaid},${t.paymentType},${t.purchasedAt}`)
    })
    const blob = new Blob([csv.join("\n")], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <PermissionGuard requiredPermissions={["canViewAdminDashboard"]}>
      <PageTransition>
        <div className="p-4 lg:p-8 max-w-6xl mx-auto">
          <FadeIn>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div>
                <h1 className="font-display font-bold text-2xl text-foreground">Orders</h1>
                <p className="text-sm text-muted-foreground">{tickets.length} total orders</p>
              </div>
              <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:bg-primary/90 transition-colors shrink-0">
                <FileDown className="h-4 w-4" /> Export CSV
              </button>
            </div>
          </FadeIn>

          {/* Filters */}
          <FadeIn delay={0.05}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
              <div className="relative flex-1 max-w-sm w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Search by event name..." />
              </div>
              <div className="flex items-center gap-1.5">
                {(["all", "full", "installment"] as FilterType[]).map(f => (
                  <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
                    {f === "all" ? "All" : f === "full" ? "Full Payment" : "Installment"}
                  </button>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Orders Table */}
          {filtered.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-10 text-center">
              <ShoppingCart className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">{search || filter !== "all" ? "No orders match your filters." : "No orders yet."}</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase">Order ID</th>
                      <th className="px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase">Event</th>
                      <th className="px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase text-right">Qty</th>
                      <th className="px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase text-right">Paid</th>
                      <th className="px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase">Type</th>
                      <th className="px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase">Date</th>
                      <th className="px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(ticket => (
                      <tr key={ticket.id} className="border-b border-border/50 last:border-0">
                        <td className="px-4 py-2.5 text-[11px] font-mono text-muted-foreground">{ticket.id.slice(0, 12)}...</td>
                        <td className="px-4 py-2.5 text-xs text-card-foreground truncate max-w-[180px]">{ticket.eventName}</td>
                        <td className="px-4 py-2.5 text-xs text-right font-medium text-card-foreground">{ticket.qty}</td>
                        <td className="px-4 py-2.5 text-xs text-right font-semibold text-card-foreground">${ticket.totalPaid}</td>
                        <td className="px-4 py-2.5">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${ticket.paymentType === "full" ? "bg-chart-2/10 text-chart-2" : "bg-chart-4/10 text-chart-4"}`}>{ticket.paymentType}</span>
                        </td>
                        <td className="px-4 py-2.5 text-[11px] text-muted-foreground whitespace-nowrap">{new Date(ticket.purchasedAt).toLocaleDateString()}</td>
                        <td className="px-4 py-2.5 text-right">
                          {refundingId === ticket.id ? (
                            <div className="flex items-center gap-1 justify-end">
                              <button onClick={() => handleRefund(ticket.id)} className="px-2 py-1 text-[11px] font-semibold bg-destructive/10 text-destructive rounded hover:bg-destructive/20 transition-colors">Confirm</button>
                              <button onClick={() => setRefundingId(null)} className="px-2 py-1 text-[11px] text-muted-foreground rounded hover:bg-muted transition-colors">Cancel</button>
                            </div>
                          ) : (
                            <button onClick={() => setRefundingId(ticket.id)} className="text-[11px] text-primary hover:underline">Refund</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </PageTransition>
    </PermissionGuard>
  )
}
