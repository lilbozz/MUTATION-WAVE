"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers"
import type { Permission } from "@/lib/permissions"

interface PermissionGuardProps {
  children: React.ReactNode
  requiredPermissions: Permission[]
  mode?: "any" | "all"
}

export function PermissionGuard({ children, requiredPermissions, mode = "any" }: PermissionGuardProps) {
  const { user, can, canAny, isLoading } = useAuth()
  const router = useRouter()

  const hasAccess = mode === "any"
    ? canAny(requiredPermissions)
    : requiredPermissions.every(p => can(p))

  useEffect(() => {
    if (!isLoading && user && !hasAccess) {
      router.replace("/forbidden")
    }
  }, [isLoading, user, hasAccess, router])

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/20 animate-pulse flex items-center justify-center">
            <span className="font-display font-bold text-sm text-primary">MW</span>
          </div>
          <div className="h-2 w-24 rounded-full animate-shimmer" />
        </div>
      </div>
    )
  }

  if (!user || !hasAccess) return null

  return <>{children}</>
}
