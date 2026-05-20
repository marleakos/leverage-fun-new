"use client"

import { tokens } from "@/lib/mock-data"
import Link from "next/link"
import { Trophy, Zap, Skull, Flame } from "lucide-react"

export function StatsBar() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 font-mono text-xs">
      <Stat icon={<Zap className="h-3.5 w-3.5" />}    label="launches today" value="1,284" tone="primary" />
      <Stat icon={<Flame className="h-3.5 w-3.5" />}  label="vol 24h"        value="$8.4M"  tone="accent" />
      <Stat icon={<Trophy className="h-3.5 w-3.5" />} label="graduated"      value="42"     tone="info" />
      <Stat icon={<Skull className="h-3.5 w-3.5" />}  label="rekt 24h"       value="312"    tone="destructive" />
    </div>
  )
}

function Stat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: string
  tone: "primary" | "accent" | "info" | "destructive"
}) {
  const map = {
    primary: "text-primary border-primary/40 bg-primary/10",
    accent: "text-accent border-accent/40 bg-accent/10",
    info: "text-info border-info/40 bg-info/10",
    destructive: "text-destructive border-destructive/40 bg-destructive/10",
  } as const
  return (
    <div className={`rounded-md border-2 ${map[tone]} px-3 py-2 flex items-center justify-between`}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="uppercase tracking-wider opacity-80">{label}</span>
      </div>
      <span className="font-display text-base">{value}</span>
    </div>
  )
}

export function NowMintingRail() {
  const recent = tokens.slice(0, 6)
  return (
    <div className="mb-6 rounded-xl border-2 border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b-2 border-border bg-secondary/40">
        <div className="flex items-center gap-2">
          <span className="relative grid place-items-center h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-primary animate-ping" />
            <span className="relative h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="font-display text-[11px] uppercase tracking-widest">just launched</span>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">scrolling live · {recent.length * 4} per min</span>
      </div>
      <div className="overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap gap-3 py-3 px-3">
          {[...recent, ...recent, ...recent].map((t, i) => (
            <Link
              key={`${t.id}-${i}`}
              href={`/token/${t.id}`}
              className="shrink-0 inline-flex items-center gap-2 rounded-lg border-2 border-border bg-background hover:border-primary px-3 py-2 transition-colors"
            >
              <span className="grid h-7 w-7 place-items-center rounded-md bg-secondary text-base">{t.emoji}</span>
              <div className="flex flex-col leading-tight">
                <span className="font-mono text-[11px] font-bold">${t.ticker}</span>
                <span className="font-mono text-[9px] text-muted-foreground">{t.leverage}x {t.direction.toLowerCase()} · {t.underlying}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
