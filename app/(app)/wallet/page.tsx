"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Wallet, Plus, ArrowDownLeft, ArrowUpRight, RotateCcw, Ticket } from "lucide-react"
import { useLang, useAuth, useWallet } from "@/components/providers"
import { getPurchasedTickets } from "@/lib/store"
import { PageTransition, FadeIn } from "@/components/page-transition"

const ADD_AMOUNTS = [50, 100, 200, 500]

export default function WalletPage() {
  const { t } = useLang()
  const { user, updateUser, logAction } = useAuth()
  const { transactions, addTransaction } = useWallet()
  const [addingFunds, setAddingFunds] = useState(false)
  const [customAmount, setCustomAmount] = useState("")
  const [refundConfirm, setRefundConfirm] = useState<string | null>(null)
  const purchasedTickets = getPurchasedTickets()

  function handleAddFunds(amount: number) {
    if (!user) return
    const prevBalance = user.walletBalance
    updateUser({ walletBalance: prevBalance + amount })
    addTransaction({
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      description: `Added funds`,
      amount,
      type: "credit",
    })
    logAction("add_funds", "wallet", `$${prevBalance}`, `$${prevBalance + amount}`)
    setAddingFunds(false)
    setCustomAmount("")
  }

  function handleRefund(txId: string) {
    const tx = transactions.find(t => t.id === txId)
    if (!tx || tx.type !== "debit" || !user) return
    const prevBalance = user.walletBalance
    updateUser({ walletBalance: prevBalance + tx.amount })
    addTransaction({
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      description: `Refund: ${tx.description}`,
      amount: tx.amount,
      type: "refund",
    })
    logAction("refund", `transaction:${txId}`, `$${prevBalance}`, `$${prevBalance + tx.amount}`)
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-10">
        <FadeIn>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground mb-8">
            {t("wallet.title")}
          </h1>
        </FadeIn>

        {/* Balance Card */}
        <FadeIn delay={0.1}>
          <div className="bg-gradient-to-br from-primary/20 via-card to-card border border-primary/20 rounded-2xl p-6 sm:p-8 mb-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t("wallet.balance")}</p>
                <motion.p
                  key={user?.walletBalance}
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  className="font-display font-bold text-4xl sm:text-5xl text-foreground"
                >
                  ${user?.walletBalance.toLocaleString() ?? "0"}
                </motion.p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setAddingFunds(!addingFunds)}
              className="mt-6 px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-colors text-sm"
            >
              <Plus className="h-4 w-4" />
              {t("wallet.addFunds")}
            </motion.button>

            <AnimatePresence>
              {addingFunds && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2">
                    {ADD_AMOUNTS.map(amount => (
                      <button
                        key={amount}
                        onClick={() => handleAddFunds(amount)}
                        className="px-5 py-2 rounded-lg bg-surface border border-border text-sm font-medium text-foreground hover:border-primary/50 hover:text-primary transition-colors"
                      >
                        +${amount}
                      </button>
                    ))}
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={customAmount}
                        onChange={e => setCustomAmount(e.target.value)}
                        placeholder="Custom"
                        className="w-24 px-3 py-2 rounded-lg bg-surface border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <button
                        onClick={() => {
                          const amt = parseInt(customAmount)
                          if (amt > 0) handleAddFunds(amt)
                        }}
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </FadeIn>

        {/* My Tickets */}
        {purchasedTickets.length > 0 && (
          <FadeIn delay={0.15}>
            <h2 className="font-display font-bold text-xl text-foreground mb-4 flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" />
              My Tickets
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {purchasedTickets.map(pt => (
                <div key={pt.id} className="bg-card border border-border rounded-xl p-4 flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm text-card-foreground">{pt.eventName}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {pt.qty} ticket(s) &middot; {pt.paymentType === "full" ? "Paid in full" : `Installment ${pt.installmentsPaid}/${pt.installmentsTotal}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(pt.purchasedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-primary">${pt.totalPaid}</p>
                    {pt.paymentType === "installment" && pt.installmentsPaid < pt.installmentsTotal && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        ${pt.perMonth}/mo remaining
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        )}

        {/* Transactions */}
        <FadeIn delay={0.2}>
          <h2 className="font-display font-bold text-xl text-foreground mb-4">{t("wallet.transactions")}</h2>
          {transactions.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-10 text-center">
              <p className="text-muted-foreground text-sm">{t("wallet.noTransactions")}</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">{t("wallet.date")}</th>
                      <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">{t("wallet.description")}</th>
                      <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase text-right">{t("wallet.amount")}</th>
                      <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase text-right">{t("wallet.type")}</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <motion.tr
                        key={tx.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-5 py-3.5 text-sm text-muted-foreground whitespace-nowrap">{tx.date}</td>
                        <td className="px-5 py-3.5 text-sm text-card-foreground">{tx.description}</td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-right whitespace-nowrap">
                          <span className={tx.type === "credit" || tx.type === "refund" ? "text-green-500" : "text-card-foreground"}>
                            {tx.type === "debit" ? "-" : "+"}${tx.amount}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase ${
                            tx.type === "credit" ? "bg-green-500/10 text-green-500" :
                            tx.type === "refund" ? "bg-primary/10 text-primary" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {tx.type === "credit" && <ArrowDownLeft className="h-3 w-3" />}
                            {tx.type === "debit" && <ArrowUpRight className="h-3 w-3" />}
                            {tx.type === "refund" && <RotateCcw className="h-3 w-3" />}
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {tx.type === "debit" && (
                            refundConfirm === tx.id ? (
                              <div className="flex items-center gap-1.5 justify-end">
                                <button
                                  onClick={() => { handleRefund(tx.id); setRefundConfirm(null) }}
                                  className="px-2.5 py-1 text-[11px] font-semibold bg-destructive/10 text-destructive rounded-md hover:bg-destructive/20 transition-colors"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setRefundConfirm(null)}
                                  className="px-2.5 py-1 text-[11px] font-medium text-muted-foreground rounded-md hover:bg-muted transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setRefundConfirm(tx.id)}
                                className="text-xs text-primary hover:underline"
                              >
                                {t("wallet.refund")}
                              </button>
                            )
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </FadeIn>
      </div>
    </PageTransition>
  )
}
