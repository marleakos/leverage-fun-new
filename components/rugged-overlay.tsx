"use client"

import { motion } from "motion/react"

export function RuggedOverlay({
  size = "lg",
  subtitle = "Thanks for playing",
}: {
  size?: "sm" | "md" | "lg" | "xl"
  subtitle?: string
}) {
  const sizes = {
    sm: "text-5xl",
    md: "text-7xl",
    lg: "text-[120px]",
    xl: "text-[200px]",
  }
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center overflow-hidden">
      <motion.div
        initial={{ scale: 1.6, opacity: 0, rotate: -12 }}
        animate={{ scale: 1, opacity: 1, rotate: -12 }}
        transition={{ type: "spring", stiffness: 220, damping: 14 }}
        className="grid place-items-center"
      >
        <div
          className={`font-display italic leading-none tracking-tight text-destructive/60 ${sizes[size]} select-none whitespace-nowrap`}
          style={{ WebkitTextStroke: "1px rgba(0,0,0,0.2)" }}
        >
          Rugged!
        </div>
        {subtitle && (
          <div className="mt-4 font-display text-base sm:text-xl text-foreground/90 not-italic" style={{ transform: "rotate(0deg)" }}>
            {subtitle}
          </div>
        )}
      </motion.div>
    </div>
  )
}
