import Link from "next/link"
import { Header } from "@/components/header"
import { TradesTicker } from "@/components/trades-ticker"
import { fees, faqs } from "@/lib/extra-data"
import { Book, Coins, ShieldAlert, Rocket, Zap, ArrowRight } from "lucide-react"

export default function DocsPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Header />
      <TradesTicker />

      <main className="mx-auto max-w-[1100px] px-4 py-10">
        {/* Hero */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-x-0 top-1/2 -z-10 h-40 -translate-y-1/2 halftone opacity-30" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border-2 border-border bg-secondary/50 font-mono text-[11px] text-muted-foreground mb-4 uppercase tracking-widest">
            <Book className="h-3.5 w-3.5 text-primary" /> docs · v0.1
          </div>
          <h1 className="font-display text-5xl md:text-7xl uppercase leading-none">
            pump.fun
            <br />
            with <span className="rainbow-text">leverage</span>.
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-foreground/70 font-mono text-pretty">
            every coin launched on leverage.fun is backed by a perp position on drift. price = underlying ×
            leverage. graduate at $69k to raydium. liquidate and the coin goes to zero. that&apos;s it.
          </p>
        </div>

        {/* How it works */}
        <section className="mb-12">
          <h2 className="font-display uppercase text-2xl mb-5 flex items-center gap-2">
            <Rocket className="h-6 w-6 text-primary" /> how it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Step n={1} title="deploy" body="creator picks a name, ticker, image, underlying perp (SOL/BTC/ETH), leverage (2/3/5x) and direction. pays 0.1 SOL." />
            <Step n={2} title="trade" body="users buy on a bonding curve. every buy adds liquidity and opens more of the backing perp on drift." />
            <Step n={3} title="track" body="price = underlying × leverage. if SOL is up 10% on a 5x long, the token is up ~50%." />
            <Step n={4} title="graduate" body="at $69k mcap the LP migrates to raydium. perp closes. token now trades like any other SPL." />
          </div>
        </section>

        {/* Example */}
        <section className="mb-12 rainbow-border rounded-xl">
          <div className="rounded-xl bg-card p-6 relative overflow-hidden">
            <div className="absolute inset-0 stripes opacity-10 pointer-events-none" />
            <div className="relative">
              <h2 className="font-display uppercase text-2xl mb-4 flex items-center gap-2">
                <Zap className="h-6 w-6 text-accent" /> example: $bull
              </h2>
              <ul className="font-mono text-sm space-y-3">
                <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" /><span><span className="text-muted-foreground">deploy:</span> $BULL — 3x SOL-PERP long</span></li>
                <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" /><span><span className="text-muted-foreground">SOL goes from $158 → $173.8 (+10%):</span> $BULL is up <span className="text-primary font-display">~30%</span></span></li>
                <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 text-destructive mt-0.5 shrink-0" /><span><span className="text-muted-foreground">SOL goes from $158 → $134.3 (-15%):</span> $BULL is down <span className="text-destructive font-display">~45%</span></span></li>
                <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 text-destructive mt-0.5 shrink-0" /><span><span className="text-muted-foreground">SOL drops &gt;33%:</span> backing perp liquidates, $BULL goes to <span className="text-destructive font-display">$0</span></span></li>
              </ul>
            </div>
          </div>
        </section>

        {/* Fees */}
        <section className="mb-12">
          <h2 className="font-display uppercase text-2xl mb-5 flex items-center gap-2">
            <Coins className="h-6 w-6 text-accent" /> fees
          </h2>
          <div className="rounded-xl border-2 border-border bg-card overflow-hidden">
            <table className="w-full font-mono text-sm">
              <thead className="text-muted-foreground bg-secondary/40 border-b-2 border-border">
                <tr className="text-left">
                  <th className="px-4 py-2.5 font-normal uppercase tracking-wider text-[10px]">type</th>
                  <th className="px-4 py-2.5 font-normal uppercase tracking-wider text-[10px]">amount</th>
                  <th className="px-4 py-2.5 font-normal uppercase tracking-wider text-[10px]">note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fees.map((f) => (
                  <tr key={f.label} className="hover:bg-secondary/40">
                    <td className="px-4 py-3 font-display uppercase">{f.label}</td>
                    <td className="px-4 py-3 text-primary font-display">{f.value}</td>
                    <td className="px-4 py-3 text-muted-foreground">{f.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Risks */}
        <section className="mb-12 rounded-xl border-2 border-destructive bg-destructive/10 p-6 relative overflow-hidden">
          <div className="absolute inset-0 stripes opacity-15 pointer-events-none" style={{ filter: "hue-rotate(-90deg)" }} />
          <div className="relative">
            <h2 className="font-display uppercase text-2xl mb-4 flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-6 w-6 animate-pulse" /> risks
            </h2>
            <ul className="font-mono text-sm space-y-2 text-foreground">
              <li className="flex items-start gap-2"><span className="text-destructive">→</span><span>leveraged tokens can go to <span className="text-destructive font-display">zero</span> if the underlying perp liquidates.</span></li>
              <li className="flex items-start gap-2"><span className="text-destructive">→</span><span>higher leverage = tighter liquidation distance. a 5x long is wiped by a 20% adverse move.</span></li>
              <li className="flex items-start gap-2"><span className="text-destructive">→</span><span>bonding-curve trades are subject to slippage; large buys move the price quickly.</span></li>
              <li className="flex items-start gap-2"><span className="text-destructive">→</span><span>smart contracts are unaudited beta. don&apos;t deposit more than you can lose.</span></li>
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="font-display uppercase text-2xl mb-5">faq</h2>
          <div className="space-y-2">
            {faqs.map((f) => (
              <details key={f.q} className="rounded-xl border-2 border-border bg-card group hover:border-primary/40">
                <summary className="cursor-pointer list-none px-4 py-3 font-mono text-sm font-bold flex items-center justify-between">
                  {f.q}
                  <span className="text-primary group-open:rotate-45 transition-transform font-display text-lg">+</span>
                </summary>
                <div className="px-4 pb-4 font-mono text-sm text-muted-foreground">{f.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* Powered by + CTA */}
        <section className="rounded-xl border-2 border-border bg-card p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 halftone opacity-20 pointer-events-none" />
          <div className="relative">
            <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">powered by</div>
            <div className="mt-3 flex items-center justify-center gap-6 font-display uppercase text-base flex-wrap">
              <span className="text-foreground">solana</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-foreground">drift</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-foreground">pyth</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-foreground">raydium</span>
            </div>
            <Link
              href="/create"
              className="brick inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-md bg-primary text-primary-foreground font-display uppercase text-base hover:-translate-y-0.5 transition-transform"
            >
              <Zap className="h-5 w-5" strokeWidth={3} />
              launch a coin
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="rounded-xl border-2 border-border bg-card p-4 relative overflow-hidden hover:border-primary/40 transition-colors">
      <div className="absolute -top-2 -right-2 font-display text-7xl text-primary/10 leading-none select-none pointer-events-none">
        0{n}
      </div>
      <div className="relative grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground font-display text-sm">
        {n}
      </div>
      <h3 className="relative mt-3 font-display uppercase text-base">{title}</h3>
      <p className="relative mt-1 font-mono text-xs text-muted-foreground leading-relaxed">{body}</p>
    </div>
  )
}
