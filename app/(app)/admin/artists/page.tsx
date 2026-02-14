"use client"

import { useState } from "react"
import { Music, Save, Star, Globe } from "lucide-react"
import { useAuth } from "@/components/providers"
import { PermissionGuard } from "@/components/permission-guard"
import { MOCK_ARTISTS } from "@/lib/store"
import { PageTransition, FadeIn } from "@/components/page-transition"

const inputClass = "w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"

export default function ArtistsAdminPage() {
  const { logAction } = useAuth()
  const [artists] = useState(MOCK_ARTISTS)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editGenre, setEditGenre] = useState("")
  const [featured, setFeatured] = useState<Set<string>>(new Set(["a1", "a2"]))

  function startEdit(a: typeof artists[0]) {
    setEditingId(a.id); setEditName(a.name); setEditGenre(a.genre)
  }

  function saveEdit(id: string) {
    logAction("edit_artist", `artist:${id}`, undefined, `name: ${editName}, genre: ${editGenre}`)
    setEditingId(null)
  }

  function toggleFeatured(id: string) {
    setFeatured(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <PermissionGuard requiredPermissions={["canEditArtists"]}>
      <PageTransition>
        <div className="p-4 lg:p-8 max-w-5xl mx-auto">
          <FadeIn>
            <h1 className="font-display font-bold text-2xl text-foreground mb-1">Artist Management</h1>
            <p className="text-sm text-muted-foreground mb-6">Edit profiles, feature/unfeature artists.</p>
          </FadeIn>

          <div className="flex flex-col gap-2">
            {artists.map(artist => (
              <FadeIn key={artist.id}>
                <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Music className="h-5 w-5 text-primary" />
                  </div>
                  {editingId === artist.id ? (
                    <div className="flex-1 flex flex-wrap items-center gap-2">
                      <input value={editName} onChange={e => setEditName(e.target.value)} className={`${inputClass} max-w-[180px]`} maxLength={50} />
                      <input value={editGenre} onChange={e => setEditGenre(e.target.value)} className={`${inputClass} max-w-[140px]`} maxLength={30} />
                      <button onClick={() => saveEdit(artist.id)} className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg"><Save className="h-3.5 w-3.5" /></button>
                      <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-card-foreground truncate">{artist.name}</p>
                          {featured.has(artist.id) && <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-chart-4/10 text-chart-4">Featured</span>}
                        </div>
                        <p className="text-xs text-muted-foreground">{artist.genre} -- <Globe className="inline h-3 w-3" /> {artist.country}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={() => toggleFeatured(artist.id)} className={`p-1.5 rounded-lg transition-colors ${featured.has(artist.id) ? "text-chart-4 bg-chart-4/10" : "text-muted-foreground hover:text-chart-4 hover:bg-chart-4/5"}`} title={featured.has(artist.id) ? "Unfeature" : "Feature"}>
                          <Star className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => startEdit(artist)} className="text-xs text-primary hover:underline">Edit</button>
                      </div>
                    </>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </PageTransition>
    </PermissionGuard>
  )
}
