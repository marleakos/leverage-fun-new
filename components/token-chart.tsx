"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Crosshair, LineChart as LineIcon, CandlestickChart, Maximize2, ZoomIn, ZoomOut, Camera, Settings } from "lucide-react"

const ranges = ["1s", "5s", "15s", "1m", "5m", "15m", "1h", "4h", "1d"] as const
type Range = (typeof ranges)[number]
type Mode = "candles" | "line"

type Candle = { o: number; h: number; l: number; c: number; v: number; t: number }

const UP = "#22c55e"
const DOWN = "#ef4444"
const GRID = "rgba(255,255,255,0.06)"
const AXIS = "rgba(255,255,255,0.45)"

function rangeToMs(r: Range): number {
  const m: Record<Range, number> = {
    "1s": 1_000,
    "5s": 5_000,
    "15s": 15_000,
    "1m": 60_000,
    "5m": 5 * 60_000,
    "15m": 15 * 60_000,
    "1h": 60 * 60_000,
    "4h": 4 * 60 * 60_000,
    "1d": 24 * 60 * 60_000,
  }
  return m[r]
}

function makeCandles(n: number, range: Range, startMcap = 8000): Candle[] {
  const out: Candle[] = []
  let mcap = startMcap
  const intervalMs = rangeToMs(range)
  let t = Date.now() - n * intervalMs
  for (let i = 0; i < n; i++) {
    const o = mcap
    const drift = (Math.random() - 0.35) * 0.15 // mcap changes more wildly
    const c = Math.max(100, o * (1 + drift))
    const h = Math.max(o, c) * (1 + Math.random() * 0.04)
    const l = Math.min(o, c) * (1 - Math.random() * 0.04)
    const v = Math.random() * 100 + 20
    out.push({ o, h, l, c, v, t })
    mcap = c
    t += intervalMs
  }
  return out
}

