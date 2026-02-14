import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <Navbar />
      <main className="min-h-screen pt-16 overflow-x-hidden">
        <div className="mx-auto max-w-[1280px] px-6">
          {children}
        </div>
      </main>
    </AuthGuard>
  )
}
