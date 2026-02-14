"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/intro")
  }, [router])

  return (
    <div className="min-h-screen bg-[#0B0B0D]" />
  )
}
