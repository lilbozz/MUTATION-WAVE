"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, ShieldX } from "lucide-react"
import { useLang } from "@/components/providers"
import { PageTransition } from "@/components/page-transition"

export default function ForbiddenPage() {
  const { t } = useLang()

  return (
    <PageTransition>
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-md"
        >
          <div className="h-20 w-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <ShieldX className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="font-display font-bold text-6xl text-foreground mb-2">403</h1>
          <h2 className="font-display font-semibold text-xl text-foreground mb-3">
            {t("error.403.title")}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            {t("error.403.message")}
          </p>
          <Link
            href="/home"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("auth.backToLogin")}
          </Link>
        </motion.div>
      </div>
    </PageTransition>
  )
}
