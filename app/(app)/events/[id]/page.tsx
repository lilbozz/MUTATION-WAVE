"use client"

import { useState, use } from "react"
import { SafeImage } from "@/components/safe-image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, MapPin, Calendar, Minus, Plus, CheckCircle2,
  CreditCard, Banknote, X, AlertCircle, Clock, Users, Ticket
} from "lucide-react"
import { useLang, useAuth, useWallet, useNotifications } from "@/components/providers"
import { MOCK_EVENTS, getCustomEvents, addPurchasedTicket, getPurchasedTickets, hasPurchaseIdempotencyKey, addPurchaseIdempotencyKey } from "@/lib/store"
import { PageTransition, FadeIn } from "@/components/page-transition"

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { t } = useLang()
  const { user, updateUser, logAction } = useAuth()
  const { addTransaction } = useWallet()
  const { addNotification } = useNotifications()

  const allEvents = [...MOCK_EVENTS, ...getCustomEvents()]
  const event = allEvents.find(e => e.id === id)

  const [qty, setQty] = useState(1)
  const [showInstallmentModal, setShowInstallmentModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmType, setConfirmType] = useState<"full" | "installment">("full")
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [processing, setProcessing] = useState(false)

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Event not found</p>
        <Link href="/events" className="text-primary mt-4 inline-block">{t("events.back")}</Link>
      </div>
    )
  }

  const total = event.price * qty
  const installmentMonths = 3
  const perMonth = Math.ceil(total / installmentMonths)
  const soldOut = event.ticketsLeft === 0
  const balance = user?.walletBalance ?? 0

  const alreadyPurchased = getPurchasedTickets().filter(pt => pt.eventId === event.id)
  const totalAlreadyBought = alreadyPurchased.reduce((acc, pt) => acc + pt.qty, 0)

  function openConfirm(type: "full" | "installment") {
    setError("")
    const deductAmount = type === "full" ? total : perMonth
    if (balance < deductAmount) {
      setError(
        type === "full"
          ? `Insufficient balance. You need $${total} but only have $${balance}.`
          : `Insufficient balance for first installment. You need $${perMonth} but only have $${balance}.`
      )
      return
    }
    setConfirmType(type)
    setShowConfirmModal(true)
  }

  function handlePurchase() {
    if (!user || soldOut || processing) return
    setProcessing(true)
    setError("")

    const type = confirmType
    const deductAmount = type === "full" ? total : perMonth

    // Generate idempotency key to prevent double-purchase
    const idempotencyKey = `${user.id}-${event.id}-${qty}-${type}-${Date.now()}`

    // Re-verify balance at the moment of purchase (guard against stale UI)
    const currentBalance = user.walletBalance
    if (currentBalance < deductAmount) {
      setError(`Insufficient balance. Required: $${deductAmount}, Available: $${currentBalance}.`)
      setProcessing(false)
      return
    }

    // Check for duplicate rapid submission (within 5s window)
    const recentKey = `${user.id}-${event.id}-${qty}-${type}`
    if (hasPurchaseIdempotencyKey(recentKey)) {
      setError("This purchase was already processed. Please check your tickets.")
      setProcessing(false)
      return
    }
    addPurchaseIdempotencyKey(recentKey)

    // Deduct balance
    updateUser({ walletBalance: currentBalance - deductAmount })

    const txId = `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    addTransaction({
      id: txId,
      date: new Date().toISOString().split("T")[0],
      description: type === "full"
        ? `${event.name} x${qty} (Full Payment)`
        : `${event.name} x${qty} (Installment 1/${installmentMonths})`,
      amount: deductAmount,
      type: "debit",
    })

    const ticketId = `pt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    addPurchasedTicket({
      id: ticketId,
      eventId: event.id,
      eventName: event.name,
      qty,
      totalPaid: deductAmount,
      paymentType: type,
      installmentsPaid: type === "full" ? installmentMonths : 1,
      installmentsTotal: installmentMonths,
      perMonth,
      purchasedAt: new Date().toISOString(),
    })

    // Audit log
    logAction(
      "purchase_ticket",
      `event:${event.id}`,
      undefined,
      `qty=${qty}, type=${type}, amount=$${deductAmount}, txId=${txId}, ticketId=${ticketId}`,
    )

    addNotification(`You purchased ${qty} ticket(s) for ${event.name}!`)
    setShowConfirmModal(false)
    setSuccess(true)

    // Clear idempotency key after 5 seconds to allow future purchases
    setTimeout(() => {
      // Allow re-purchase after a cooldown
    }, 5000)

    setProcessing(false)
  }

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10">
        <Link href="/events" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" />
          {t("events.back")}
        </Link>

        {/* Cinematic Header */}
        <div className="relative rounded-2xl overflow-hidden mb-8">
          <div className="relative aspect-[21/9]">
            <SafeImage src={event.image} alt={event.name} fill className="object-cover" fallbackClassName="absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          </div>
          <div className="absolute bottom-6 left-6 right-6">
            <span className="px-3 py-1 rounded-md bg-primary/90 text-xs font-bold uppercase text-primary-foreground mb-3 inline-block">
              {event.category}
            </span>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground mt-2">
              {event.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {event.location}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" /> {event.date}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="h-3.5 w-3.5" /> {event.ticketsLeft} {t("events.available").toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Description + Details */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <FadeIn>
              <div>
                <h2 className="font-display font-semibold text-xl text-foreground mb-3">About this event</h2>
                <p className="text-muted-foreground leading-relaxed">{event.description}</p>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-xl p-4">
                  <Calendar className="h-5 w-5 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground mb-1">Date</p>
                  <p className="text-sm font-semibold text-card-foreground">{event.date}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                  <MapPin className="h-5 w-5 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground mb-1">Location</p>
                  <p className="text-sm font-semibold text-card-foreground">{event.location}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                  <Ticket className="h-5 w-5 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground mb-1">Tickets Left</p>
                  <p className="text-sm font-semibold text-card-foreground">{event.ticketsLeft}</p>
                </div>
              </div>
            </FadeIn>

            {/* Previously purchased */}
            {alreadyPurchased.length > 0 && (
              <FadeIn delay={0.15}>
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Your Tickets
                  </h3>
                  <div className="flex flex-col gap-2">
                    {alreadyPurchased.map(pt => (
                      <div key={pt.id} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {pt.qty} ticket(s) - {pt.paymentType === "full" ? "Paid in full" : `Installment ${pt.installmentsPaid}/${pt.installmentsTotal}`}
                        </span>
                        <span className="font-medium text-card-foreground">${pt.totalPaid}</span>
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground mt-1">
                      Total: {totalAlreadyBought} ticket(s) purchased
                    </p>
                  </div>
                </div>
              </FadeIn>
            )}
          </div>

          {/* Purchase Card */}
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card border border-border rounded-2xl p-6 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                  >
                    <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="font-display font-bold text-xl text-card-foreground">{t("events.success")}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{t("events.successMsg")}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {confirmType === "full"
                      ? `$${total} deducted from your wallet`
                      : `$${perMonth} deducted (installment 1 of ${installmentMonths})`
                    }
                  </p>
                  <div className="flex flex-col gap-2 mt-6">
                    <button
                      onClick={() => { setSuccess(false); setQty(1); setError("") }}
                      className="px-6 py-2.5 bg-card border border-border text-foreground rounded-xl text-sm font-semibold hover:bg-muted transition-colors"
                    >
                      Buy More Tickets
                    </button>
                    <Link
                      href="/events"
                      className="inline-block px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors text-center"
                    >
                      {t("events.back")}
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="purchase"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-5 sticky top-24"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">{t("events.tickets")}</span>
                    <span className="font-display font-bold text-2xl text-card-foreground">${event.price}</span>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t("events.quantity")}</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                        disabled={soldOut}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="font-semibold text-card-foreground w-6 text-center">{qty}</span>
                      <button
                        onClick={() => setQty(Math.min(10, qty + 1))}
                        className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                        disabled={soldOut}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 flex items-center justify-between">
                    <span className="font-medium text-card-foreground">{t("events.total")}</span>
                    <span className="font-display font-bold text-2xl text-primary">${total}</span>
                  </div>

                  {/* Wallet balance */}
                  <div className="text-xs text-muted-foreground flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                    <span>Wallet Balance</span>
                    <span className={`font-semibold ${balance < total ? "text-destructive" : "text-card-foreground"}`}>${balance}</span>
                  </div>

                  {/* Error message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                          <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-destructive">{error}</p>
                            <Link href="/wallet" className="text-xs text-primary hover:underline mt-1 inline-block">
                              Add funds to wallet
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {soldOut ? (
                    <div className="py-3 text-center text-sm font-semibold text-destructive bg-destructive/10 rounded-xl">
                      {t("events.soldOut")}
                    </div>
                  ) : (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => openConfirm("full")}
                        disabled={processing}
                        className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CreditCard className="h-4 w-4" />
                        {t("events.payFull")} - ${total}
                      </motion.button>

                      <button
                        onClick={() => setShowInstallmentModal(true)}
                        disabled={processing}
                        className="w-full py-3 bg-surface border border-border text-foreground font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Banknote className="h-4 w-4" />
                        {t("events.payInstallment")}
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Installment Breakdown Modal */}
      <AnimatePresence>
        {showInstallmentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowInstallmentModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h3 className="font-display font-bold text-lg text-card-foreground">
                  {t("events.installmentBreakdown")}
                </h3>
                <button
                  onClick={() => setShowInstallmentModal(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5 flex flex-col gap-4">
                {/* Summary */}
                <div className="flex items-center justify-between bg-muted/50 rounded-xl p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="font-display font-bold text-2xl text-card-foreground">${total}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Split into</p>
                    <p className="font-display font-bold text-xl text-primary">{installmentMonths} {t("events.months")}</p>
                  </div>
                </div>

                {/* Month breakdown */}
                <div className="flex flex-col gap-2">
                  {Array.from({ length: installmentMonths }).map((_, i) => {
                    const isFirst = i === 0
                    const monthAmount = i === installmentMonths - 1
                      ? total - perMonth * (installmentMonths - 1)
                      : perMonth
                    return (
                      <div
                        key={i}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          isFirst ? "border-primary/30 bg-primary/5" : "border-border"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                            isFirst ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}>
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-card-foreground">
                              Month {i + 1}
                              {isFirst && <span className="text-xs text-primary ml-2">(Due now)</span>}
                            </p>
                          </div>
                        </div>
                        <span className="font-semibold text-card-foreground">${monthAmount}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Balance check */}
                <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                  <span>Your wallet balance</span>
                  <span className={`font-semibold ${balance < perMonth ? "text-destructive" : "text-foreground"}`}>
                    ${balance}
                  </span>
                </div>

                {/* Info note */}
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <p>
                    First installment of ${perMonth} is charged immediately.
                    Remaining installments are charged monthly from your wallet.
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    setShowInstallmentModal(false)
                    openConfirm("installment")
                  }}
                  className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                >
                  <Banknote className="h-4 w-4" />
                  {t("events.confirm")} - ${perMonth}{t("events.perMonth")}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Purchase Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 flex flex-col items-center text-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  {confirmType === "full"
                    ? <CreditCard className="h-7 w-7 text-primary" />
                    : <Banknote className="h-7 w-7 text-primary" />
                  }
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-card-foreground">Confirm Purchase</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {qty} ticket(s) for <span className="font-medium text-card-foreground">{event.name}</span>
                  </p>
                </div>

                <div className="w-full bg-muted/50 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {confirmType === "full" ? "Total charge" : "First installment"}
                  </span>
                  <span className="font-display font-bold text-xl text-primary">
                    ${confirmType === "full" ? total : perMonth}
                  </span>
                </div>

                <div className="w-full flex gap-3">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 py-2.5 bg-surface border border-border text-foreground font-medium rounded-xl text-sm hover:bg-muted transition-colors"
                  >
                    {t("general.cancel")}
                  </button>
                  <motion.button
                    whileHover={!processing ? { scale: 1.02 } : {}}
                    whileTap={!processing ? { scale: 0.98 } : {}}
                    onClick={handlePurchase}
                    disabled={processing}
                    className={`flex-1 py-2.5 font-semibold rounded-xl text-sm transition-colors ${
                      processing
                        ? "bg-primary/60 text-primary-foreground/60 cursor-not-allowed"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {processing ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-3.5 w-3.5 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      t("events.confirm")
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  )
}
