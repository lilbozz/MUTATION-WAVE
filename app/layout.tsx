import type { Metadata, Viewport } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import "./globals.css"
import { AppProviders } from "@/components/providers"
import { SessionTimeoutModal } from "@/components/session-timeout-modal"
import { ScrollToTop } from "@/components/scroll-to-top"
import { LangSync } from "@/components/lang-sync"
import { UpgradeModal } from "@/components/upgrade-modal"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})

export const metadata: Metadata = {
  title: "MUTATION WAVE - Global Cultural Platform",
  description: "Where Culture Meets Innovation. Discover, create, and invest in the future of music, art, and culture.",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#0B0B0D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <AppProviders>
          <LangSync />
          {children}
          <SessionTimeoutModal />
          <UpgradeModal />
          <ScrollToTop />
        </AppProviders>
      </body>
    </html>
  )
}
