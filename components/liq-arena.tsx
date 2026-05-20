"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { tokens } from "@/lib/mock-data"
import { useRugged } from "@/lib/rugged-store"
import { LeverageBadge } from "@/components/leverage-badge"
import { Skull, Flame, AlertTriangle, ShieldCheck } from "lucide-react"

export function LiqArena() {
  const rugged = useRugged()
  const live = tokens.filter((t) => !rugged[t.id])
  const sorted = [...live].sort((a, b) => a.liqDistance - b.liqDistance)
  const danger = sorted.filter((t) => t.liqDistance < 15)
  const watch = sorted.filter((t) => t.liqDistance >= 15 && t.liqDistance < 30)
  const safe = sorted.filter((t) => t.liqDistance >= 30)

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-8">
      {/* Hero */}
      <div className="relative rounded-2xl border-2 border-destructive/50 bg-card overflow-hidden mb-6">
        <div className="absolute inset-0 stripes opacity-30 pointer-events-none" style={{ filter: "hue-rotate(-90deg)" }} />
        <div className="absolute inset-0 halftone opacity-20 pointer-events-none" />
        <div className="relative p-6 flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-destructive bg-destructive/10 text-destructive font-mono text-[11px] uppercase tracking-widest mb-3 animate-pulse">
              <Flame className="h-3 w-3" /> live · updates every block
            </div>
            <h1 className="font-display text-4xl md:text-6xl uppercase leading-none">
              liquidation <span className="text-destructive">arena</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground font-mono max-w-xl">
              live perp positions backing every token. closer to 0% = closer to <span className="text-destructive font-bold">zero</span>.
            </p>
          </div>
          <div className="flex gap-2 font-mono text-xs">
            <Pill label="near liq" value={danger.length} tone="destructive" />
            <Pill label="watchlist" value={watch.length} tone="accent" />
            <Pill label="safe" value={safe.length} tone="primary" />
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <section className="rounded-xl border-2 border-border bg-card p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display uppercase text-base">heatmap</h2>
          <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
            <span className="inline-block w-3 h-3 rounded bg-destructive" /> &lt;15%
            <span className="inline-block w-3 h-3 rounded bg-accent ml-2" /> &lt;30%
            <span className="inline-block w-3 h-3 rounded bg-primary ml-2" /> safe
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1.5">
          {sorted.map((t) => {
            const tone =
              t.liqDistance < 15
                ? "bg-destructive text-destructive-foreground"
                : t.liqDistance < 30
                  ? "bg-accent text-accent-foreground"
                  : "bg-primary text-primary-foreground"
            const intensity = Math.min(1, Math.max(0.4, 1 - t.liqDistance / 60))
            return (
              <Link
                key={t.id}
                href={`/token/${t.id}`}
                className={`rounded-md p-2 ${tone} hover:scale-105 transition-transform relative overflow-hidden`}
                style={{ opacity: 0.6 + intensity * 0.4 }}
              >
                <div className="font-display text-xs uppercase truncate leading-none">${t.ticker}</div>
                <div className="font-mono text-[10px] opacity-90 mt-1">{t.liqDistance}% to liq</div>
                <div className="font-mono text-[10px] opacity-80">{t.leverage}x {t.direction}</div>
              </Link>
            )
          })}
        </div>
      </section>

      <Group title="near liquidation" icon={<Skull className="h-4 w-4 text-destructive" />} rows={danger} tone="destructive" />
      <Group title="watchlist" icon={<AlertTriangle className="h-4 w-4 text-accent" />} rows={watch} tone="accent" />
      <Group title="safe" icon={<ShieldCheck className="h-4 w-4 text-primary" />} rows={safe} tone="primary" />
    </main>
  )
}

function Pill({ label, value, tone }: { label: string; value: number; tone: "destructive" | "accent" | "primary" }) {
  const cls =
    tone === "destructive"
      ? "border-destructive bg-destructive/10 text-destructive"
      : tone === "accent"
        ? "border-accent bg-accent/10 text-accent"
        : "border-primary bg-primary/10 text-primary"
  return (
    <div className={`px-3 py-1.5 rounded-md border-2 ${cls} font-mono`}>
      <span className="opacity-70 uppercase tracking-wider text-[10px]">{label}</span>{" "}
      <span className="font-display text-base">{value}</span>
    </div>
  )
}

function Group({
  title,
  icon,
  rows,
  tone,
}: {
  title: string
  icon: React.ReactNode
  rows: typeof tokens
  tone: "destructive" | "accent" | "primary"
}) {
  if (rows.length === 0) return null
  const bar = tone === "destructive" ? "bg-destructive" : tone === "accent" ? "bg-accent" : "bg-primary"
  const border = tone === "destructive" ? "border-destructive/40" : tone === "accent" ? "border-accent/40" : "border-primary/40"
  return (
    <section className={`rounded-xl border-2 ${border} bg-card mb-4 overflow-hidden`}>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b-2 border-border font-display uppercase text-sm bg-secondary/40">
        {icon}
        {title}
        <span className="text-muted-foreground font-mono text-xs normal-case">({rows.length})</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full font-mono text-xs">
          <thead className="text-muted-foreground bg-background/40">
            <tr className="text-left">
              <th className="px-4 py-2 font-normal uppercase tracking-wider text-[10px]">token</th>
              <th className="px-4 py-2 font-normal uppercase tracking-wider text-[10px]">leverage</th>
              <th className="px-4 py-2 font-normal uppercase tracking-wider text-[10px]">underlying</th>
              <th className="px-4 py-2 font-normal uppercase tracking-wider text-[10px]">mcap</th>
              <th className="px-4 py-2 font-normal uppercase tracking-wider text-[10px]">24h</th>
              <th className="px-4 py-2 font-normal uppercase tracking-wider text-[10px]">liq distance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((t) => (
              <tr key={t.id} className="hover:bg-secondary/40">
                <td className="px-4 py-2.5">
                  <Link href={`/token/${t.id}`} className="flex items-center gap-2 hover:text-primary">
                    <span className="text-xl">{t.emoji}</span>
                    <span className="font-display uppercase">${t.ticker}</span>
                    <span className="text-muted-foreground truncate normal-case">{t.name}</span>
                  </Link>
                </td>
                <td className="px-4 py-2.5"><LeverageBadge leverage={t.leverage} direction={t.direction} /></td>
                <td className="px-4 py-2.5 text-muted-foreground">{t.underlying}</td>
                <td className="px-4 py-2.5 text-accent">${(t.marketCap / 1000).toFixed(1)}k</td>
                <td className={t.change24h >= 0 ? "px-4 py-2.5 text-primary" : "px-4 py-2.5 text-destructive"}>
                  {t.change24h >= 0 ? "+" : ""}{t.change24h.toFixed(1)}%
                </td>
                <td className="px-4 py-2.5 w-64">
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-background border border-border overflow-hidden">
                      <div className={`h-full ${bar}`} style={{ width: `${Math.min(100, t.liqDistance * 2)}%` }} />
                    </div>
                    <span className="text-foreground w-10 text-right font-display">{t.liqDistance}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function relTime(ts?: number) {
  if (!ts) return "just now"
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  return `${Math.floor(s / 3600)}h ago`
}
