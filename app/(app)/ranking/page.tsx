"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Trophy, Medal, Star, TrendingUp, Users } from "lucide-react"
import { useLang } from "@/components/providers"
import { MOCK_ARTISTS, MOCK_FANS } from "@/lib/store"
import { PageTransition, FadeIn } from "@/components/page-transition"

type Tab = "artists" | "fans"
type Period = "allTime" | "monthly"

const FLAG_MAP: Record<string, string> = {
  JP: "JP", KR: "KR", SE: "SE", IT: "IT", IN: "IN", CN: "CN",
}

export default function RankingPage() {
  const { t } = useLang()
  const [tab, setTab] = useState<Tab>("artists")
  const [period, setPeriod] = useState<Period>("allTime")

  const sortedArtists = [...MOCK_ARTISTS].sort((a, b) =>
    period === "allTime" ? b.points - a.points : b.monthlyPoints - a.monthlyPoints
  )

  const sortedFans = [...MOCK_FANS].sort((a, b) =>
    period === "allTime" ? b.points - a.points : b.monthlyPoints - a.monthlyPoints
  )

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-10">
        <FadeIn>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground mb-2">
            {t("ranking.title")}
          </h1>
          <p className="text-muted-foreground mb-8">
            See who is leading the Mutation Wave community.
          </p>
        </FadeIn>

        {/* Tabs */}
        <FadeIn delay={0.05}>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex bg-card border border-border rounded-xl p-1">
              <button
                onClick={() => setTab("artists")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === "artists" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Star className="h-3.5 w-3.5" />
                {t("ranking.artists")}
              </button>
              <button
                onClick={() => setTab("fans")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === "fans" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                {t("ranking.fans")}
              </button>
            </div>

            <div className="flex bg-card border border-border rounded-xl p-1">
              <button
                onClick={() => setPeriod("allTime")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  period === "allTime" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("ranking.allTime")}
              </button>
              <button
                onClick={() => setPeriod("monthly")}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  period === "monthly" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <TrendingUp className="h-3 w-3" />
                {t("ranking.monthly")}
              </button>
            </div>
          </div>
        </FadeIn>

        {/* Top 3 Podium (artists only) */}
        {tab === "artists" && sortedArtists.length >= 3 && (
          <FadeIn delay={0.1}>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[sortedArtists[1], sortedArtists[0], sortedArtists[2]].map((artist, i) => {
                const rank = i === 0 ? 2 : i === 1 ? 1 : 3
                const isFirst = rank === 1
                return (
                  <motion.div
                    key={artist.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className={`flex flex-col items-center text-center p-4 rounded-2xl border ${
                      isFirst
                        ? "bg-gradient-to-b from-primary/10 to-card border-primary/30 -mt-4"
                        : "bg-card border-border"
                    }`}
                  >
                    <div className={`relative mb-3 ${isFirst ? "h-16 w-16" : "h-12 w-12"}`}>
                      <Image
                        src={artist.image}
                        alt={artist.name}
                        fill
                        className="object-cover rounded-full"
                      />
                      <div className={`absolute -bottom-1 -right-1 rounded-full flex items-center justify-center ${
                        rank === 1 ? "h-6 w-6 bg-primary" : rank === 2 ? "h-5 w-5 bg-muted" : "h-5 w-5 bg-chart-5"
                      }`}>
                        {rank === 1 ? (
                          <Trophy className="h-3 w-3 text-primary-foreground" />
                        ) : (
                          <Medal className={`h-3 w-3 ${rank === 2 ? "text-muted-foreground" : "text-foreground"}`} />
                        )}
                      </div>
                    </div>
                    <p className={`font-semibold text-card-foreground ${isFirst ? "text-base" : "text-sm"}`}>
                      {artist.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{artist.genre}</p>
                    <p className="font-display font-bold text-primary mt-2">
                      {(period === "allTime" ? artist.points : artist.monthlyPoints).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{t("ranking.points")}</p>
                  </motion.div>
                )
              })}
            </div>
          </FadeIn>
        )}

        {/* Full List */}
        <FadeIn delay={0.2}>
          <div className="flex flex-col gap-2">
            {(tab === "artists" ? sortedArtists : sortedFans).map((item, i) => {
              const points = period === "allTime" ? item.points : item.monthlyPoints
              const isArtist = tab === "artists" && "image" in item

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                    i < 3 ? "bg-card border-primary/20" : "bg-card border-border hover:border-primary/20"
                  }`}
                >
                  <span className={`font-display font-bold text-lg w-8 text-center shrink-0 ${
                    i === 0 ? "text-primary" : i < 3 ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {i + 1}
                  </span>

                  {isArtist ? (
                    <div className="relative h-10 w-10 rounded-full overflow-hidden shrink-0">
                      <Image
                        src={(item as typeof MOCK_ARTISTS[0]).image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">
                        {item.name.charAt(0)}
                      </span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-card-foreground truncate">{item.name}</p>
                    {isArtist && (
                      <p className="text-xs text-muted-foreground">
                        {(item as typeof MOCK_ARTISTS[0]).genre}
                        {" "}&middot;{" "}
                        {FLAG_MAP[(item as typeof MOCK_ARTISTS[0]).country] ?? ""}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Star className={`h-3.5 w-3.5 ${i < 3 ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="text-sm font-semibold text-card-foreground">
                      {points.toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </FadeIn>
      </div>
    </PageTransition>
  )
}
