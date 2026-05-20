"use client"

import { useState } from "react"

const SORTS = ["featured", "trending", "new", "gainers", "near liq"] as const

export function FiltersBar() {
  const [sort, setSort] = useState<string>("featured")

  return (
    <div className="my-4 flex flex-col gap-2 font-mono text-xs">
      {/* Sort pills — horizontal scroll on mobile */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
        <span className="shrink-0 text-muted-foreground mr-1">sort:</span>
        {SORTS.map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={`shrink-0 px-2.5 py-1.5 rounded font-mono text-[11px] whitespace-nowrap transition-colors ${
              sort === s
                ? "bg-primary text-primary-foreground font-bold"
                : "text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            {s}
          </button>
        ))}
        <span className="ml-auto shrink-0 flex items-center gap-1.5 text-muted-foreground pl-2">
          <span className="relative grid place-items-center h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-primary animate-ping" />
            <span className="relative h-2 w-2 rounded-full bg-primary" />
          </span>
          live
        </span>
      </div>
    </div>
  )
}
