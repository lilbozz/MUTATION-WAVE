"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText, Eye, EyeOff, Save, Plus, Trash2, ChevronUp,
  GripVertical, CheckCircle2, Home as HomeIcon,
} from "lucide-react"
import { useAuth, useNotifications } from "@/components/providers"
import { PermissionGuard } from "@/components/permission-guard"
import {
  getNewsPosts, setNewsPosts, getHomepageConfig, setHomepageConfig,
  type NewsPost, type HomepageConfig,
} from "@/lib/store"
import { PageTransition, FadeIn } from "@/components/page-transition"

const inputClass = "w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"

type CMSTab = "homepage" | "news"

export default function ContentPage() {
  const [tab, setTab] = useState<CMSTab>("homepage")
  return (
    <PermissionGuard requiredPermissions={["canManageCMS", "canPublishNews", "canManageHomepage"]}>
      <PageTransition>
        <div className="p-4 lg:p-8 max-w-5xl mx-auto">
          <FadeIn>
            <h1 className="font-display font-bold text-2xl text-foreground mb-1">Content Management</h1>
            <p className="text-sm text-muted-foreground mb-6">Manage homepage sections, news posts, and content scheduling.</p>
          </FadeIn>

          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
            {(["homepage", "news"] as CMSTab[]).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                tab === t ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}>
                {t === "homepage" ? <HomeIcon className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                {t === "homepage" ? "Homepage" : "News"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {tab === "homepage" ? <HomepageEditor /> : <NewsEditor />}
            </motion.div>
          </AnimatePresence>
        </div>
      </PageTransition>
    </PermissionGuard>
  )
}

function HomepageEditor() {
  const { logAction } = useAuth()
  const [config, setConfig] = useState<HomepageConfig>(getHomepageConfig)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setHomepageConfig(config)
    logAction("edit_homepage", "homepage_config", undefined, JSON.stringify(config))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-5">
      <div><label className="block text-xs font-semibold text-muted-foreground mb-1.5">Hero Title</label><input value={config.heroTitle} onChange={e => setConfig({ ...config, heroTitle: e.target.value })} className={inputClass} maxLength={100} /></div>
      <div><label className="block text-xs font-semibold text-muted-foreground mb-1.5">Hero Subtitle</label><input value={config.heroSubtitle} onChange={e => setConfig({ ...config, heroSubtitle: e.target.value })} className={inputClass} maxLength={200} /></div>
      <div><label className="block text-xs font-semibold text-muted-foreground mb-1.5">Featured Artist IDs (comma separated)</label><input value={config.featuredArtistIds.join(",")} onChange={e => setConfig({ ...config, featuredArtistIds: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} className={inputClass} placeholder="a1,a2,a3" /></div>
      <div><label className="block text-xs font-semibold text-muted-foreground mb-1.5">Featured Event IDs (comma separated)</label><input value={config.featuredEventIds.join(",")} onChange={e => setConfig({ ...config, featuredEventIds: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} className={inputClass} placeholder="e1,e2,e3" /></div>
      <div className="flex items-center gap-3">
        <button onClick={handleSave} className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:bg-primary/90 transition-colors flex items-center gap-2"><Save className="h-4 w-4" /> Save</button>
        {saved && <span className="text-xs text-chart-2 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Saved</span>}
      </div>
    </div>
  )
}

function NewsEditor() {
  const { user, logAction } = useAuth()
  const { addNotification } = useNotifications()
  const [posts, setPosts] = useState<NewsPost[]>(getNewsPosts)
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")

  function handleCreate() {
    if (!title.trim() || !body.trim()) return
    const post: NewsPost = {
      id: `news-${Date.now()}`, title: title.trim(), body: body.trim(),
      coverImage: `/images/event-${Math.floor(Math.random() * 6) + 1}.jpg`,
      published: false, pinned: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      authorId: user?.id || "", authorName: user?.name || "",
    }
    const updated = [post, ...posts]
    setPosts(updated); setNewsPosts(updated)
    addNotification(`News "${title}" created!`)
    logAction("create_news", `news:${post.id}`, undefined, title)
    setTitle(""); setBody(""); setShowCreate(false)
  }

  function togglePublish(id: string) {
    const updated = posts.map(p => p.id === id ? { ...p, published: !p.published, updatedAt: new Date().toISOString() } : p)
    setPosts(updated); setNewsPosts(updated)
    const p = updated.find(np => np.id === id)
    logAction(p?.published ? "publish_news" : "unpublish_news", `news:${id}`)
  }

  function deletePost(id: string) {
    const p = posts.find(np => np.id === id)
    const updated = posts.filter(np => np.id !== id)
    setPosts(updated); setNewsPosts(updated)
    logAction("delete_news", `news:${id}`, p?.title)
  }

  return (
    <div>
      <button onClick={() => setShowCreate(!showCreate)} className="mb-4 flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:bg-primary/90 transition-colors">
        {showCreate ? <ChevronUp className="h-4 w-4" /> : <Plus className="h-4 w-4" />} Create Post
      </button>
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
            <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
              <div><label className="block text-xs font-semibold text-muted-foreground mb-1.5">Title</label><input value={title} onChange={e => setTitle(e.target.value)} className={inputClass} placeholder="Post title" maxLength={100} /></div>
              <div><label className="block text-xs font-semibold text-muted-foreground mb-1.5">Body</label><textarea value={body} onChange={e => setBody(e.target.value)} rows={4} className={`${inputClass} resize-none`} placeholder="Write your post..." /></div>
              <button onClick={handleCreate} className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:bg-primary/90 transition-colors flex items-center gap-2 self-start"><Save className="h-4 w-4" /> Create</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {posts.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-10 text-center"><p className="text-sm text-muted-foreground">No news posts yet.</p></div>
      ) : (
        <div className="flex flex-col gap-2">
          {posts.map(post => (
            <div key={post.id} className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-card-foreground truncate">{post.title}</p>
                <p className="text-xs text-muted-foreground">by {post.authorName} -- {new Date(post.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md shrink-0 ${post.published ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"}`}>{post.published ? "Live" : "Draft"}</span>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => togglePublish(post.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">{post.published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button>
                <button onClick={() => deletePost(post.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
