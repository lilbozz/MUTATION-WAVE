"use client"

import Image from "next/image"
import { SafeImage } from "@/components/safe-image"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { ArrowRight, Play, Star, Coins, Trophy } from "lucide-react"
import { useLang } from "@/components/providers"
import { MOCK_EVENTS, MOCK_COURSES, MOCK_ARTISTS } from "@/lib/store"
import { FadeIn, ScaleOnHover } from "@/components/page-transition"

export default function HomePage() {
  const { t } = useLang()

  return (
    <div className="flex flex-col">
      <HeroSection />
      <StorySection />
      <EventsPreview />
      <LearnPreview />
      <DropsSection />
      <RankingPreview />
      <CommunitySection />
      <Footer />
    </div>
  )
}

function HeroSection() {
  const { t } = useLang()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], [0, 150])
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <section ref={ref} className="relative h-screen flex items-center justify-center overflow-hidden -mt-16">
      <motion.div style={{ y }} className="absolute inset-0">
        <SafeImage
          src="/images/hero-bg.jpg"
          alt="Concert stage"
          fill
          className="object-cover"
          fallbackClassName="absolute inset-0"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/50 to-transparent" />
      </motion.div>

      <motion.div style={{ opacity }} className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground leading-tight text-balance">
            {t("home.hero.title")}
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty"
        >
          {t("home.hero.subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/events"
            className="px-8 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl transition-all animate-glow-pulse flex items-center gap-2 hover:bg-primary/90"
          >
            {t("home.hero.cta1")}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/learn"
            className="px-8 py-3.5 bg-surface border border-border text-foreground font-semibold rounded-xl hover:bg-muted transition-colors flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {t("home.hero.cta2")}
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border-2 border-foreground/30 flex items-start justify-center pt-2"
        >
          <div className="w-1 h-2 rounded-full bg-foreground/50" />
        </motion.div>
      </motion.div>
    </section>
  )
}

function StorySection() {
  const { t } = useLang()
  const stories = [
    { title: t("home.story1.title"), body: t("home.story1.body") },
    { title: t("home.story2.title"), body: t("home.story2.body") },
    { title: t("home.story3.title"), body: t("home.story3.body") },
  ]

  return (
    <section className="py-0">
      {stories.map((story, i) => (
        <div
          key={i}
          className="min-h-[60vh] flex items-center justify-center px-4"
        >
          <FadeIn className="max-w-3xl mx-auto text-center" delay={i * 0.1}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">
              {String(i + 1).padStart(2, "0")}
            </p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-foreground mb-6 text-balance">
              {story.title}
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed text-pretty">
              {story.body}
            </p>
          </FadeIn>
        </div>
      ))}
    </section>
  )
}

function EventsPreview() {
  const { t } = useLang()
  const events = MOCK_EVENTS.slice(0, 4)

  return (
    <section className="py-20 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground">
              {t("home.events.title")}
            </h2>
            <Link href="/events" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              {t("general.viewAll")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </FadeIn>

        <div className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
          {events.map((event, i) => (
            <FadeIn key={event.id} delay={i * 0.1} className="snap-start shrink-0 w-[280px] sm:w-[320px]">
              <ScaleOnHover>
                <Link href={`/events/${event.id}`} className="block group">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3">
                    <Image
                      src={event.image}
                      alt={event.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                        {event.category}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {event.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {event.location} &middot; {event.date}
                  </p>
                </Link>
              </ScaleOnHover>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function LearnPreview() {
  const { t } = useLang()
  const courses = MOCK_COURSES.slice(0, 3)

  return (
    <section className="py-20 px-4 lg:px-8 bg-surface-soft">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground">
              {t("home.learn.title")}
            </h2>
            <Link href="/learn" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              {t("general.viewAll")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, i) => (
            <FadeIn key={course.id} delay={i * 0.1}>
              <ScaleOnHover>
                <Link href="/learn" className="block group">
                  <div className="bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-colors">
                    <div className="relative aspect-video">
                      <Image src={course.image} alt={course.name} fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                      <div className="absolute bottom-3 left-3 flex items-center gap-2">
                        <div className="relative h-8 w-8 rounded-full overflow-hidden border-2 border-card">
                          <Image src={course.artistImage} alt={course.artist} fill className="object-cover" />
                        </div>
                        <span className="text-xs font-medium text-card-foreground">{course.artist}</span>
                      </div>
                      {course.tier !== "free" && (
                        <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-primary/90 text-[10px] font-bold uppercase text-primary-foreground">
                          {course.tier}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                        {course.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {course.lessons} lessons
                      </p>
                    </div>
                  </div>
                </Link>
              </ScaleOnHover>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function DropsSection() {
  const { t } = useLang()
  const drops = [
    { name: "Neon Genesis EP", artist: "Kai Watanabe", price: "$24.99", image: "/images/course-3.jpg" },
    { name: "Seoul Drift Pack", artist: "Sora Kim", price: "$19.99", image: "/images/course-1.jpg" },
    { name: "Arctic Textures", artist: "Lena Oberg", price: "$29.99", image: "/images/course-4.jpg" },
  ]

  return (
    <section className="py-20 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground mb-10">
            {t("home.drops.title")}
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {drops.map((drop, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <ScaleOnHover>
                <div className="group relative rounded-2xl overflow-hidden border border-border bg-card">
                  <div className="relative aspect-square">
                    <Image src={drop.image} alt={drop.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="text-xs text-muted-foreground">{drop.artist}</p>
                    <h3 className="font-semibold text-card-foreground mt-1">{drop.name}</h3>
                    <p className="text-primary font-bold mt-2">{drop.price}</p>
                  </div>
                </div>
              </ScaleOnHover>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function RankingPreview() {
  const { t } = useLang()
  const artists = MOCK_ARTISTS.slice(0, 5)

  return (
    <section className="py-20 px-4 lg:px-8 bg-surface-soft">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground">
              {t("home.ranking.title")}
            </h2>
            <Link href="/ranking" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              {t("general.viewAll")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </FadeIn>

        <div className="flex flex-col gap-3">
          {artists.map((artist, i) => (
            <FadeIn key={artist.id} delay={i * 0.05}>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
                <span className="font-display font-bold text-2xl text-muted-foreground w-8 text-center shrink-0">
                  {i + 1}
                </span>
                <div className="relative h-10 w-10 rounded-full overflow-hidden shrink-0">
                  <Image src={artist.image} alt={artist.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-card-foreground truncate">{artist.name}</p>
                  <p className="text-xs text-muted-foreground">{artist.genre}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Star className="h-3.5 w-3.5 text-primary" />
                  <span className="text-sm font-semibold text-card-foreground">{artist.points.toLocaleString()}</span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function CommunitySection() {
  const { t } = useLang()

  return (
    <section className="py-24 px-4 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <FadeIn>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Coins className="h-6 w-6 text-primary" />
            </div>
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground mb-4 text-balance">
            {t("home.community.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 text-pretty">
            {t("home.community.subtitle")}
          </p>
          <Link
            href="/gamification"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
          >
            {t("nav.gamification")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </FadeIn>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-border py-12 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="font-display font-bold text-xs text-primary-foreground">MW</span>
          </div>
          <span className="font-display font-bold text-sm text-foreground">MUTATION WAVE</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {"© 2026 Mutation Wave. All rights reserved."}
        </p>
      </div>
    </footer>
  )
}
