"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"

type Reply = { id: string; user: string; ago: string; text: string; likes: number; pnl?: number }
type Transaction = { id: string; side: "BUY" | "SELL"; user: string; sol: number; ago: string }

const threadSeed: Reply[] = [
  { id: "r1", user: "9xQe", ago: "12s", text: "this is the one. aping with conviction.", likes: 24, pnl: 1820 },
  { id: "r2", user: "Hk2p", ago: "48s", text: "liq looks tight, careful out there", likes: 11, pnl: -240 },
  { id: "r3", user: "Zx81", ago: "2m", text: "creator has a clean track record. trusted.", likes: 33, pnl: 4200 },
  { id: "r4", user: "Mn4q", ago: "6m", text: "5x long sol nothing more bullish than that", likes: 18, pnl: 612 },
  { id: "r5", user: "Pl9k", ago: "12m", text: "if this graduates we eating", likes: 41, pnl: -88 },
]

const txSeed: Transaction[] = [
  { id: "tx1", side: "BUY", user: "9xQe", sol: 2.4, ago: "2s" },
  { id: "tx2", side: "BUY", user: "Hk2p", sol: 1.8, ago: "5s" },
  { id: "tx3", side: "SELL", user: "Zx81", sol: 0.6, ago: "8s" },
  { id: "tx4", side: "BUY", user: "Mn4q", sol: 3.2, ago: "11s" },
  { id: "tx5", side: "BUY", user: "Pl9k", sol: 1.1, ago: "15s" },
  { id: "tx6", side: "SELL", user: "Ty3w", sol: 2.7, ago: "19s" },
  { id: "tx7", side: "BUY", user: "Qa8r", sol: 0.9, ago: "22s" },
  { id: "tx8", side: "BUY", user: "Vb2x", sol: 1.5, ago: "28s" },
]

const colors = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "#ff66c4",
  "#ffd400",
  "#62d4ff",
]

function avatarColor(user: string) {
  let h = 0
  for (let i = 0; i < user.length; i++) h = (h * 31 + user.charCodeAt(i)) >>> 0
  return colors[h % colors.length]
}

export function ThreadSection({ ticker, replies }: { ticker: string; replies: number }) {
  const [tab, setTab] = useState<"threads" | "txs">("threads")
  const [text, setText] = useState("")
  const [threads, setThreads] = useState<Reply[]>(threadSeed)
  const [txs, setTxs] = useState<Transaction[]>(txSeed)
  const [liked, setLiked] = useState<Record<string, boolean>>({})

  function post() {
    if (!text.trim()) return
    setThreads((l) => [
      { id: "r" + Date.now(), user: "you", ago: "now", text, likes: 0 },
      ...l,
    ])
    setText("")
  }

  function like(id: string) {
    setLiked((s) => ({ ...s, [id]: !s[id] }))
    setThreads((l) => l.map((r) => (r.id === id ? { ...r, likes: r.likes + (liked[id] ? -1 : 1) } : r)))
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Header with tabs */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTab("threads")}
            className={`font-display uppercase text-sm transition-colors ${
              tab === "threads"
                ? "text-foreground border-b-2 border-primary pb-1"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            threads
          </button>
          <button
            onClick={() => setTab("txs")}
            className={`font-display uppercase text-sm transition-colors ${
              tab === "txs"
                ? "text-foreground border-b-2 border-primary pb-1"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            transactions
          </button>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">
          {tab === "threads" ? `${replies} replies` : `${txs.length} trades`}
        </span>
      </div>

      {/* Threads tab */}
      {tab === "threads" && (
        <>
          <div className="p-3 border-b border-border">
            <div className="flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && post()}
                placeholder="post a reply"
                className="flex-1 h-10 rounded-md border border-border bg-input px-3 font-mono text-sm outline-none focus:border-foreground"
              />
              <button
                onClick={post}
                className="h-10 px-4 rounded-md bg-primary text-primary-foreground font-display uppercase tracking-wide text-sm hover:brightness-110"
              >
                post
              </button>
            </div>
          </div>

          <ul>
            <AnimatePresence initial={false}>
              {threads.map((r) => (
                <motion.li
                  key={r.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="px-4 py-3 border-t border-border first:border-t-0 hover:bg-secondary/20"
                >
                  <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                    <span
                      className="grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold text-background"
                      style={{ background: avatarColor(r.user) }}
                    >
                      {r.user[0].toUpperCase()}
                    </span>
                    <Link href={`/user/${r.user}`} className="text-foreground font-bold hover:text-primary">
                      {r.user}
                    </Link>
                    {typeof r.pnl === "number" && (
                      <span
                        className={
                          r.pnl >= 0
                            ? "border border-primary/40 bg-primary/10 px-1 text-primary text-[10px] font-bold"
                            : "border border-destructive/40 bg-destructive/10 px-1 text-destructive text-[10px] font-bold"
                        }
                      >
                        {r.pnl >= 0 ? "+" : ""}
                        {r.pnl}$ pnl
                      </span>
                    )}
                    <span>·</span>
                    <span>{r.ago}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-foreground">{r.text}</p>
                  <button
                    onClick={() => like(r.id)}
                    className={
                      liked[r.id]
                        ? "mt-1.5 inline-flex items-center gap-1 font-mono text-[11px] text-primary font-bold"
                        : "mt-1.5 inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-foreground"
                    }
                  >
                    {liked[r.id] ? "<3" : "♡"} {r.likes}
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </>
      )}

      {/* Transactions tab */}
      {tab === "txs" && (
        <ul>
          <AnimatePresence initial={false}>
            {txs.map((tx) => (
              <motion.li
                key={tx.id}
                layout
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                className="px-4 py-2.5 border-t border-border first:border-t-0 hover:bg-secondary/20"
              >
                <div className="flex items-center justify-between font-mono text-sm">
                  <div className="flex items-center gap-3">
                    <span
                      className="grid h-5 w-5 place-items-center rounded-full text-[9px] font-bold text-background"
                      style={{ background: avatarColor(tx.user) }}
                    >
                      {tx.user[0].toUpperCase()}
                    </span>
                    <Link href={`/user/${tx.user}`} className="text-foreground hover:text-primary">
                      {tx.user}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span
                      className={`font-bold uppercase tracking-wide ${
                        tx.side === "BUY" ? "text-primary" : "text-destructive"
                      }`}
                    >
                      {tx.side === "BUY" ? "+ buy" : "- sell"}
                    </span>
                    <span className="text-foreground font-bold">{tx.sol} SOL</span>
                    <span className="text-muted-foreground">{tx.ago}</span>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  )
}
