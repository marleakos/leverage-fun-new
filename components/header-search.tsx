"use client"

import { useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { tokens } from "@/lib/mock-data"

export function HeaderSearch() {
  const [q, setQ] = useState("")
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const results = useMemo(() => {
    if (!q.trim()) return []
    const v = q.toLowerCase()
    return tokens
      .filter((t) => t.ticker.toLowerCase().includes(v) || t.name.toLowerCase().includes(v))
      .slice(0, 6)
  }, [q])

  return (
    <div ref={ref} className="relative hidden lg:block" onBlur={(e) => {
      if (!ref.current?.contains(e.relatedTarget as Node)) setOpen(false)
    }}>
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder="search ticker / contract"
        className="h-8 w-64 rounded border border-border bg-input pl-8 pr-3 text-xs font-mono outline-none focus:border-primary"
      />
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded border border-border bg-card shadow-lg overflow-hidden">
          {results.map((t) => (
            <Link
              key={t.id}
              href={`/token/${t.id}`}
              onClick={() => { setOpen(false); setQ("") }}
              className="flex items-center gap-2 px-3 py-2 text-xs font-mono hover:bg-secondary"
            >
              <span className="text-lg">{t.emoji}</span>
              <span className="font-display uppercase">${t.ticker}</span>
              <span className="text-muted-foreground truncate">{t.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
