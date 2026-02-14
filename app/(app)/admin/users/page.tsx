"use client"

import { useState, useMemo } from "react"
import {
  Users, Search, Ban, CheckCircle2, Mail, Crown, Clock, ChevronDown,
} from "lucide-react"
import { useAuth } from "@/components/providers"
import { PermissionGuard } from "@/components/permission-guard"
import { getAllRegisteredUsers, saveRegisteredUser, getPurchasedTickets, type User } from "@/lib/store"
import { ROLE_META, type Role } from "@/lib/permissions"
import { PageTransition, FadeIn } from "@/components/page-transition"

type FilterRole = "all" | Role

export default function UsersAdminPage() {
  const { logAction, user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>(getAllRegisteredUsers)
  const [searchQ, setSearchQ] = useState("")
  const [roleFilter, setRoleFilter] = useState<FilterRole>("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const tickets = getPurchasedTickets()

  const filtered = useMemo(() => {
    let result = users
    if (roleFilter !== "all") result = result.filter(u => u.role === roleFilter)
    if (searchQ) result = result.filter(u =>
      u.name.toLowerCase().includes(searchQ.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQ.toLowerCase())
    )
    return result
  }, [users, roleFilter, searchQ])

  function changeRole(userId: string, newRole: Role) {
    if (userId === currentUser?.id) return // Admin cannot change own role
    const updated = users.map(u => u.id === userId ? { ...u, role: newRole } : u)
    setUsers(updated)
    const target = updated.find(u => u.id === userId)
    if (target) {
      saveRegisteredUser(target)
      logAction("role_change", `user:${userId}`, undefined, `role changed to ${newRole}`)
    }
  }

  function toggleSuspend(userId: string) {
    if (userId === currentUser?.id) return
    const target = users.find(u => u.id === userId)
    if (!target) return
    const updated = users.map(u => u.id === userId ? { ...u, suspended: !u.suspended } : u)
    setUsers(updated)
    const updatedTarget = updated.find(u => u.id === userId)
    if (updatedTarget) {
      saveRegisteredUser(updatedTarget)
      logAction(updatedTarget.suspended ? "suspend_user" : "unsuspend_user", `user:${userId}`, undefined, target.name)
    }
  }

  return (
    <PermissionGuard requiredPermissions={["canManageUsers"]}>
      <PageTransition>
        <div className="p-4 lg:p-8 max-w-6xl mx-auto">
          <FadeIn>
            <h1 className="font-display font-bold text-2xl text-foreground mb-1">User Management</h1>
            <p className="text-sm text-muted-foreground mb-6">{users.length} registered users. Admin cannot modify their own role.</p>
          </FadeIn>

          <FadeIn delay={0.05}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
              <div className="relative flex-1 max-w-sm w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input value={searchQ} onChange={e => setSearchQ(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Search by name or email..." />
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {(["all", "user", "moderator", "editor", "finance", "admin"] as FilterRole[]).map(r => (
                  <button key={r} onClick={() => setRoleFilter(r)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${roleFilter === r ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
                    {r === "all" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </FadeIn>

          {filtered.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-10 text-center">
              <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">{searchQ || roleFilter !== "all" ? "No users match your filters." : "No registered users yet."}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map(u => {
                const meta = ROLE_META[u.role]
                const isSelf = u.id === currentUser?.id
                const expanded = expandedId === u.id
                const userTickets = tickets.filter(t => true) // In a real app, filter by userId
                return (
                  <div key={u.id} className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="flex items-center gap-4 p-4">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm text-card-foreground truncate">{u.name}</p>
                          {u.suspended && <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">Suspended</span>}
                          {isSelf && <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary">You</span>}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{u.email} -- {u.tier}</p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md shrink-0 ${meta.bgColor} ${meta.color}`}>{meta.label}</span>
                      {!isSelf && (
                        <select
                          value={u.role}
                          onChange={e => changeRole(u.id, e.target.value as Role)}
                          className="px-2 py-1 bg-surface border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shrink-0"
                        >
                          <option value="user">User</option>
                          <option value="moderator">Moderator</option>
                          <option value="editor">Editor</option>
                          <option value="finance">Finance</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                      {!isSelf && (
                        <button
                          onClick={() => toggleSuspend(u.id)}
                          className={`p-1.5 rounded-lg transition-colors shrink-0 ${u.suspended ? "text-chart-2 hover:bg-chart-2/10" : "text-destructive hover:bg-destructive/10"}`}
                          title={u.suspended ? "Unsuspend" : "Suspend"}
                        >
                          {u.suspended ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                        </button>
                      )}
                      <button onClick={() => setExpandedId(expanded ? null : u.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground shrink-0">
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
                      </button>
                    </div>
                    {expanded && (
                      <div className="px-4 pb-4 border-t border-border/50 pt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-xs text-muted-foreground truncate">{u.email}</span></div>
                        <div className="flex items-center gap-2"><Crown className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-xs text-muted-foreground">Tier: {u.tier}</span></div>
                        <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-xs text-muted-foreground">Joined: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}</span></div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </PageTransition>
    </PermissionGuard>
  )
}
