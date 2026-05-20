import { Header } from "@/components/header"
import { TradesTicker } from "@/components/trades-ticker"
import { LiveBoard } from "@/components/live-board"
import { tokens } from "@/lib/mock-data"

export default function Page() {
  const koth = tokens[0]
  const rest = tokens.slice(1)
  return (
    <main className="min-h-screen text-foreground">
      <Header />
      <TradesTicker />
      <div className="mx-auto max-w-[1400px] px-4">
        <LiveBoard initial={rest} koth={koth} />
      </div>
      <footer className="border-t border-border mt-16 py-6">
        <div className="mx-auto max-w-[1400px] px-4 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
          <span>leverage.fun · not financial advice · you will get rekt</span>
          <span>built on solana · perps by drift · oracle by pyth</span>
        </div>
      </footer>
    </main>
  )
}
