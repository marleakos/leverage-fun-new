"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import Link from "next/link"
import { tokens, liveTrades, type LiveTrade } from "@/lib/mock-data"

const MAX = 14

function randomTrade(): LiveTrade {
  const t = tokens[Math.floor(Math.random() * tokens.length)]
  const side = Math.random() < 0.62 ? "BUY" : "SELL"
  const amount = +(Math.random() * 14 + 0.1).toFixed(2)
  const user = Math.random().toString(36).slice(2, 6)
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ticker: t.ticker,
    side,
    amount,
    user,
    ago: "now",
  }
}

export function TradesTicker() {
  const [feed, setFeed] = useState<LiveTrade[]>(() => liveTrades.slice(0, MAX))

  useEffect(() => {
    let cancelled = false
    const tick = () => {
      if (cancelled) return
      setFeed((f) => [randomTrade(), ...f].slice(0, MAX))
      setTimeout(tick, 500 + Math.random() * 1100)
    }
    const t = setTimeout(tick, 600)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [])

  return (
    <div className="relative border-b border-border bg-[#1a1a1a] overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 min-h-[44px]">
        <span className="shrink-0 inline-flex items-center gap-1.5 rounded bg-[#39ff14]/20 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-[#39ff14]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#39ff14] opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#39ff14]" />
          </span>
          LIVE TRADES
        </span>

        <div className="flex-1 overflow-hidden">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div layout className="flex items-center gap-2">
              {feed.map((t, i) => (
                <TradePill key={t.id} t={t} fresh={i === 0} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* fade-out edge */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-background to-transparent" />
      </div>
    </div>
  )
}

function TradePill({ t, fresh }: { t: LiveTrade; fresh: boolean }) {
  const buy = t.side === "BUY"
  const tokenMatch = tokens.find((x) => x.ticker === t.ticker)
  const emoji = tokenMatch?.emoji ?? "🪙"

  return (
    <motion.div
      layout
      initial={{ x: 220, opacity: 0, scale: 0.85 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.25 } }}
      transition={{ type: "spring", stiffness: 500, damping: 32 }}
      className="shrink-0"
    >
      <Link
        href={tokenMatch ? `/token/${tokenMatch.id}` : "#"}
        className={`relative inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[11px] whitespace-nowrap transition-colors ${
          buy
            ? "border-primary/40 bg-primary/10 hover:bg-primary/20"
            : "border-destructive/40 bg-destructive/10 hover:bg-destructive/20"
        }`}
      >
        {fresh && (
          <motion.span
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className={`absolute inset-0 rounded-md ${buy ? "bg-primary/40" : "bg-destructive/40"}`}
          />
        )}
        <span className="relative text-base leading-none">{emoji}</span>
        <span className={`relative font-bold ${buy ? "text-primary" : "text-destructive"}`}>{t.side}</span>
        <span className="relative font-bold text-foreground">${t.ticker}</span>
        <span className="relative tabular-nums text-foreground">{t.amount}</span>
        <span className="relative text-muted-foreground">SOL</span>
        <span className="relative text-muted-foreground">by {t.user}</span>
      </Link>
    </motion.div>
  )
}
