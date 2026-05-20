import Link from "next/link"
import type { Token } from "@/lib/mock-data"

export function TokenCard({ token }: { token: Token }) {
  const positive = token.change24h >= 0
  return (
    <Link
      href={`/token/${token.id}`}
      className="group flex gap-3 rounded-lg border border-border bg-card p-3 hover:border-primary transition-colors"
    >
      <div className="grid h-16 w-16 md:h-20 md:w-20 shrink-0 place-items-center rounded-md bg-secondary text-3xl md:text-4xl">
        {token.emoji}
      </div>
      <div className="min-w-0 flex flex-col gap-0.5 md:gap-1">
        <div className="font-mono text-[9px] md:text-[10px] text-muted-foreground truncate">
          <span className="text-foreground">{token.creator}</span> <span className="text-primary">{ageLabel(token.ageMinutes)}</span>
        </div>
        <div className="font-mono text-[10px] md:text-[11px] text-primary">
          ${formatK(token.marketCap)}{" "}
          <span className={positive ? "text-primary" : "text-destructive"}>
            [{positive ? "+" : ""}{token.change24h.toFixed(0)}%]
          </span>
        </div>
        <div className="font-mono text-[9px] md:text-[10px] text-muted-foreground">
          replies: <span className="text-foreground">{token.replies}</span>
        </div>
        <div className="mt-auto font-mono text-[10px] md:text-[11px] truncate">
          <span className="font-display text-xs md:text-sm">{token.name}</span> <span className="text-accent">{token.leverage}x</span>
        </div>
      </div>
    </Link>
  )
}

function ageLabel(min: number) {
  if (min < 1) return "now"
  if (min < 60) return `${min}m ago`
  return `${Math.floor(min / 60)}h ago`
}

function formatK(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}