function fmtMcap(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`
  return `$${v.toFixed(0)}`
}

  function fmtTime(t: number, range: Range = "1m") {
    const d = new Date(t)
    const h = d.getHours().toString().padStart(2, "0")
    const m = d.getMinutes().toString().padStart(2, "0")
    const s = d.getSeconds().toString().padStart(2, "0")
    if (range === "1s" || range === "5s") return `${m}:${s}`
    if (range === "15s") return `${h}:${m}:${s}`
    if (range === "1d" || range === "4h") {
      const mth = (d.getMonth() + 1).toString().padStart(2, "0")
      const day = d.getDate().toString().padStart(2, "0")
      return `${mth}/${day}`
    }
    return `${h}:${m}`
  }

const MIN_VISIBLE = 14
const MAX_VISIBLE = 200

function candlesForRange(range: Range): number {
  const m: Record<Range, number> = {
    "1s": 60, // ~1 minute of 1s candles
    "5s": 60, // ~5 minutes of 5s candles
    "15s": 40, // ~10 min of 15s candles
    "1m": 60, // ~1 hour of 1m candles
    "5m": 72, // ~6 hours of 5m candles
    "15m": 96, // ~1 day of 15m candles
    "1h": 168, // ~1 week of 1h candles
    "4h": 90, // ~15 days of 4h candles
    "1d": 90, // ~90 days of 1d candles
  }
  return m[range]
}

export function TokenChart({ ticker, underlying }: { ticker: string; underlying: string }) {
  const [range, setRange] = useState<Range>("1m")
  const [mode, setMode] = useState<Mode>("candles")
  const [showCrosshair, setShowCrosshair] = useState(true)
  const [showVolume, setShowVolume] = useState(true)
  
  const numCandles = useMemo(() => candlesForRange(range), [range])
  const seed = useMemo(() => makeCandles(numCandles, range), [range, numCandles])
  const [series, setSeries] = useState<Candle[]>(seed)
  const [lastTrade, setLastTrade] = useState<{ side: "BUY" | "SELL"; at: number } | null>(null)
  const [hover, setHover] = useState<number | null>(null)

  // visible window — controlled by wheel zoom and pan, starts at right edge
  const [view, setView] = useState({ start: Math.max(0, numCandles - 40), end: numCandles })
  const wrapRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ x: number; start: number; end: number } | null>(null)

  useEffect(() => {
    setSeries(seed)
    setView({ start: Math.max(0, seed.length - 40), end: seed.length })
  }, [seed])

  // live tick — update at the rate matching the timeframe
  useEffect(() => {
    let alive = true
    let timer: number
    const intervalMs = rangeToMs(range)
    const tick = () => {
      if (!alive) return
      setSeries((s) => {
        if (s.length === 0) return s
        const last = s[s.length - 1]
        const isBuy = Math.random() < 0.55
        const drift = (Math.random() - (isBuy ? 0.25 : 0.55)) * 0.05
        const o = last.c
        const c = Math.max(0.0001, o * (1 + drift))
        const h = Math.max(o, c) * (1 + Math.random() * 0.02)
        const l = Math.min(o, c) * (1 - Math.random() * 0.02)
        const v = Math.random() * 120 + 30
        if (isBuy && Math.random() < 0.35) setLastTrade({ side: "BUY", at: Date.now() })
        else if (!isBuy && Math.random() < 0.18) setLastTrade({ side: "SELL", at: Date.now() })
        const next = [...s.slice(1), { o, h, l, c, v, t: last.t + intervalMs }]
        return next
      })
      timer = window.setTimeout(tick, intervalMs)
    }
    timer = window.setTimeout(tick, intervalMs)
    return () => {
      alive = false
      window.clearTimeout(timer)
    }
  }, [range])

  const visible = useMemo(
    () => series.slice(Math.max(0, view.start), Math.max(0, view.end)),
    [series, view],
  )

  const last = series[series.length - 1]
  const first = visible[0] ?? series[0]
  const positive = last.c >= first.o

  const min = Math.min(...visible.map((c) => c.l))
  const max = Math.max(...visible.map((c) => c.h))
  const r = Math.max(1e-9, max - min)
  const padded = { min: min - r * 0.08, max: max + r * 0.08 }
  const maxV = Math.max(...visible.map((c) => c.v))

  // SVG geometry
  const W = 900
  const PRICE_H = 360
  const VOL_H = 80
  const padL = 4
  const padR = 64
  const padT = 8
  const padB = 24
  const innerW = W - padL - padR
  const innerH = PRICE_H - padT - padB
  const stepX = innerW / Math.max(1, visible.length)
  const candleW = Math.max(2.5, stepX * 0.72)

  const yScale = (v: number) =>
    padT + innerH * (1 - (v - padded.min) / (padded.max - padded.min))

  function pickIndex(clientX: number) {
    const el = wrapRef.current
    if (!el) return null
    const rect = el.getBoundingClientRect()
    const xRel = ((clientX - rect.left) / rect.width) * W - padL
    const i = Math.floor(xRel / stepX)
    return Math.max(0, Math.min(visible.length - 1, i))
  }

  // Wheel zoom: anchor on hovered candle so it stays under the cursor.
  // Must use a non-passive native listener so preventDefault() blocks page scroll.
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      setView((cur) => {
        const len = cur.end - cur.start
        const factor = e.deltaY > 0 ? 1.18 : 1 / 1.18
        let nextLen = Math.round(len * factor)
        nextLen = Math.max(MIN_VISIBLE, Math.min(numCandles, nextLen))
        if (nextLen === len) return cur

        const rect = el.getBoundingClientRect()
        const xRel = ((e.clientX - rect.left) / rect.width) * W - padL
        const idx = Math.max(0, Math.min(len - 1, Math.floor(xRel / (innerW / Math.max(1, len)))))
        const anchorAbs = cur.start + idx
        const ratio = idx / Math.max(1, len)

        let nextStart = Math.round(anchorAbs - ratio * nextLen)
        let nextEnd = nextStart + nextLen
        if (nextStart < 0) {
          nextStart = 0
          nextEnd = nextLen
        }
        if (nextEnd > series.length) {
          nextEnd = series.length
          nextStart = nextEnd - nextLen
        }
        return { start: nextStart, end: nextEnd }
      })
    }
    el.addEventListener("wheel", handler, { passive: false })
    return () => el.removeEventListener("wheel", handler)
  }, [series.length])

  function zoom(delta: number) {
    const len = view.end - view.start
    let nextLen = Math.max(MIN_VISIBLE, Math.min(MAX_VISIBLE, Math.round(len * delta)))
    let nextEnd = view.end
    let nextStart = nextEnd - nextLen
    if (nextStart < 0) {
      nextStart = 0
      nextEnd = nextLen
    }
    setView({ start: nextStart, end: nextEnd })
  }

  function resetView() {
    setView({ start: Math.max(0, series.length - 40), end: series.length })
  }

  function onMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return
    dragRef.current = { x: e.clientX, start: view.start, end: view.end }
  }
  function onMouseMove(e: React.MouseEvent) {
    setHover(pickIndex(e.clientX))
    const drag = dragRef.current
    if (!drag) return
    const el = wrapRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const dxBars = Math.round(((e.clientX - drag.x) / rect.width) * (drag.end - drag.start))
    let nextStart = drag.start - dxBars
    let nextEnd = drag.end - dxBars
    if (nextStart < 0) {
      nextStart = 0
      nextEnd = drag.end - drag.start
    }
    if (nextEnd > series.length) {
      nextEnd = series.length
      nextStart = nextEnd - (drag.end - drag.start)
    }
    setView({ start: nextStart, end: nextEnd })
  }
  function onMouseUp() {
    dragRef.current = null
  }

  // line path
  const linePath = visible
    .map((c, i) => `${i === 0 ? "M" : "L"} ${padL + i * stepX + stepX / 2} ${yScale(c.c)}`)
    .join(" ")

  const hovered = hover != null ? visible[hover] : null

  // 5 evenly-spaced time ticks
  const timeTickIdx = [0, 1, 2, 3, 4].map((i) =>
    Math.min(visible.length - 1, Math.floor((i / 4) * (Math.max(1, visible.length - 1)))),
  )

  return (
    <div className="rounded-lg border border-border bg-[#0d0d0f] overflow-hidden">
      {/* top bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-secondary/20 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="font-display text-base">${ticker}</div>
          <div className="font-mono text-[11px] text-muted-foreground">vs {underlying}</div>
          <div className="font-mono text-xs">
            <span className="text-muted-foreground">o </span>
            <span className="text-foreground">{fmtMcap(first.o)}</span>
            <span className="text-muted-foreground"> h </span>
            <span style={{ color: UP }}>{fmtMcap(max)}</span>
            <span className="text-muted-foreground"> l </span>
            <span style={{ color: DOWN }}>{fmtMcap(min)}</span>
            <span className="text-muted-foreground"> c </span>
            <span style={{ color: positive ? UP : DOWN }}>{fmtMcap(last.c)}</span>
            <span className="ml-2" style={{ color: positive ? UP : DOWN }}>
              {positive ? "+" : ""}
              {(((last.c - first.o) / first.o) * 100).toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 font-mono text-xs">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={
                r === range
                  ? "px-2 py-0.5 rounded border border-border bg-secondary text-foreground"
                  : "px-2 py-0.5 text-muted-foreground hover:text-foreground"
              }
            >
              {r}
            </button>
          ))}
        </div>
      </div>

        <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border bg-[#0a0a0c]">
          <ToolBtn
            active={mode === "candles"}
            onClick={() => setMode("candles")}
            title="candles"
          >
            <CandlestickChart className="h-3.5 w-3.5" />
          </ToolBtn>
          <ToolBtn active={mode === "line"} onClick={() => setMode("line")} title="line">
            <LineIcon className="h-3.5 w-3.5" />
          </ToolBtn>
          <Sep />
          <ToolBtn active={showCrosshair} onClick={() => setShowCrosshair((v) => !v)} title="crosshair">
            <Crosshair className="h-3.5 w-3.5" />
          </ToolBtn>
          <ToolBtn active={showVolume} onClick={() => setShowVolume((v) => !v)} title="volume">
            <span className="font-mono text-[10px] font-bold">vol</span>
          </ToolBtn>
          <Sep />
          <ToolBtn onClick={() => zoom(0.7)} title="zoom in">
            <ZoomIn className="h-3.5 w-3.5" />
          </ToolBtn>
          <ToolBtn onClick={() => zoom(1.4)} title="zoom out">
            <ZoomOut className="h-3.5 w-3.5" />
          </ToolBtn>
          <ToolBtn onClick={resetView} title="reset / fit">
            <Maximize2 className="h-3.5 w-3.5" />
          </ToolBtn>
          <Sep />
          <ToolBtn title="screenshot">
            <Camera className="h-3.5 w-3.5" />
          </ToolBtn>
          <ToolBtn title="settings">
            <Settings className="h-3.5 w-3.5" />
          </ToolBtn>
          <div className="ml-auto font-mono text-[10px] text-muted-foreground">
            {view.end - view.start} bars · scroll to zoom · drag to pan
          </div>
        </div>

      <div
        ref={wrapRef}
        className="relative bg-[#0d0d0f] select-none touch-none overscroll-contain"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={() => {
          setHover(null)
          dragRef.current = null
        }}
        style={{ cursor: dragRef.current ? "grabbing" : "crosshair" }}
      >
        <svg viewBox={`0 0 ${W} ${PRICE_H}`} className="w-full block" style={{ height: PRICE_H }}>
          {/* horizontal grid + right-gutter price labels */}
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((g) => {
            const y = padT + innerH * g
            const v = padded.max - (padded.max - padded.min) * g
            return (
              <g key={g}>
                <line x1={padL} x2={W - padR} y1={y} y2={y} stroke={GRID} />
                <text
                  x={W - padR + 6}
                  y={y + 3}
                  fontSize={10}
                  fontFamily="ui-monospace, monospace"
                  fill={AXIS}
                >
                  {fmtMcap(v)}
                </text>
              </g>
            )
          })}

          {/* vertical grid every ~10 candles */}
          {visible.map((_, i) =>
            i % 10 === 0 && i !== 0 ? (
              <line
                key={`v${i}`}
                x1={padL + i * stepX}
                x2={padL + i * stepX}
                y1={padT}
                y2={padT + innerH}
                stroke={GRID}
              />
            ) : null,
          )}

          {/* series — candles or line */}
          {mode === "candles"
            ? visible.map((c, i) => {
                const cx = padL + i * stepX + stepX / 2
                const x = cx - candleW / 2
                const up = c.c >= c.o
                const yHigh = yScale(c.h)
                const yLow = yScale(c.l)
                const yOpen = yScale(c.o)
                const yClose = yScale(c.c)
                const top = Math.min(yOpen, yClose)
                const bodyH = Math.max(1.5, Math.abs(yClose - yOpen))
                const color = up ? UP : DOWN
                return (
                  <g key={i}>
                    <line x1={cx} x2={cx} y1={yHigh} y2={yLow} stroke={color} strokeWidth={1} />
                    <rect x={x} y={top} width={candleW} height={bodyH} fill={color} />
                  </g>
                )
              })
            : (
                <>
                  <path
                    d={`${linePath} L ${padL + (visible.length - 1) * stepX + stepX / 2} ${padT + innerH} L ${padL + stepX / 2} ${padT + innerH} Z`}
                    fill={positive ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)"}
                  />
                  <path d={linePath} fill="none" stroke={positive ? UP : DOWN} strokeWidth={1.5} />
                </>
              )}

          {/* crosshair */}
          {showCrosshair && hover != null && visible[hover] && (
            <g pointerEvents="none">
              <line
                x1={padL + hover * stepX + stepX / 2}
                x2={padL + hover * stepX + stepX / 2}
                y1={padT}
                y2={padT + innerH}
                stroke={AXIS}
                strokeDasharray="3 4"
              />
              <line
                x1={padL}
                x2={W - padR}
                y1={yScale(visible[hover].c)}
                y2={yScale(visible[hover].c)}
                stroke={AXIS}
                strokeDasharray="3 4"
              />
              <rect
                x={W - padR + 1}
                y={yScale(visible[hover].c) - 9}
                width={padR - 2}
                height={18}
                fill="rgba(255,255,255,0.9)"
              />
              <text
                x={W - padR + 5}
                y={yScale(visible[hover].c) + 4}
                fontSize={11}
                fontFamily="ui-monospace, monospace"
                fontWeight={700}
                fill="#0d0d0f"
              >
                {fmtMcap(visible[hover].c)}
              </text>
            </g>
          )}

          {/* live last-price tag */}
          <g>
            <line
              x1={padL}
              x2={W - padR}
              y1={yScale(last.c)}
              y2={yScale(last.c)}
              stroke={positive ? UP : DOWN}
              strokeOpacity={0.6}
              strokeDasharray="4 4"
            />
            <rect
              x={W - padR + 1}
              y={yScale(last.c) - 9}
              width={padR - 2}
              height={18}
              fill={positive ? UP : DOWN}
            />
            <text
              x={W - padR + 5}
              y={yScale(last.c) + 4}
              fontSize={11}
              fontFamily="ui-monospace, monospace"
              fontWeight={700}
              fill="#000"
            >
              {fmtMcap(last.c)}
            </text>
          </g>

          {/* time axis */}
          <line x1={padL} x2={W - padR} y1={PRICE_H - padB} y2={PRICE_H - padB} stroke={GRID} />
          {timeTickIdx.map((i) => (
            <text
              key={`t${i}`}
              x={padL + i * stepX + stepX / 2}
              y={PRICE_H - 8}
              fontSize={10}
              textAnchor="middle"
              fontFamily="ui-monospace, monospace"
              fill={AXIS}
            >
              {visible[i] ? fmtTime(visible[i].t, range) : ""}
            </text>
          ))}
        </svg>

        {/* trade flash */}
        <AnimatePresence>
          {lastTrade && (
            <motion.div
              key={lastTrade.at}
              initial={{ opacity: 0.9, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="pointer-events-none absolute top-2 right-3 select-none"
            >
              <div
                className="rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase"
                style={{
                  color: lastTrade.side === "BUY" ? UP : DOWN,
                  borderColor: lastTrade.side === "BUY" ? UP : DOWN,
                  background:
                    lastTrade.side === "BUY" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                }}
              >
                {lastTrade.side === "BUY" ? "+ buy" : "- sell"}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* volume */}
        {showVolume && (
          <svg
            viewBox={`0 0 ${W} ${VOL_H}`}
            className="w-full block border-t border-border"
            style={{ height: VOL_H }}
          >
            <text x={padL + 4} y={12} fontSize={9} fontFamily="ui-monospace, monospace" fill={AXIS}>
              volume
            </text>
            {visible.map((c, i) => {
              const cx = padL + i * stepX + stepX / 2
              const x = cx - candleW / 2
              const up = c.c >= c.o
              const h = (VOL_H - 16) * (c.v / maxV)
              return (
                <rect
                  key={i}
                  x={x}
                  y={VOL_H - 4 - h}
                  width={candleW}
                  height={h}
                  fill={up ? UP : DOWN}
                  opacity={0.55}
                />
              )
            })}
          </svg>
        )}
      </div>

      {/* OHLC tooltip */}
      {hovered && (
        <div className="px-3 py-1.5 border-t border-border bg-secondary/20 font-mono text-[11px] flex items-center gap-3">
          <span className="text-muted-foreground">{fmtTime(hovered.t, range)}</span>
          <span className="text-muted-foreground">
            o <span className="text-foreground">{fmtMcap(hovered.o)}</span>
          </span>
          <span className="text-muted-foreground">
            h <span style={{ color: UP }}>{fmtMcap(hovered.h)}</span>
          </span>
          <span className="text-muted-foreground">
            l <span style={{ color: DOWN }}>{fmtMcap(hovered.l)}</span>
          </span>
          <span className="text-muted-foreground">
            c <span style={{ color: hovered.c >= hovered.o ? UP : DOWN }}>{fmtMcap(hovered.c)}</span>
          </span>
          <span className="text-muted-foreground">
            v <span className="text-foreground">{hovered.v.toFixed(0)}</span>
          </span>
        </div>
      )}
    </div>
  )
}

function ToolBtn({
  children,
  onClick,
  active,
  title,
}: {
  children: React.ReactNode
  onClick?: () => void
  active?: boolean
  title?: string
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={
        active
          ? "grid h-7 w-7 place-items-center rounded border border-border bg-secondary text-foreground"
          : "grid h-7 w-7 place-items-center rounded text-muted-foreground hover:text-foreground hover:bg-secondary/60"
      }
    >
      {children}
    </button>
  )
}

function Sep() {
  return <div className="mx-1 h-4 w-px bg-border" />
}
