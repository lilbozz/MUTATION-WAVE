"use client"

import { useState, useMemo } from "react"
import {
  Package, AlertTriangle, Plus, Minus, History, RefreshCw,
} from "lucide-react"
import { PermissionGuard } from "@/components/permission-guard"
import { PageTransition, FadeIn } from "@/components/page-transition"
import { MOCK_EVENTS, getCustomEvents, type MWEvent } from "@/lib/store"
import { useAuth } from "@/components/providers"

interface StockLog { id: string; sku: string; action: "restock" | "sold" | "adjusted"; qty: number; date: string }

export default function StorePage() {
  const { logAction } = useAuth()
  const allEvents = useMemo(() => [...MOCK_EVENTS, ...getCustomEvents()], [])
  const [stockOverrides, setStockOverrides] = useState<Record<string, number>>({})
  const [stockLog, setStockLog] = useState<StockLog[]>([])
  const [restockId, setRestockId] = useState<string | null>(null)
  const [restockQty, setRestockQty] = useState("10")

  function getStock(event: MWEvent) {
    return stockOverrides[event.id] ?? event.ticketsLeft
  }

  function handleRestock(id: string) {
    const qty = parseInt(restockQty)
    if (isNaN(qty) || qty < 1) return
    const current = getStock(allEvents.find(e => e.id === id)!)
    setStockOverrides(prev => ({ ...prev, [id]: current + qty }))
    setStockLog(prev => [{ id: `sl-${Date.now()}`, sku: id, action: "restock", qty, date: new Date().toISOString() }, ...prev])
    logAction("edit_event", `event:${id}`, `stock: ${current}`, `stock: ${current + qty}`)
    setRestockId(null); setRestockQty("10")
  }

  const lowStockItems = allEvents.filter(e => {
    const s = getStock(e)
    return s > 0 && s < 20
  })

  return (
    <PermissionGuard requiredPermissions={["canEditEvents"]}>
      <PageTransition>
        <div className="p-4 lg:p-8 max-w-5xl mx-auto">
          <FadeIn>
            <h1 className="font-display font-bold text-2xl text-foreground mb-1">Store / Inventory</h1>
            <p className="text-sm text-muted-foreground mb-6">Manage stock levels, SKUs, and track inventory changes.</p>
          </FadeIn>

          {lowStockItems.length > 0 && (
            <FadeIn delay={0.05}>
              <div className="bg-chart-5/5 border border-chart-5/20 rounded-xl p-4 mb-6">
                <p className="text-xs font-semibold text-chart-5 flex items-center gap-2 mb-2"><AlertTriangle className="h-4 w-4" /> Low Stock Alert</p>
                <div className="flex flex-wrap gap-2">
                  {lowStockItems.map(e => (
                    <span key={e.id} className="text-[11px] font-medium text-card-foreground bg-card px-2.5 py-1 rounded-md border border-border">{e.name}: {getStock(e)} left</span>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}

          <div className="bg-card border border-border rounded-xl overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase">SKU</th>
                    <th className="px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase">Product</th>
                    <th className="px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase text-right">Price</th>
                    <th className="px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase text-right">Stock</th>
                    <th className="px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase">Status</th>
                    <th className="px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allEvents.map(event => {
                    const stock = getStock(event)
                    const soldOut = stock === 0
                    const low = stock > 0 && stock < 20
                    return (
                      <tr key={event.id} className="border-b border-border/50 last:border-0">
                        <td className="px-4 py-2.5 text-[11px] font-mono text-muted-foreground">{event.id.toUpperCase()}</td>
                        <td className="px-4 py-2.5 text-xs text-card-foreground truncate max-w-[200px]">{event.name}</td>
                        <td className="px-4 py-2.5 text-xs text-right font-medium text-card-foreground">${event.price}</td>
                        <td className={`px-4 py-2.5 text-xs text-right font-bold ${soldOut ? "text-destructive" : low ? "text-chart-5" : "text-card-foreground"}`}>{stock}</td>
                        <td className="px-4 py-2.5">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                            soldOut ? "bg-destructive/10 text-destructive" :
                            low ? "bg-chart-5/10 text-chart-5" :
                            !event.published ? "bg-muted text-muted-foreground" :
                            "bg-green-500/10 text-green-500"
                          }`}>{soldOut ? "Out of Stock" : low ? "Low" : !event.published ? "Disabled" : "In Stock"}</span>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {restockId === event.id ? (
                            <div className="flex items-center gap-1.5 justify-end">
                              <input type="number" value={restockQty} onChange={e => setRestockQty(e.target.value)} className="w-16 px-2 py-1 bg-surface border border-border rounded text-xs text-foreground text-center" min="1" />
                              <button onClick={() => handleRestock(event.id)} className="px-2 py-1 text-[11px] font-semibold bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors">Add</button>
                              <button onClick={() => setRestockId(null)} className="px-2 py-1 text-[11px] text-muted-foreground rounded hover:bg-muted transition-colors">Cancel</button>
                            </div>
                          ) : (
                            <button onClick={() => setRestockId(event.id)} className="text-[11px] text-primary hover:underline flex items-center gap-1 justify-end">
                              <RefreshCw className="h-3 w-3" /> Restock
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stock History */}
          <FadeIn delay={0.1}>
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-sm text-card-foreground mb-4 flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" /> Stock History
              </h3>
              {stockLog.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No stock changes recorded this session.</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {stockLog.slice(0, 20).map(log => (
                    <div key={log.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/20">
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${log.action === "restock" ? "bg-chart-2/10 text-chart-2" : "bg-muted text-muted-foreground"}`}>{log.action}</span>
                      <span className="text-xs text-card-foreground font-mono">{log.sku.toUpperCase()}</span>
                      <span className="text-xs text-muted-foreground">+{log.qty} units</span>
                      <span className="text-[10px] text-muted-foreground ml-auto">{new Date(log.date).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FadeIn>
        </div>
      </PageTransition>
    </PermissionGuard>
  )
}
