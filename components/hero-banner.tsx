import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-2xl border-2 border-border bg-card mb-6">
      {/* halftone + stripes layered bg */}
      <div className="absolute inset-0 halftone opacity-40" />
      <div className="absolute inset-y-0 right-0 w-1/2 stripes-accent opacity-50" />
      <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-primary/30 blur-3xl" />
      <div className="absolute -bottom-10 right-10 h-40 w-40 rounded-full bg-accent/30 blur-3xl" />

      <div className="relative grid md:grid-cols-[1fr_auto] items-center gap-6 p-5 md:p-7">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-primary/40 bg-primary/10 px-2.5 py-1 mb-3">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-primary">new · leveraged launches</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl leading-[0.95] mb-3 text-balance">
            launch a <span className="text-primary">leveraged</span><br />
            meme coin in <span className="text-accent">30 seconds</span>.
          </h1>
          <p className="font-mono text-sm text-foreground/70 max-w-xl mb-4 text-pretty">
            pick a perp · pick your leverage · pick long or short. fair launch on a bonding curve, graduates to raydium at $69k. you will get rekt or you will get rich.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/create"
              className="brick inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 h-11 font-display text-sm uppercase tracking-wide hover:-translate-y-0.5 transition-transform"
            >
              start a coin <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-md border-2 border-border bg-secondary hover:border-foreground px-4 h-11 font-mono text-sm"
            >
              how it works
            </Link>
            <span className="ml-2 font-mono text-[11px] text-muted-foreground hidden sm:inline">
              0.1 SOL deploy · 0.5% trade · 1% graduation
            </span>
          </div>
        </div>

        {/* leverage chip stack */}
        <div className="hidden md:grid gap-2 font-display text-2xl">
          <div className="rotate-3 brick rounded-lg bg-primary text-primary-foreground px-4 py-2 leading-none animate-bounce-soft">2x LONG</div>
          <div className="-rotate-2 brick-accent rounded-lg bg-accent text-accent-foreground px-4 py-2 leading-none animate-bounce-soft [animation-delay:120ms]">3x LONG</div>
          <div className="rotate-1 brick rounded-lg bg-primary text-primary-foreground px-4 py-2 leading-none animate-bounce-soft [animation-delay:240ms]">5x LONG</div>
          <div className="-rotate-3 rounded-lg border-2 border-destructive bg-destructive/15 text-destructive px-4 py-2 leading-none animate-bounce-soft [animation-delay:360ms]">10x SHORT</div>
        </div>
      </div>
    </section>
  )
}
