"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import type { Token } from "@/lib/mock-data"
import { AlertTriangle } from "lucide-react"

export function TradePanel({ token }: { token: Token }) {
  const [side, setSide] = useState<"buy" | "sell">("buy")
  const [amount, setAmount] = useState("")
  const [bursts, setBursts] = useState<{ id: number; side: "buy" | "sell" }[]>([])
  const [flash, setFlash] = useState<number>(0)
  const presets = [0.1, 0.5, 1, 5]
  const danger = token.liqDistance < 15
  const isBuy = side === "buy"

  function fire() {
    setFlash(Date.now())
    const id = Date.now()
    setBursts((b) => [...b, { id, side }])
    window.setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 800)
  }

  return (
    <div className="relative rounded-lg border border-border bg-card overflow-hidden">
      <div className="grid grid-cols-2 border-b border-border">
        <button
          onClick={() => setSide("buy")}
          className={
            isBuy
              ? "py-2.5 font-display uppercase tracking-wider text-sm bg-primary text-primary-foreground"
              : "py-2.5 font-display uppercase tracking-wider text-sm bg-secondary text-muted-foreground hover:text-foreground"
          }
        >
          buy
        </button>
        <button
          onClick={() => setSide("sell")}
          className={
            !isBuy
              ? "py-2.5 font-display uppercase tracking-wider text-sm bg-destructive text-destructive-foreground"
              : "py-2.5 font-display uppercase tracking-wider text-sm bg-secondary text-muted-foreground hover:text-foreground"
          }
        >
          sell
        </button>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground mb-1.5">
            <span>amount ({isBuy ? "SOL" : `$${token.ticker}`})</span>
            <span>balance: 12.4 SOL</span>
          </div>
          <div className="relative">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="w-full h-12 rounded-md border border-border bg-input px-3 font-display text-2xl outline-none focus:border-foreground"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">
              {isBuy ? "SOL" : token.ticker}
            </span>
          </div>
          <div className="flex gap-1.5 mt-2">
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(String(p))}
                className="flex-1 py-1.5 rounded border border-border bg-secondary hover:border-foreground font-mono text-xs"
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setAmount("12.4")}
              className="flex-1 py-1.5 rounded border border-foreground bg-foreground text-background font-mono text-xs font-bold"
            >
              max
            </button>
          </div>
        </div>

        <div className="rounded-md border border-border bg-secondary/30 p-3 space-y-1.5 font-mono text-[11px]">
          <Row
            label="leverage"
            value={`${token.leverage}x ${token.direction}`}
            valueClass={token.direction === "LONG" ? "text-primary" : "text-destructive"}
          />
          <Row label="underlying" value={token.underlying} />
          <Row label="entry price" value="$0.00342" />
          <Row label="slippage" value="1.0%" />
          <Row label="trade fee" value="0.5%" />
          <Row
            label="liq @ underlying"
            value={`$${(158 * (token.direction === "LONG" ? 1 - 0.01 * token.liqDistance : 1 + 0.01 * token.liqDistance)).toFixed(2)}`}
            valueClass={danger ? "text-destructive font-bold" : "text-foreground"}
          />
        </div>

        {danger && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-2.5 text-[11px] font-mono text-destructive">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>
              this token is <b>{token.liqDistance}%</b> from liquidation. one bad move and the token goes to{" "}
              <b>zero</b>.
            </span>
          </div>
        )}

        <div className="relative">
          <motion.button
            onClick={fire}
            whileTap={{ scale: 0.97 }}
            animate={
              flash
                ? {
                    backgroundColor: [
                      "hsl(var(--background))",
                      isBuy ? "hsl(var(--primary))" : "hsl(var(--destructive))",
                      isBuy ? "hsl(var(--primary))" : "hsl(var(--destructive))",
                    ],
                  }
                : {}
            }
            transition={{ duration: 0.3 }}
            className={
              isBuy
                ? "w-full h-11 rounded-md bg-primary text-primary-foreground font-display uppercase tracking-wide text-base hover:brightness-110"
                : "w-full h-11 rounded-md bg-destructive text-destructive-foreground font-display uppercase tracking-wide text-base hover:brightness-110"
            }
          >
            {isBuy ? `[ ape ${amount || "0"} sol ]` : "[ dump bags ]"}
          </motion.button>

          {/* burst particles */}
          <AnimatePresence>
            {bursts.map((b) => (
              <Burst key={b.id} side={b.side} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function Burst({ side }: { side: "buy" | "sell" }) {
  const color = side === "buy" ? "hsl(var(--primary))" : "hsl(var(--destructive))"
  const N = 12
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center">
      {Array.from({ length: N }).map((_, i) => {
        const angle = (i / N) * Math.PI * 2
        const dx = Math.cos(angle) * (60 + Math.random() * 30)
        const dy = Math.sin(angle) * (60 + Math.random() * 30)
        return (
          <motion.span
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: dx, y: dy, opacity: 0, scale: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="absolute h-1.5 w-1.5"
            style={{ background: color }}
          />
        )
      })}
    </div>
  )
}

function Row({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground uppercase tracking-wider text-[10px]">{label}</span>
      <span className={valueClass ?? "text-foreground"}>{value}</span>
    </div>
  )
}
