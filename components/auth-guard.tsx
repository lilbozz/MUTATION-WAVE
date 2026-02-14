"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/intro")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-xl bg-primary/20 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display font-bold text-sm text-primary">MW</span>
            </div>
            <div className="absolute -inset-1 rounded-xl border-2 border-primary/30 border-t-primary animate-spin" />
          </div>
          <p className="text-xs text-muted-foreground font-medium tracking-wider uppercase">Loading</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return <>{children}</>
}
