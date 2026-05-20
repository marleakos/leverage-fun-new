"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { TradesTicker } from "@/components/trades-ticker"
import { Rocket, TrendingUp, BarChart3, GraduationCap, Zap, ChevronDown, ChevronUp, ShieldAlert } from "lucide-react"
import Link from "next/link"

const FAQS = [
  {
    q: "what is a leveraged meme token?",
    a: "A leveraged meme token tracks a reference asset (like SOL, BTC, ETH) with 2x-10x leverage. Unlike perp trading, there's no liquidation risk - the price just moves with leverage."
  },
  {
    q: "how does graduation work?",
    a: "When a token reaches 69 SOL raised in the bonding curve, it graduates to Raydium AMM. The liquidity pool is created and trading continues on the open market."
  },
  {
    q: "what are tiered leverage fees?",
    a: "Leverage fees are tiered based on leverage level: 2x = 0.1%, 3x = 0.2%, 5x = 0.3%, 10x = 0.5%. This is added to the 0.5% trading fee."
  },
  {
    q: "long vs short tokens?",
    a: "Long tokens go up when the reference asset goes up. Short tokens go up when the reference asset goes down. Both have amplified moves based on leverage."
  },
  {
    q: "where does the price come from?",
    a: "Prices are sourced from Pyth Network oracles, which aggregate data from multiple exchanges for accurate, manipulation-resistant pricing."
  }
]

