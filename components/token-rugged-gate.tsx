"use client"

import type { ReactNode } from "react"
import { useRugged } from "@/lib/rugged-store"
import { RuggedOverlay } from "@/components/rugged-overlay"

export function TokenRuggedGate({
  id,
  ticker,
  leverage,
  direction,
  children,
}: {
  id: string
  ticker: string
  leverage: number
  direction: "LONG" | "SHORT"
  children: ReactNode
}) {
  const rugged = useRugged()
  const isRugged = !!rugged[id]

  return (
    <div className="relative">
      <div className={isRugged ? "pointer-events-none" : ""}>
        {children}
      </div>
      {isRugged && (
        <>
          <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] pointer-events-none" />
          <RuggedOverlay size="lg" subtitle={`${leverage}x ${direction.toLowerCase()} liquidated · thanks for playing`} />
          <div className="absolute top-3 left-3 px-2 py-1 font-mono text-[10px] uppercase tracking-wider bg-destructive text-destructive-foreground">
            ${ticker} · liquidated
          </div>
        </>
      )}
    </div>
  )
}
