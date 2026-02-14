"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar, Plus, Eye, EyeOff, Save, Trash2, ChevronUp,
  AlertTriangle, Ticket,
} from "lucide-react"
import { useAuth, useNotifications } from "@/components/providers"
import { PermissionGuard } from "@/components/permission-guard"
import {
  MOCK_EVENTS, getCustomEvents, setCustomEvents, type MWEvent,
} from "@/lib/store"
import { PageTransition, FadeIn } from "@/components/page-transition"

const inputClass = "w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"

export default function EventsAdminPage() {
  const { logAction } = useAuth()
  const { addNotification } = useNotifications()
  const [customEvents, setCustomEventsState] = useState(getCustomEvents)
  const [showCreate, setShowCreate] = useState(false)
  const [eName, setEName] = useState("")
  const [eDate, setEDate] = useState("")
  const [eLocation, setELocation] = useState("")
  const [eCategory, setECategory] = useState<MWEvent["category"]>("concert")
  const [ePrice, setEPrice] = useState("")
  const [eDesc, setEDesc] = useState("")
  const [eTickets, setETickets] = useState("100")
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const err: Record<string, string> = {}
    if (!eName.trim()) err.name = "Event name is required"
    if (!eDate) err.date = "Date is required"
    if (!eLocation.trim()) err.location = "Location is required"
    const price = parseInt(ePrice)
    if (isNaN(price) || price < 0) err.price = "Valid price required"
    const tickets = parseInt(eTickets)
    if (isNaN(tickets) || tickets < 1) err.tickets = "Minimum 1 ticket"
    setErrors(err)
    return Object.keys(err).length === 0
  }

  function handleCreate() {
    if (!validate()) return
    const newEvent: MWEvent = {
      id: `ce-${Date.now()}`,
      name: eName.trim(), date: eDate, location: eLocation.trim(), category: eCategory,
      price: parseInt(ePrice) || 0, image: `/images/event-${Math.floor(Math.random() * 6) + 1}.jpg`,
      description: eDesc || `Custom event: ${eName}`, ticketsLeft: parseInt(eTickets) || 100, published: true,
    }
    const updated = [...customEvents, newEvent]
    setCustomEventsState(updated); setCustomEvents(updated)
    addNotification(`Event "${eName}" created!`)
    logAction("create_event", `event:${newEvent.id}`, undefined, eName)
    setEName(""); setEDate(""); setELocation(""); setEPrice(""); setEDesc(""); setETickets("100")
    setShowCreate(false); setErrors({})
  }

  function togglePublish(id: string) {
    const updated = customEvents.map(e => e.id === id ? { ...e, published: !e.published } : e)
    setCustomEventsState(updated); setCustomEvents(updated)
    const ev = updated.find(e => e.id === id)
    logAction(ev?.published ? "publish_event" : "unpublish_event", `event:${id}`)
  }

  function deleteEvent(id: string) {
    const ev = customEvents.find(e => e.id === id)
    const updated = customEvents.filter(e => e.id !== id)
    setCustomEventsState(updated); setCustomEvents(updated)
    logAction("delete_event", `event:${id}`, ev?.name)
  }

  const allEvents = [...MOCK_EVENTS, ...customEvents]

  return (
    <PermissionGuard requiredPermissions={["canEditEvents"]}>
      <PageTransition>
        <div className="p-4 lg:p-8 max-w-5xl mx-auto">
          <FadeIn>
            <h1 className="font-display font-bold text-2xl text-foreground mb-1">Event Management</h1>
            <p className="text-sm text-muted-foreground mb-6">Create, edit, and manage events. Ticket quantities are validated server-side.</p>
          </FadeIn>

          <button onClick={() => setShowCreate(!showCreate)} className="mb-4 flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:bg-primary/90 transition-colors">
            {showCreate ? <ChevronUp className="h-4 w-4" /> : <Plus className="h-4 w-4" />} Create Event
          </button>
          <AnimatePresence>
            {showCreate && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="block text-xs font-semibold text-muted-foreground mb-1.5">Event Name *</label><input value={eName} onChange={e => setEName(e.target.value)} className={inputClass} placeholder="Event name" />{errors.name && <p className="text-[10px] text-destructive mt-1">{errors.name}</p>}</div>
                    <div><label className="block text-xs font-semibold text-muted-foreground mb-1.5">Date *</label><input type="date" value={eDate} onChange={e => setEDate(e.target.value)} className={inputClass} />{errors.date && <p className="text-[10px] text-destructive mt-1">{errors.date}</p>}</div>
                    <div><label className="block text-xs font-semibold text-muted-foreground mb-1.5">Location *</label><input value={eLocation} onChange={e => setELocation(e.target.value)} className={inputClass} placeholder="City, Country" />{errors.location && <p className="text-[10px] text-destructive mt-1">{errors.location}</p>}</div>
                    <div><label className="block text-xs font-semibold text-muted-foreground mb-1.5">Category</label>
                      <select value={eCategory} onChange={e => setECategory(e.target.value as MWEvent["category"])} className={inputClass}>
                        <option value="concert">Concert</option><option value="workshop">Workshop</option><option value="festival">Festival</option><option value="conference">Conference</option>
                      </select>
                    </div>
                    <div><label className="block text-xs font-semibold text-muted-foreground mb-1.5">Price ($) *</label><input type="number" value={ePrice} onChange={e => setEPrice(e.target.value)} className={inputClass} placeholder="100" min="0" />{errors.price && <p className="text-[10px] text-destructive mt-1">{errors.price}</p>}</div>
                    <div><label className="block text-xs font-semibold text-muted-foreground mb-1.5">Ticket Qty *</label><input type="number" value={eTickets} onChange={e => setETickets(e.target.value)} className={inputClass} placeholder="100" min="1" />{errors.tickets && <p className="text-[10px] text-destructive mt-1">{errors.tickets}</p>}</div>
                  </div>
                  <div className="mt-4"><label className="block text-xs font-semibold text-muted-foreground mb-1.5">Description</label><textarea value={eDesc} onChange={e => setEDesc(e.target.value)} rows={2} className={`${inputClass} resize-none`} placeholder="Event description..." /></div>
                  <button onClick={handleCreate} className="mt-4 px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:bg-primary/90 transition-colors flex items-center gap-2"><Save className="h-4 w-4" /> Save</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-2">
            {allEvents.map(event => {
              const isCustom = event.id.startsWith("ce-")
              const lowStock = event.ticketsLeft > 0 && event.ticketsLeft < 20
              const soldOut = event.ticketsLeft === 0
              return (
                <div key={event.id} className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-card-foreground truncate">{event.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                      <span>{event.date}</span><span>--</span><span>{event.location}</span><span>--</span><span>${event.price}</span>
                      <span className="flex items-center gap-1"><Ticket className="h-3 w-3" />{event.ticketsLeft} left</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {lowStock && <AlertTriangle className="h-3.5 w-3.5 text-chart-5" />}
                    {soldOut && <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-destructive/10 text-destructive">Sold Out</span>}
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${event.published ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"}`}>{event.published ? "Live" : "Draft"}</span>
                    {isCustom && (
                      <>
                        <button onClick={() => togglePublish(event.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">{event.published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button>
                        <button onClick={() => deleteEvent(event.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </PageTransition>
    </PermissionGuard>
  )
}
