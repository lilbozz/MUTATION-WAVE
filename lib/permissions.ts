// ---- Permission-Based Access Control (PBAC) ----
// NEVER check role directly in UI/API. Always check permission flags.

export type Role = "user" | "moderator" | "editor" | "finance" | "admin"

export type Permission =
  | "canPurchase"
  | "canViewAnalytics"
  | "canEditArtists"
  | "canEditEvents"
  | "canPublishNews"
  | "canManageHomepage"
  | "canManageMedia"
  | "canManageUsers"
  | "canExportRevenue"
  | "canSuspendAccounts"
  | "canViewFinance"
  | "canManageCMS"
  | "canModerateContent"
  | "canViewAuditLog"
  | "canViewAdminDashboard"
  | "canViewFinanceDashboard"

// Role -> Permission mapping
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  user: [
    "canPurchase",
  ],
  moderator: [
    "canPurchase",
    "canModerateContent",
    "canViewAuditLog",
  ],
  editor: [
    "canPurchase",
    "canEditArtists",
    "canEditEvents",
    "canPublishNews",
    "canManageHomepage",
    "canManageMedia",
    "canManageCMS",
  ],
  finance: [
    "canViewAnalytics",
    "canExportRevenue",
    "canViewFinance",
    "canViewFinanceDashboard",
    "canViewAuditLog",
  ],
  admin: [
    "canPurchase",
    "canViewAnalytics",
    "canEditArtists",
    "canEditEvents",
    "canPublishNews",
    "canManageHomepage",
    "canManageMedia",
    "canManageUsers",
    "canExportRevenue",
    "canSuspendAccounts",
    "canViewFinance",
    "canManageCMS",
    "canModerateContent",
    "canViewAuditLog",
    "canViewAdminDashboard",
    "canViewFinanceDashboard",
  ],
}

export function getPermissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.user
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return getPermissionsForRole(role).includes(permission)
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  const userPerms = getPermissionsForRole(role)
  return permissions.some(p => userPerms.includes(p))
}

export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  const userPerms = getPermissionsForRole(role)
  return permissions.every(p => userPerms.includes(p))
}

// Role display metadata
export const ROLE_META: Record<Role, { label: string; color: string; bgColor: string }> = {
  user: { label: "User", color: "text-muted-foreground", bgColor: "bg-muted" },
  moderator: { label: "Moderator", color: "text-chart-2", bgColor: "bg-chart-2/10" },
  editor: { label: "Editor", color: "text-chart-3", bgColor: "bg-chart-3/10" },
  finance: { label: "Finance", color: "text-chart-4", bgColor: "bg-chart-4/10" },
  admin: { label: "Admin", color: "text-destructive", bgColor: "bg-destructive/10" },
}

// Route permission requirements
export const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  "/admin": ["canViewAdminDashboard"],
  "/admin/content": ["canManageCMS", "canPublishNews", "canManageHomepage"],
  "/admin/artists": ["canEditArtists"],
  "/admin/events": ["canEditEvents"],
  "/admin/store": ["canEditEvents"],
  "/admin/orders": ["canViewAdminDashboard"],
  "/admin/users": ["canManageUsers"],
  "/admin/roles": ["canManageUsers"],
  "/admin/finance": ["canViewFinanceDashboard"],
  "/admin/analytics": ["canViewAdminDashboard"],
  "/admin/settings": ["canViewAdminDashboard"],
  "/admin/logs": ["canViewAuditLog"],
  "/dashboard/admin": ["canViewAdminDashboard"],
  "/dashboard/finance": ["canViewFinanceDashboard"],
}

export function canAccessRoute(role: Role, route: string): boolean {
  const requiredPerms = ROUTE_PERMISSIONS[route]
  if (!requiredPerms) return true // No restriction
  return hasAnyPermission(role, requiredPerms)
}
