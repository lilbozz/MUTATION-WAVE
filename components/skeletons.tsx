"use client"

export function SkeletonPulse({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-muted ${className}`} />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <SkeletonPulse className="aspect-[16/9]" />
      <div className="p-5 flex flex-col gap-3">
        <SkeletonPulse className="h-5 w-3/4" />
        <SkeletonPulse className="h-3 w-1/2" />
        <div className="flex items-center gap-2 mt-1">
          <SkeletonPulse className="h-3 w-20" />
          <SkeletonPulse className="h-3 w-16" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex gap-6">
        {[...Array(4)].map((_, i) => (
          <SkeletonPulse key={i} className="h-3 w-20" />
        ))}
      </div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="px-5 py-4 border-b border-border/50 last:border-0 flex gap-6">
          {[...Array(4)].map((_, j) => (
            <SkeletonPulse key={j} className={`h-3 ${j === 0 ? "w-24" : j === 1 ? "w-40" : "w-16"}`} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonStatGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
          <SkeletonPulse className="h-9 w-9 rounded-lg" />
          <SkeletonPulse className="h-7 w-24" />
          <SkeletonPulse className="h-3 w-16" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
      <SkeletonPulse className="h-10 w-64 mb-8" />
      <SkeletonStatGrid />
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}
