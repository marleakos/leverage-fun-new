import type { Token } from "@/lib/mock-data"
import { TokenCard } from "@/components/token-card"

export function TokenGrid({ tokens }: { tokens: Token[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {tokens.map((t) => (
        <TokenCard key={t.id} token={t} />
      ))}
    </div>
  )
}
