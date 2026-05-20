import Link from "next/link"
import { Header } from "@/components/header"
import { TradesTicker } from "@/components/trades-ticker"
import { traders } from "@/lib/extra-data"
import { tokens } from "@/lib/mock-data"
import { Trophy, Crown, Medal, ExternalLink } from "lucide-react"

export default function LeaderboardPage() {
  const topTokens = [...tokens].sort((a, b) => b.marketCap - a.marketCap).slice(0, 5)
  const top3 = traders.slice(0, 3)

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Header />
      <TradesTicker />

      <main className="mx-auto max-w-[1400px] px-4 py-8">
        {/* Hero */}
        <div className="relative rounded-2xl border-2 border-accent/50 bg-card overflow-hidden mb-6">
          <div className="absolute inset-0 halftone opacity-20 pointer-events-none" style={{ filter: "hue-rotate(-50deg)" }} />
          <div className="relative p-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-accent bg-accent/10 text-accent font-mono text-[11px] uppercase tracking-widest mb-3">
              <Trophy className="h-3 w-3" /> updated every 30s
            </div>
            <h1 className="font-display text-4xl md:text-6xl uppercase leading-none">
              the <span className="rainbow-text">degens</span> hall of fame
            </h1>
            <p className="mt-2 text-sm text-muted-foreground font-mono max-w-xl">
              top traders ranked by realized PnL across all leveraged meme tokens. season 1.
            </p>
          </div>
        </div>

        {/* Podium — 2 / 1 / 3 visual order */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 items-end">
          {[top3[1], top3[0], top3[2]].filter(Boolean).map((t) => {
            const isFirst = t.rank === 1
            const isSecond = t.rank === 2
            return (
              <div
                key={t.user}
                className={
                  isFirst
                    ? "rainbow-border rounded-xl md:scale-105"
                    : "rounded-xl border-2 border-border bg-card relative overflow-hidden"
                }
              >
                <div className={isFirst ? "rounded-xl bg-card relative overflow-hidden" : "relative"}>
                  <div className={isFirst ? "absolute inset-0 halftone opacity-30 pointer-events-none" : "absolute inset-0 stripes opacity-10 pointer-events-none"} />
                  <div className="relative p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {isFirst ? (
                          <Crown className="h-6 w-6 text-accent animate-wobble" />
                        ) : (
                          <Medal className={isSecond ? "h-5 w-5 text-foreground" : "h-5 w-5 text-muted-foreground"} />
                        )}
                        <span className={isFirst ? "font-display text-2xl text-accent" : "font-display text-xl"}>
                          #{t.rank}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-muted-foreground">{t.trades} trades</span>
                    </div>
                    <div className="font-mono text-base font-bold truncate">
                      <Link href={`/user/${t.user}`} className="hover:text-primary">
                        {t.user}
                      </Link>
                    </div>
                    <a
                      href={`https://solscan.io/account/${t.user}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground hover:text-primary"
                    >
                      solscan <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                    <div className={isFirst ? "mt-1 font-display text-4xl text-primary" : "mt-1 font-display text-2xl text-primary"}>
                      +${(t.pnl / 1000).toFixed(1)}k
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-[11px]">
                      <Mini label="vol" value={`$${(t.volume / 1e6).toFixed(2)}M`} />
                      <Mini label="winrate" value={`${t.winRate}%`} />
                      <Mini label="liqs" value={String(t.liquidations)} tone="destructive" />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* Full table */}
          <section className="rounded-xl border-2 border-border bg-card overflow-hidden">
            <div className="px-4 py-2.5 border-b-2 border-border font-display uppercase text-sm bg-secondary/40">all traders</div>
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-xs">
                <thead className="text-muted-foreground bg-background/40">
                  <tr className="text-left">
                    <th className="px-4 py-2 font-normal uppercase tracking-wider text-[10px]">#</th>
                    <th className="px-4 py-2 font-normal uppercase tracking-wider text-[10px]">trader</th>
                    <th className="px-4 py-2 font-normal uppercase tracking-wider text-[10px]">pnl</th>
                    <th className="px-4 py-2 font-normal uppercase tracking-wider text-[10px]">volume</th>
                    <th className="px-4 py-2 font-normal uppercase tracking-wider text-[10px]">trades</th>
                    <th className="px-4 py-2 font-normal uppercase tracking-wider text-[10px]">winrate</th>
                    <th className="px-4 py-2 font-normal uppercase tracking-wider text-[10px]">liqs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {traders.map((t) => (
                    <tr key={t.user} className="hover:bg-secondary/40">
                      <td className="px-4 py-2.5 text-muted-foreground font-display">{t.rank}</td>
                      <td className="px-4 py-2.5">
                        <Link href={`/user/${t.user}`} className="font-bold hover:text-primary">
                          {t.user}
                        </Link>
                        <a
                          href={`https://solscan.io/account/${t.user}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 inline-flex items-center text-muted-foreground hover:text-primary"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                      <td className="px-4 py-2.5 text-primary font-display">+${(t.pnl / 1000).toFixed(1)}k</td>
                      <td className="px-4 py-2.5 text-foreground">${(t.volume / 1000).toFixed(0)}k</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{t.trades}</td>
                      <td className="px-4 py-2.5">{t.winRate}%</td>
                      <td className="px-4 py-2.5 text-destructive">{t.liquidations}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Side panel: top tokens */}
          <aside className="rounded-xl border-2 border-border bg-card overflow-hidden self-start">
            <div className="px-4 py-2.5 border-b-2 border-border font-display uppercase text-sm bg-secondary/40">top tokens by mcap</div>
            <ul className="divide-y divide-border">
              {topTokens.map((tk, i) => (
                <li key={tk.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="font-display text-lg text-muted-foreground w-6">{i + 1}</span>
                  <span className="text-2xl">{tk.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-sm uppercase truncate">${tk.ticker}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {tk.leverage}x {tk.direction} · {tk.underlying}
                    </div>
                  </div>
                  <div className="font-display text-sm text-accent">
                    ${(tk.marketCap / 1000).toFixed(1)}k
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </main>
    </div>
  )
}

function Mini({ label, value, tone }: { label: string; value: string; tone?: "destructive" }) {
  return (
    <div className="rounded border border-border/70 bg-background/60 px-2 py-1">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={tone === "destructive" ? "font-bold text-destructive" : "font-bold text-foreground"}>
        {value}
      </div>
    </div>
  )
}
