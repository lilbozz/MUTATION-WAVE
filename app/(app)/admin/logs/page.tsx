"use client"

import { useState, useEffect, useMemo } from "react"
import {
  ScrollText, Search, Filter, FileDown,
} from "lucide-react"
import { PermissionGuard } from "@/components/permission-guard"
import { PageTransition, FadeIn } from "@/components/page-transition"
import { getAuditLog, type AuditLogEntry } from "@/lib/store"
import { ROLE_META } from "@/lib/permissions"

const ACTION_COLORS: Record<string, string> = {
  login: "text-green-500 bg-green-500/10",
  logout: "text-muted-foreground bg-muted",
  login_failed: "text-destructive bg-destructive/10",
  account_locked: "text-destructive bg-destructive/10",
  register: "text-primary bg-primary/10",
  purchase_ticket: "text-chart-2 bg-chart-2/10",
  refund: "text-chart-4 bg-chart-4/10",
  session_timeout: "text-chart-5 bg-chart-5/10",
  create_event: "text-primary bg-primary/10",
  edit_event: "text-chart-3 bg-chart-3/10",
  delete_event: "text-destructive bg-destructive/10",
  role_change: "text-chart-4 bg-chart-4/10",
  suspend_user: "text-destructive bg-destructive/10",
  unsuspend_user: "text-chart-2 bg-chart-2/10",
  password_reset: "text-chart-5 bg-chart-5/10",
}

export default function AuditLogsPage() {
  const [log, setLog] = useState<AuditLogEntry[]>([])
  const [page, setPage] = useState(0)
  const [searchQ, setSearchQ] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const PAGE_SIZE = 25

  useEffect(() => { setLog(getAuditLog()) }, [])

  const uniqueActions = useMemo(() => {
    const actions = new Set(log.map(e => e.action))
    return ["all", ...Array.from(actions).sort()]
  }, [log])

  const filtered = useMemo(() => {
    let result = log
    if (actionFilter !== "all") result = result.filter(e => e.action === actionFilter)
    if (searchQ) result = result.filter(e =>
      e.userName.toLowerCase().includes(searchQ.toLowerCase()) ||
      e.targetResource.toLowerCase().includes(searchQ.toLowerCase()) ||
      e.action.toLowerCase().includes(searchQ.toLowerCase())
    )
    return result
  }, [log, actionFilter, searchQ])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageLog = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  function handleExport() {
    const csv = ["Timestamp,User,Role,Action,Target,Previous Value,New Value"]
    log.forEach(e => {
      csv.push(`${e.timestamp},"${e.userName}",${e.role},${e.action},"${e.targetResource}","${e.previousValue || ""}","${e.newValue || ""}"`)
    })
    const blob = new Blob([csv.join("\n")], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `audit-log-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <PermissionGuard requiredPermissions={["canViewAuditLog"]}>
      <PageTransition>
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <FadeIn>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div>
                <h1 className="font-display font-bold text-2xl text-foreground flex items-center gap-2">
                  <ScrollText className="h-6 w-6 text-primary" /> Audit Log
                </h1>
                <p className="text-sm text-muted-foreground">{log.length} entries. Immutable -- admin cannot delete logs. Visible to Super Admin only.</p>
              </div>
              <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:bg-primary/90 transition-colors shrink-0">
                <FileDown className="h-4 w-4" /> Export CSV
              </button>
            </div>
          </FadeIn>

          <FadeIn delay={0.05}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
              <div className="relative flex-1 max-w-sm w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input value={searchQ} onChange={e => { setSearchQ(e.target.value); setPage(0) }} className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Search user, action, or target..." />
              </div>
              <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(0) }} className="px-3 py-2 bg-surface border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                {uniqueActions.map(a => (
                  <option key={a} value={a}>{a === "all" ? "All Actions" : a.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
          </FadeIn>

          {filtered.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-10 text-center">
              <ScrollText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">{searchQ || actionFilter !== "all" ? "No entries match your filters." : "No audit log entries yet."}</p>
            </div>
          ) : (
            <>
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase">Timestamp</th>
                        <th className="px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase">User</th>
                        <th className="px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase">Role</th>
                        <th className="px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase">Action</th>
                        <th className="px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase">Target</th>
                        <th className="px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase">Before / After</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageLog.map(entry => {
                        const colorClass = ACTION_COLORS[entry.action] || "text-foreground bg-muted"
                        return (
                          <tr key={entry.id} className="border-b border-border/50 last:border-0">
                            <td className="px-4 py-2.5 text-[11px] text-muted-foreground whitespace-nowrap">{new Date(entry.timestamp).toLocaleString()}</td>
                            <td className="px-4 py-2.5 text-xs text-card-foreground truncate max-w-[120px]">{entry.userName}</td>
                            <td className="px-4 py-2.5"><span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${ROLE_META[entry.role]?.bgColor || "bg-muted"} ${ROLE_META[entry.role]?.color || "text-muted-foreground"}`}>{entry.role}</span></td>
                            <td className="px-4 py-2.5"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap ${colorClass}`}>{entry.action.replace(/_/g, " ")}</span></td>
                            <td className="px-4 py-2.5 text-xs text-muted-foreground max-w-[160px] truncate">{entry.targetResource}</td>
                            <td className="px-4 py-2.5 text-[11px] text-muted-foreground max-w-[160px] truncate">
                              {entry.previousValue && <span className="text-destructive/70 line-through mr-1">{entry.previousValue}</span>}
                              {entry.newValue && <span className="text-chart-2">{entry.newValue}</span>}
                              {!entry.previousValue && !entry.newValue && <span>--</span>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1.5 bg-card border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors">Prev</button>
                  <span className="text-xs text-muted-foreground">Page {page + 1} of {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-3 py-1.5 bg-card border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors">Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </PageTransition>
    </PermissionGuard>
  )
}
