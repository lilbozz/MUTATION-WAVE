"use client"

import { useEffect } from "react"
import { useLang } from "@/components/providers"

/**
 * Syncs the current language to the <html lang> attribute
 * so that CSS lang selectors (e.g. html[lang="th"]) work properly.
 */
export function LangSync() {
  const { lang } = useLang()

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  return null
}