export default function HowToPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Header />
      <TradesTicker />

      <main className="mx-auto max-w-[1000px] px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="font-display text-5xl md:text-7xl uppercase leading-none mb-2">
            LEVERAGE.FUN
          </h1>
          <h2 className="font-display text-4xl md:text-6xl uppercase leading-none">
            WITH <span className="rainbow-text">LEVERAGE.</span>
          </h2>
          <p className="mt-6 text-sm text-muted-foreground font-mono max-w-2xl mx-auto">
            every coin launched on leverage.fun tracks a reference asset (SOL, BTC, ETH, etc.) with 2x-10x leverage. 
            no liquidation risk — price just moves with leverage. graduate at 69 SOL to raydium.
          </p>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Rocket className="h-5 w-5 text-primary" />
            <h3 className="font-display text-xl uppercase">HOW IT WORKS</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StepCard 
              num="1" 
              title="DEPLOY" 
              desc="creator picks a name, ticker, image, reference asset (SOL/BTC/ETH/etc.), leverage (2x-10x) and direction. pays 0.15 SOL."
            />
            <StepCard 
              num="2" 
              title="TRADE" 
              desc="users buy on a bonding curve. every buy adds liquidity. price moves based on oracle price × leverage."
            />
            <StepCard 
              num="3" 
              title="TRACK" 
              desc="price = base_price × (1 + leverage × oracle_change). if SOL is up 10% on a 5x long, the token is up ~50%."
            />
            <StepCard 
              num="4" 
              title="GRADUATE" 
              desc="at 69 SOL raised the LP migrates to raydium. token now trades like any other SPL with leverage price action."
            />
          </div>
        </div>

        {/* Example */}
        <div className="mb-16 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-primary" />
            <h3 className="font-display text-xl uppercase">EXAMPLE: $BULL</h3>
          </div>
          
          <div className="space-y-3 font-mono text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-primary">→</span>
              <span>deploy: $BULL — 3x SOL long</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary">→</span>
              <span className="text-muted-foreground">SOL goes from $158 → $173.8 (+10%):</span>
              <span className="text-primary font-bold">$BULL is up +30%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary">→</span>
              <span className="text-muted-foreground">SOL goes from $158 → $134.3 (-15%):</span>
              <span className="text-destructive font-bold">$BULL is down -45%</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-primary">→</span>
              <span>no liquidation: even if SOL drops 50%, $BULL still has value — just down 150% from entry</span>
            </div>
          </div>
        </div>

        {/* Fees Table */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-display text-xl uppercase">FEES</h3>
          </div>
          
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-secondary/40 border-b border-border">
                <tr className="font-mono text-[10px] uppercase text-muted-foreground">
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Amount</th>
                  <th className="text-left px-4 py-3">Note</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                <tr className="border-b border-border">
                  <td className="px-4 py-3 font-bold">DEPLOY TOKEN</td>
                  <td className="px-4 py-3 text-primary font-bold">0.15 SOL</td>
                  <td className="px-4 py-3 text-muted-foreground">one-time, paid by creator</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-3 font-bold">TRADING FEE</td>
                  <td className="px-4 py-3 text-primary font-bold">0.5%</td>
                  <td className="px-4 py-3 text-muted-foreground">every buy / sell on the bonding curve</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-3 font-bold">LEVERAGE FEE</td>
                  <td className="px-4 py-3 text-primary font-bold">0.1% - 0.5%</td>
                  <td className="px-4 py-3 text-muted-foreground">tiered by leverage (2x=0.1%, 10x=0.5%)</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-3 font-bold">GRADUATION FEE</td>
                  <td className="px-4 py-3 text-primary font-bold">1% OF LP</td>
                  <td className="px-4 py-3 text-muted-foreground">at 69 SOL, migrates to Raydium</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold">REFERRAL BONUS</td>
                  <td className="px-4 py-3 text-primary font-bold">10%</td>
                  <td className="px-4 py-3 text-muted-foreground">of protocol fees go to referrer</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* No Liquidation Risk */}
        <div className="mb-16 rounded-xl border-2 border-pink-500/50 bg-pink-500/10 p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="h-5 w-5 text-pink-500" />
            <h3 className="font-display text-xl uppercase text-pink-500">NO LIQUIDATION RISK</h3>
          </div>
          
          <div className="space-y-2 font-mono text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="text-pink-500">→</span>
              <span>unlike perp trading, these tokens <span className="text-pink-500 font-bold">CANNOT LIQUIDATE</span>. your position is safe.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-pink-500">→</span>
              <span>price can go to near-zero but never actually hits zero from liquidation.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-pink-500">→</span>
              <span>you can always sell your tokens back to the curve (even at a loss).</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-pink-500">→</span>
              <span>this is the leverage.fun model — pure leverage without the liquidation risk.</span>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h3 className="font-display text-xl uppercase mb-6">FAQ</h3>
          
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-lg border border-border bg-card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 font-mono text-sm hover:bg-secondary/40 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="h-4 w-4 text-primary" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-primary" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 font-mono text-xs text-muted-foreground">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Powered By */}
        <div className="text-center mb-8">
          <p className="font-mono text-[10px] uppercase text-muted-foreground mb-2">POWERED BY</p>
          <div className="flex items-center justify-center gap-4 font-display text-sm">
            <span>SOLANA</span>
            <span className="text-muted-foreground">·</span>
            <span>PYTH</span>
            <span className="text-muted-foreground">·</span>
            <span>RAYDIUM</span>
          </div>
        </div>

        {/* Launch Button */}
        <div className="flex justify-center">
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-md bg-primary text-primary-foreground font-display uppercase tracking-wide text-lg hover:opacity-90 transition-opacity"
          >
            <Zap className="h-5 w-5" />
            LAUNCH A COIN
          </Link>
        </div>
      </main>
    </div>
  )
}

function StepCard({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 font-display text-6xl text-foreground/[0.04] leading-none pr-2 pt-1 select-none pointer-events-none">
        0{num}
      </div>
      <div className="flex items-center gap-2 mb-3">
        <div className="h-6 w-6 rounded bg-primary flex items-center justify-center font-display text-xs text-primary-foreground">
          {num}
        </div>
        <h4 className="font-display text-sm uppercase">{title}</h4>
      </div>
      <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">
        {desc}
      </p>
    </div>
  )
}
