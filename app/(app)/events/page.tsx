"use client"

import { useState } from "react"
import { SafeImage } from "@/components/safe-image"
import Link from "next/link"
import { motion } from "framer-motion"
import { MapPin, Calendar, Ticket, CheckCircle2, SearchX } from "lucide-react"
import { useLang } from "@/components/providers"
import { MOCK_EVENTS, getCustomEvents, getPurchasedTickets } from "@/lib/store"
import { PageTransition, FadeIn, ScaleOnHover } from "@/components/page-transition"

const CATEGORIES = ["all", "concert", "workshop", "festival", "conference"] as const

export default function EventsPage() {
  const { t } = useLang()
  const [filter, setFilter] = useState<string>("all")
  const customEvents = getCustomEvents()
  const allEvents = [...MOCK_EVENTS, ...customEvents].filter(e => e.published)
  const events = filter === "all" ? allEvents : allEvents.filter(e => e.category === filter)
  const purchasedTickets = getPurchasedTickets()
  const purchasedEventIds = new Set(purchasedTickets.map(pt => pt.eventId))

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
        <FadeIn>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground mb-2">
            {t("events.title")}
          </h1>
        </FadeIn>

        {/* Filters */}
        <FadeIn delay={0.1}>
          <div className="flex gap-2 mt-6 mb-10 overflow-x-auto pb-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 ${
                  filter === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                }`}
              >
                {t(`events.filter.${cat}`)}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Grid */}
        {events.length === 0 ? (
          <FadeIn>
            <div className="bg-card border border-border rounded-2xl p-16 text-center">
              <SearchX className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="font-display font-semibold text-lg text-foreground mb-1">No events found</h3>
              <p className="text-sm text-muted-foreground">
                {filter !== "all"
                  ? `No ${filter} events available right now. Try a different category.`
                  : "No events available at the moment."}
              </p>
              {filter !== "all" && (
                <button
                  onClick={() => setFilter("all")}
                  className="mt-4 px-4 py-2 text-sm font-medium text-primary hover:underline"
                >
                  Show all events
                </button>
              )}
            </div>
          </FadeIn>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, i) => (
            <FadeIn key={event.id} delay={i * 0.05}>
              <ScaleOnHover>
                <Link href={`/events/${event.id}`} className="block group">
                  <div className="bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-all">
                    <div className="relative aspect-[16/10]">
                      <SafeImage src={event.image} alt={event.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" fallbackClassName="absolute inset-0" />
                      <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-md bg-card/80 backdrop-blur-sm text-[11px] font-semibold uppercase tracking-wider text-primary">
                          {event.category}
                        </span>
                      </div>
                      {event.ticketsLeft === 0 ? (
                        <div className="absolute top-3 right-3">
                          <span className="px-2.5 py-1 rounded-md bg-destructive/90 text-[11px] font-bold uppercase text-destructive-foreground">
                            {t("events.soldOut")}
                          </span>
                        </div>
                      ) : purchasedEventIds.has(event.id) ? (
                        <div className="absolute top-3 right-3">
                          <span className="px-2.5 py-1 rounded-md bg-green-500/90 text-[11px] font-bold uppercase text-foreground flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Purchased
                          </span>
                        </div>
                      ) : null}
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-lg text-card-foreground group-hover:text-primary transition-colors">
                        {event.name}
                      </h3>
                      <div className="flex flex-col gap-1.5 mt-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Ticket className="h-3.5 w-3.5 shrink-0" />
                          <span>{event.ticketsLeft > 0 ? `${event.ticketsLeft} ${t("events.available").toLowerCase()}` : t("events.soldOut")}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                        <span className="font-display font-bold text-xl text-foreground">${event.price}</span>
                        <span className="text-sm font-medium text-primary">{t("events.buyTicket")}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </ScaleOnHover>
            </FadeIn>
          ))}
        </div>
        )}
      </div>
    </PageTransition>
  )
}
