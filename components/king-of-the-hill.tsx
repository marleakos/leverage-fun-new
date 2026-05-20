import type { Token } from "@/lib/mock-data"
import Link from "next/link"

export function KingOfTheHill({ token }: { token: Token }) {
  return (
    <section className="my-10">
      <Link
        href={`/token/${token.id}`}
        className="koth-banner relative mx-auto block max-w-3xl overflow-hidden rounded-md border-2 border-black"
        style={{ transform: "rotate(-1deg)" }}
      >
        {/* caution-tape stripes background, scrolls slowly */}
        <div className="koth-stripes absolute inset-0" aria-hidden />

        <div className="relative flex items-center gap-4 px-5 py-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-md border-2 border-black bg-background text-4xl">
            {token.emoji}
          </div>

          <div className="min-w-0 flex-1">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-black/80">
              king of the hill
            </div>
            <div className="font-display text-2xl leading-none text-black truncate">
              {token.name.toUpperCase()}{" "}
              <span className="text-black/60 text-base">${token.ticker}</span>
            </div>
            <div className="mt-1 font-mono text-xs text-black/80">
              {token.leverage}x {token.direction.toLowerCase()} {token.underlying} · ${token.marketCap.toLocaleString()} mcap
            </div>
          </div>

          <div className="hidden shrink-0 sm:block font-mono text-xs font-bold text-black bg-black/0 border-2 border-black px-3 py-2 rounded-sm">
            ape in →
          </div>
        </div>
      </Link>

      <div className="mt-8 grid place-items-center">
        <Link
          href="/create"
          className="brick inline-flex items-center rounded-md bg-primary px-6 h-12 font-display text-lg uppercase text-primary-foreground"
        >
          [ start a new coin ]
        </Link>
      </div>
    </section>
  )
}
