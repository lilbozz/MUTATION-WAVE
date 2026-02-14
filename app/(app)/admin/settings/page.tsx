"use client"

import { useState } from "react"
import {
  Settings, Save, CheckCircle2, Globe, Palette, ToggleLeft, ToggleRight,
} from "lucide-react"
import { PermissionGuard } from "@/components/permission-guard"
import { PageTransition, FadeIn } from "@/components/page-transition"
import { useAuth, useLang, useTheme } from "@/components/providers"
import { LANGUAGES, type Lang } from "@/lib/i18n"

interface FeatureToggle {
  key: string
  label: string
  description: string
  enabled: boolean
}

const DEFAULT_TOGGLES: FeatureToggle[] = [
  { key: "gamification", label: "Gamification System", description: "Enable coins, badges, and daily check-in rewards.", enabled: true },
  { key: "installments", label: "Installment Payments", description: "Allow users to pay for tickets in installments.", enabled: true },
  { key: "phoneOtp", label: "Phone + OTP Login", description: "Enable phone number login with OTP verification.", enabled: true },
  { key: "subscriptions", label: "Subscription Tiers", description: "Enable Free/Member/Pro subscription system.", enabled: true },
  { key: "ranking", label: "Ranking Leaderboard", description: "Show public artist and fan ranking leaderboard.", enabled: true },
  { key: "darkMode", label: "Dark Mode Toggle", description: "Allow users to switch between light and dark themes.", enabled: true },
]

export default function SettingsPage() {
  const { logAction } = useAuth()
  const { lang, setLang } = useLang()
  const { theme } = useTheme()
  const [toggles, setToggles] = useState(DEFAULT_TOGGLES)
  const [saved, setSaved] = useState(false)
  const [brandName, setBrandName] = useState("MUTATION WAVE")

  function handleToggle(key: string) {
    setToggles(prev => prev.map(t => t.key === key ? { ...t, enabled: !t.enabled } : t))
  }

  function handleSave() {
    logAction("edit_homepage", "admin_settings", undefined, JSON.stringify({ brandName, toggles: toggles.map(t => ({ key: t.key, enabled: t.enabled })) }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <PermissionGuard requiredPermissions={["canViewAdminDashboard"]}>
      <PageTransition>
        <div className="p-4 lg:p-8 max-w-4xl mx-auto">
          <FadeIn>
            <h1 className="font-display font-bold text-2xl text-foreground mb-1">Settings</h1>
            <p className="text-sm text-muted-foreground mb-6">Platform configuration. Changes do not alter user layout structure.</p>
          </FadeIn>

          {/* Branding */}
          <FadeIn delay={0.05}>
            <div className="bg-card border border-border rounded-xl p-5 mb-6">
              <h3 className="font-semibold text-sm text-card-foreground mb-4 flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" /> Branding
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Brand Name</label>
                  <input value={brandName} onChange={e => setBrandName(e.target.value)} className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" maxLength={30} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Current Theme</label>
                  <div className="px-3 py-2 bg-surface border border-border rounded-lg text-sm text-muted-foreground capitalize">{theme}</div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Language Management */}
          <FadeIn delay={0.1}>
            <div className="bg-card border border-border rounded-xl p-5 mb-6">
              <h3 className="font-semibold text-sm text-card-foreground mb-4 flex items-center gap-2">
                <Globe className="h-4 w-4 text-chart-2" /> Language Management
              </h3>
              <p className="text-xs text-muted-foreground mb-3">Active platform languages. Default language is used for new users.</p>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => setLang(l.code as Lang)}
                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                      lang === l.code
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {l.native} ({l.code.toUpperCase()})
                  </button>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Feature Toggles */}
          <FadeIn delay={0.15}>
            <div className="bg-card border border-border rounded-xl p-5 mb-6">
              <h3 className="font-semibold text-sm text-card-foreground mb-4 flex items-center gap-2">
                <Settings className="h-4 w-4 text-chart-4" /> Feature Toggles
              </h3>
              <div className="flex flex-col gap-3">
                {toggles.map(toggle => (
                  <div key={toggle.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                    <div className="min-w-0 flex-1 mr-4">
                      <p className="text-sm font-medium text-card-foreground">{toggle.label}</p>
                      <p className="text-xs text-muted-foreground">{toggle.description}</p>
                    </div>
                    <button onClick={() => handleToggle(toggle.key)} className="shrink-0">
                      {toggle.enabled ? (
                        <ToggleRight className="h-7 w-7 text-primary" />
                      ) : (
                        <ToggleLeft className="h-7 w-7 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Save */}
          <FadeIn delay={0.2}>
            <div className="flex items-center gap-3">
              <button onClick={handleSave} className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
                <Save className="h-4 w-4" /> Save Settings
              </button>
              {saved && <span className="text-xs text-chart-2 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Saved</span>}
            </div>
          </FadeIn>
        </div>
      </PageTransition>
    </PermissionGuard>
  )
}
