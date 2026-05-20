export function LeverageBadge({
  leverage,
  direction,
}: {
  leverage: number
  direction: "LONG" | "SHORT"
}) {
  const isLong = direction === "LONG"
  return (
    <span
      className={`inline-flex items-center gap-1 font-display text-[10px] px-2 py-0.5 rounded border-2 leading-none ${
        isLong
          ? "bg-primary text-primary-foreground border-primary-foreground/20"
          : "bg-destructive text-destructive-foreground border-destructive-foreground/20"
      }`}
    >
      <span>{leverage}x</span>
      <span className="opacity-50">/</span>
      <span>{direction}</span>
    </span>
  )
}
