import { Header } from "@/components/header"
import { TradesTicker } from "@/components/trades-ticker"
import { LiqArena } from "@/components/liq-arena"

export default function LiqArenaPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Header />
      <TradesTicker />
      <LiqArena />
    </div>
  )
}
