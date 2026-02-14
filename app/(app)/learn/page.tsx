"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Lock, Play, CheckCircle2, ChevronRight, BookOpen } from "lucide-react"
import { useLang, useAuth } from "@/components/providers"
import { MOCK_COURSES, getCustomCourses, getCourseProgress, setCourseProgress } from "@/lib/store"
import type { Course, Tier } from "@/lib/store"
import { PageTransition, FadeIn, ScaleOnHover } from "@/components/page-transition"

const TIER_ORDER: Tier[] = ["free", "member", "pro"]

function canAccess(userTier: Tier, courseTier: Tier) {
  return TIER_ORDER.indexOf(userTier) >= TIER_ORDER.indexOf(courseTier)
}

export default function LearnPage() {
  const { t } = useLang()
  const { user } = useAuth()
  const allCourses = [...MOCK_COURSES, ...getCustomCourses()].filter(c => c.published)
  const [activeCourse, setActiveCourse] = useState<Course | null>(null)
  const [progress, setProgress] = useState<Record<string, number>>(getCourseProgress)

  const userTier = user?.tier ?? "free"

  function handleStartLesson(courseId: string, totalLessons: number) {
    const current = progress[courseId] ?? 0
    if (current >= totalLessons) return
    const updated = { ...progress, [courseId]: current + 1 }
    setProgress(updated)
    setCourseProgress(updated)
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
        <FadeIn>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground mb-2">
            {t("learn.title")}
          </h1>
          <p className="text-muted-foreground mb-10">
            Master your craft with world-class artists and producers.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {allCourses.map((course, i) => {
                const accessible = canAccess(userTier, course.tier)
                const courseProgress = progress[course.id] ?? 0
                const pct = Math.round((courseProgress / course.lessons) * 100)
                const isCompleted = courseProgress >= course.lessons

                return (
                  <FadeIn key={course.id} delay={i * 0.05}>
                    <ScaleOnHover>
                      <button
                        onClick={() => accessible && setActiveCourse(course)}
                        className={`block w-full text-left group ${!accessible ? "opacity-60" : ""}`}
                        disabled={!accessible}
                      >
                        <div className="bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-colors">
                          <div className="relative aspect-video">
                            <Image src={course.image} alt={course.name} fill className="object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                            {!accessible && (
                              <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-2">
                                  <Lock className="h-6 w-6 text-muted-foreground" />
                                  <span className="text-xs font-semibold text-muted-foreground">{t("learn.locked")}</span>
                                </div>
                              </div>
                            )}
                            <div className="absolute bottom-3 left-3 flex items-center gap-2">
                              <div className="relative h-7 w-7 rounded-full overflow-hidden border-2 border-card">
                                <Image src={course.artistImage} alt={course.artist} fill className="object-cover" />
                              </div>
                              <span className="text-xs font-medium text-card-foreground">{course.artist}</span>
                            </div>
                            {course.tier !== "free" && (
                              <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-primary/90 text-[10px] font-bold uppercase text-primary-foreground">
                                {course.tier}
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                              {course.name}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {course.lessons} lessons
                            </p>
                            {accessible && courseProgress > 0 && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-xs mb-1.5">
                                  <span className="text-muted-foreground">{t("learn.progress")}</span>
                                  <span className={`font-semibold ${isCompleted ? "text-green-500" : "text-primary"}`}>
                                    {isCompleted ? t("learn.completed") : `${pct}%`}
                                  </span>
                                </div>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                  <motion.div
                                    className={`h-full rounded-full ${isCompleted ? "bg-green-500" : "bg-primary"}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    </ScaleOnHover>
                  </FadeIn>
                )
              })}
            </div>
          </div>

          {/* Active Course Detail Panel */}
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {activeCourse ? (
                <motion.div
                  key={activeCourse.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-card border border-border rounded-2xl overflow-hidden sticky top-24"
                >
                  <div className="relative aspect-video">
                    <Image src={activeCourse.image} alt={activeCourse.name} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                  </div>
                  <div className="p-5 flex flex-col gap-4">
                    <div>
                      <h3 className="font-display font-bold text-lg text-card-foreground">{activeCourse.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{activeCourse.description}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative h-9 w-9 rounded-full overflow-hidden border-2 border-border">
                        <Image src={activeCourse.artistImage} alt={activeCourse.artist} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">{activeCourse.artist}</p>
                        <p className="text-xs text-muted-foreground">Instructor</p>
                      </div>
                    </div>

                    {/* Lesson List */}
                    <div className="flex flex-col gap-1.5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Lessons ({progress[activeCourse.id] ?? 0}/{activeCourse.lessons})
                      </p>
                      {Array.from({ length: activeCourse.lessons }).map((_, i) => {
                        const done = (progress[activeCourse.id] ?? 0) > i
                        const isCurrent = (progress[activeCourse.id] ?? 0) === i
                        return (
                          <div
                            key={i}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                              done ? "bg-green-500/5" : isCurrent ? "bg-primary/5 border border-primary/20" : "bg-muted/30"
                            }`}
                          >
                            {done ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                            ) : isCurrent ? (
                              <Play className="h-4 w-4 text-primary shrink-0" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border border-border shrink-0" />
                            )}
                            <span className={`flex-1 ${done ? "text-muted-foreground line-through" : "text-card-foreground"}`}>
                              Lesson {i + 1}
                            </span>
                            {isCurrent && (
                              <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0" />
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {(() => {
                      const cp = progress[activeCourse.id] ?? 0
                      const completed = cp >= activeCourse.lessons
                      return completed ? (
                        <div className="py-3 text-center text-sm font-semibold text-green-500 bg-green-500/10 rounded-xl flex items-center justify-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          {t("learn.completed")}
                        </div>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleStartLesson(activeCourse.id, activeCourse.lessons)}
                          className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                        >
                          <Play className="h-4 w-4" />
                          {cp > 0 ? t("learn.continueLearning") : t("learn.startLesson")}
                        </motion.button>
                      )
                    })()}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-card border border-border rounded-2xl p-10 text-center sticky top-24"
                >
                  <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Select a course to view lessons
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
