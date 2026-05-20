import { notFound } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { TradesTicker } from "@/components/trades-ticker"
import { TokenChart } from "@/components/token-chart"
import { TradePanel } from "@/components/trade-panel"
import { ThreadSection } from "@/components/thread-section"
import { TokenRuggedGate } from "@/components/token-rugged-gate"
import { tokens } from "@/lib/mock-data"
import { ArrowLeft, Copy, Twitter, Globe, Send, Skull } from "lucide-react"

export default async function TokenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const token = tokens.find((t) => t.id === id)
  if (!token) notFound()

  const positive = token.change24h >= 0
  const danger = token.liqDistance < 15
  const GRAD = 69000
  const progress = Math.min(100, (token.marketCap / GRAD) * 100)

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Header />
      <TradesTicker />

      <main className="mx-auto max-w-[1400px] px-3 py-4 md:px-4 md:py-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="h-3 w-3" /> back
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-3">
          <div className="space-y-3">
            {/* Token header */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="flex gap-3 p-3 md:p-4">
                <div className="relative grid h-16 w-16 md:h-24 md:w-24 shrink-0 place-items-center rounded-md bg-secondary text-3xl md:text-5xl">
                  {token.emoji}
                </div>

                <div className="flex-1 flex flex-col gap-1.5 md:gap-2 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h1 className="font-display text-xl md:text-3xl leading-none uppercase">{token.name}</h1>
                    <span className="font-mono text-xs text-muted-foreground">${token.ticker}</span>
                    <span className="rounded border border-primary/40 bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-primary">
                      {token.leverage}x {token.direction.toLowerCase()}
                    </span>
                    <span className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-muted-foreground">
                      {token.underlying}
                    </span>
                    {danger && (
                      <span className="inline-flex items-center gap-1 rounded border border-destructive/40 bg-destructive/15 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-destructive">
                        <Skull className="h-3 w-3" /> near liq · {token.liqDistance}%
                      </span>
                    )}
                  </div>

                  <p className="text-xs md:text-sm text-foreground/80 max-w-2xl leading-relaxed line-clamp-2 md:line-clamp-none">{token.description}</p>

                  <div className="flex items-center gap-2 font-mono text-[10px] md:text-[11px] text-muted-foreground flex-wrap">
                    <button className="inline-flex items-center gap-1 rounded border border-border bg-secondary px-2 py-0.5 hover:border-foreground">
                      <Copy className="h-3 w-3" /> 7Hk29...mP3qr
                    </button>
                    <a
                      href="https://solscan.io/token/7Hk29mP3qr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded border border-border bg-secondary px-2 py-0.5 hover:border-foreground hover:text-primary"
                    >
                      solscan <span className="text-[10px]">↗</span>
                    </a>
                    <span>by <Link href={`/user/${token.creator.split("...")[0]}`} className="text-foreground hover:text-primary">{token.creator}</Link></span>
                    <a href="#" className="hover:text-foreground"><Twitter className="h-3 w-3" /></a>
                    <a href="#" className="hover:text-foreground"><Send className="h-3 w-3" /></a>
                    <a href="#" className="hover:text-foreground"><Globe className="h-3 w-3" /></a>
                  </div>
                </div>
              </div>

              {/* stat strip — 2 cols on mobile, 4 on sm+ */}
              <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-border">
                <Stat label="price" value="$0.0034" />
                <Stat
                  label="24h"
                  value={`${positive ? "+" : ""}${token.change24h.toFixed(1)}%`}
                  accent={positive ? "primary" : "destructive"}
                />
                <Stat label="mcap" value={`$${formatK(token.marketCap)}`} />
                <Stat
                  label="liq dist"
                  value={`${token.liqDistance}%`}
                  accent={danger ? "destructive" : undefined}
                />
              </div>

              {/* graduation strip */}
              <div className="px-3 md:px-4 py-2 border-t border-border bg-secondary/20">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider mb-1.5">
                  <span className="text-muted-foreground">graduation</span>
                  <span className="text-primary font-bold">
                    {progress.toFixed(0)}% · ${formatK(token.marketCap)} / $69k
                  </span>
                </div>
                <div className="relative h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                  <div className="absolute left-0 top-0 h-full bg-primary" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>

            <TokenRuggedGate
              id={token.id}
              ticker={token.ticker}
              leverage={token.leverage}
              direction={token.direction}
            >
              <TokenChart ticker={token.ticker} underlying={token.underlying} />
            </TokenRuggedGate>

            <ThreadSection ticker={token.ticker} replies={token.replies} />
          </div>

          <aside className="space-y-3">
            <TradePanel token={token} />
            <HoldersList />
          </aside>
        </div>
      </main>
    </div>
  )
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: "primary" | "destructive"
}) {
  return (
    <div className="px-3 py-2 border-r border-border last:border-r-0">
      <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={
          accent === "primary"
            ? "font-display text-base text-primary"
            : accent === "destructive"
              ? "font-display text-base text-destructive"
              : "font-display text-base text-foreground"
        }
      >
        {value}
      </div>
    </div>
  )
}

function HoldersList() {
  const holders = [
    { addr: "9xQe...4Rk", pct: 12.4, isCreator: true, pnl: 4820 },
    { addr: "Hk2p...9Lm", pct: 6.8, pnl: 1840 },
    { addr: "Zx81...2Ap", pct: 4.2, pnl: -240 },
    { addr: "Mn4q...7Vc", pct: 3.1, pnl: 612 },
    { addr: "Pl9k...3Nb", pct: 2.7, pnl: -88 },
    { addr: "Ty3w...8Df", pct: 2.0, pnl: 420 },
    { addr: "Qa8r...1Ws", pct: 1.6, pnl: 144 },
    { addr: "Vb2x...5Hg", pct: 1.2, pnl: -56 },
  ]
  const max = Math.max(...holders.map((h) => h.pct))

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="px-3 py-2 border-b border-border font-display text-xs uppercase tracking-wider">
        top holders
      </div>
      <ul>
        {holders.map((h, i) => (
          <li
            key={h.addr}
            className="relative px-3 py-2 border-t border-border first:border-t-0 font-mono text-xs overflow-hidden"
          >
            <div
              className="absolute inset-y-0 left-0 bg-primary/10 pointer-events-none"
              style={{ width: `${(h.pct / max) * 100}%` }}
            />
            <div className="relative flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="text-muted-foreground w-4">{i + 1}</span>
                <Link href={`/user/${h.addr.split("...")[0]}`} className="hover:text-primary">
                  {h.addr}
                </Link>
                <a
                  href={`https://solscan.io/account/${h.addr}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  <span className="text-[9px]">↗</span>
                </a>
                {h.isCreator && (
                  <span className="text-[9px] px-1 rounded border border-primary/40 bg-primary/15 text-primary font-bold uppercase">
                    dev
                  </span>
                )}
              </span>
              <span className="flex items-center gap-2">
                <span className={h.pnl >= 0 ? "text-primary text-[10px] font-bold" : "text-destructive text-[10px] font-bold"}>
                  {h.pnl >= 0 ? "+" : ""}
                  {h.pnl}$
                </span>
                <span className="text-foreground font-bold">{h.pct.toFixed(1)}%</span>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function formatK(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}
