"use client"

import { Shield, Check, X } from "lucide-react"
import { PermissionGuard } from "@/components/permission-guard"
import { PageTransition, FadeIn } from "@/components/page-transition"
import { ROLE_META, type Role, type Permission, getPermissionsForRole } from "@/lib/permissions"

const ALL_ROLES: Role[] = ["user", "moderator", "editor", "finance", "admin"]

const PERMISSION_GROUPS: { group: string; permissions: { key: Permission; label: string }[] }[] = [
  {
    group: "Content",
    permissions: [
      { key: "canManageCMS", label: "Manage CMS" },
      { key: "canEditArtists", label: "Edit Artists" },
      { key: "canEditEvents", label: "Edit Events" },
      { key: "canPublishNews", label: "Publish News" },
      { key: "canManageHomepage", label: "Manage Homepage" },
      { key: "canManageMedia", label: "Manage Media" },
    ],
  },
  {
    group: "Users & Security",
    permissions: [
      { key: "canManageUsers", label: "Manage Users" },
      { key: "canSuspendAccounts", label: "Suspend Accounts" },
      { key: "canModerateContent", label: "Moderate Content" },
      { key: "canViewAuditLog", label: "View Audit Log" },
    ],
  },
  {
    group: "Finance & Analytics",
    permissions: [
      { key: "canViewAnalytics", label: "View Analytics" },
      { key: "canViewFinance", label: "View Finance" },
      { key: "canViewFinanceDashboard", label: "Finance Dashboard" },
      { key: "canExportRevenue", label: "Export Revenue" },
      { key: "canViewAdminDashboard", label: "Admin Dashboard" },
    ],
  },
  {
    group: "User Actions",
    permissions: [
      { key: "canPurchase", label: "Purchase Tickets" },
    ],
  },
]

export default function RolesPage() {
  return (
    <PermissionGuard requiredPermissions={["canManageUsers"]}>
      <PageTransition>
        <div className="p-4 lg:p-8 max-w-6xl mx-auto">
          <FadeIn>
            <h1 className="font-display font-bold text-2xl text-foreground mb-1">Role & Permission Matrix</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Roles: Super Admin, Admin, Editor, Finance, Support. Permissions are validated before rendering any UI element.
            </p>
          </FadeIn>

          {/* Role Cards */}
          <FadeIn delay={0.05}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
              {ALL_ROLES.map(role => {
                const meta = ROLE_META[role]
                const perms = getPermissionsForRole(role)
                return (
                  <div key={role} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className={`h-4 w-4 ${meta.color}`} />
                      <span className="text-sm font-bold text-card-foreground capitalize">{meta.label}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{perms.length} permissions</p>
                  </div>
                )
              })}
            </div>
          </FadeIn>

          {/* Permission Matrix Table */}
          <FadeIn delay={0.1}>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase min-w-[180px]">Permission</th>
                      {ALL_ROLES.map(role => (
                        <th key={role} className="px-3 py-3 text-center text-[10px] font-semibold text-muted-foreground uppercase">{ROLE_META[role].label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PERMISSION_GROUPS.map(group => (
                      <>
                        <tr key={group.group}>
                          <td colSpan={ALL_ROLES.length + 1} className="px-4 py-2 bg-muted/30">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{group.group}</span>
                          </td>
                        </tr>
                        {group.permissions.map(perm => (
                          <tr key={perm.key} className="border-b border-border/50 last:border-0">
                            <td className="px-4 py-2.5 text-xs text-card-foreground">{perm.label}</td>
                            {ALL_ROLES.map(role => {
                              const has = getPermissionsForRole(role).includes(perm.key)
                              return (
                                <td key={role} className="px-3 py-2.5 text-center">
                                  {has ? (
                                    <Check className="h-3.5 w-3.5 text-chart-2 mx-auto" />
                                  ) : (
                                    <X className="h-3.5 w-3.5 text-muted-foreground/30 mx-auto" />
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </FadeIn>
        </div>
      </PageTransition>
    </PermissionGuard>
  )
}
