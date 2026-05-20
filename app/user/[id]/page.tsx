"use client"

import { use, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { TradesTicker } from "@/components/trades-ticker"
import { tokens } from "@/lib/mock-data"
import { ArrowLeft, Copy, ExternalLink, Gift, Share2, Wallet, AlertCircle } from "lucide-react"

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

// Mock user data generator
function getUserData(userId: string) {
  const hash = userId.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  
  const tokensCreated = tokens.filter((_, i) => (hash + i) % 7 === 0).slice(0, 2)
  const tokensHeld = tokens.filter((_, i) => (hash + i) % 4 === 0).slice(0, 3)
  
  const totalPnl = (hash % 20000) - 15000 // Negative for demo
  const tradesCount = 50 + (hash % 200)
  const winRate = 45 + (hash % 10)
  const joinedDaysAgo = 10 + (hash % 90)
  
  const claimableRewards = 37.82
  const referralEarnings = 37.82
  const unclaimedFees = 17.82
  
  return {
    id: userId,
    fullAddr: `${userId}C8q2tWm6F9YccMdu55vaNm7y1P5xUFFZx1V8yt`,
    totalPnl,
    tradesCount,
    winRate,
    joinedDaysAgo,
    tokensCreated,
    tokensHeld,
    claimableRewards,
    referralEarnings,
    unclaimedFees,
  }
}

export default function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const user = getUserData(id)
  const [copied, setCopied] = useState(false)
  const [showError, setShowError] = useState(false)
  
  const copyReferral = () => {
    const refUrl = `https://v0-meme-launchpad-analysis-97o8evm3k.vercel.app/?ref=${user.id.slice(0, 6)}`
    navigator.clipboard.writeText(refUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Header />
      <TradesTicker />
      
      <main className="mx-auto max-w-[900px] px-4 py-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-3 w-3" /> back to board
        </Link>
        
        {/* Profile header */}
        <div className="rounded-lg border border-border bg-card overflow-hidden mb-4">
          <div className="p-5">
            <h1 className="font-display text-2xl uppercase">{user.id}...{user.id.slice(-4)}</h1>
            <div className="font-mono text-xs text-muted-foreground mt-1">
              {user.fullAddr}
            </div>
            <div className="flex items-center gap-2 mt-2 font-mono text-[11px] text-muted-foreground">
              <a
                href={`https://solscan.io/account/${user.fullAddr}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-primary"
              >
                <ExternalLink className="h-3 w-3" /> solscan
              </a>
              <span>·</span>
              <span>joined {user.joinedDaysAgo}d ago</span>
            </div>
          </div>
          
          {/* Stats strip */}
          <div className="grid grid-cols-4 border-t border-border">
            <StatBox
              label="TOTAL PnL"
              value={`$${user.totalPnl.toLocaleString()}`}
              accent={user.totalPnl >= 0 ? "primary" : "destructive"}
            />
            <StatBox label="TRADES" value={user.tradesCount.toString()} />
            <StatBox label="WIN RATE" value={`${user.winRate}%`} />
            <StatBox label="COINS CREATED" value={user.tokensCreated.length.toString()} />
          </div>
        </div>
        
        {/* Rewards & Referral Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Rewards */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border flex items-center gap-2">
              <Gift className="h-4 w-4 text-primary" />
              <span className="font-display text-xs uppercase tracking-wider">REWARDS</span>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between font-mono text-sm">
                <span className="text-muted-foreground">claimable</span>
                <span className="text-primary font-bold">{user.claimableRewards.toFixed(2)} SOL</span>
              </div>
              <div className="flex items-center justify-between font-mono text-sm">
                <span className="text-muted-foreground">referral earnings</span>
                <span className="text-foreground">{user.referralEarnings.toFixed(2)} SOL</span>
              </div>
              <button 
                onClick={() => setShowError(true)}
                className="w-full py-2.5 rounded border border-primary bg-primary/10 text-primary font-mono text-xs uppercase hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
              >
                <Gift className="h-3.5 w-3.5" />
                claim rewards
              </button>
            </div>
          </div>
          
          {/* Referral Link */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border flex items-center gap-2">
              <Share2 className="h-4 w-4 text-pink-500" />
              <span className="font-display text-xs uppercase tracking-wider">REFERRAL LINK</span>
            </div>
            <div className="p-4 space-y-3">
              <div className="font-mono text-[10px] text-muted-foreground break-all">
                https://v0-meme-launchpad-analysis-97o8evm3k.vercel.app/?ref={user.id.slice(0, 6)}
              </div>
              <button 
                onClick={copyReferral}
                className="w-full py-2.5 rounded border border-border bg-secondary text-foreground font-mono text-xs uppercase hover:border-foreground transition-colors flex items-center justify-center gap-2"
              >
                <Copy className="h-3.5 w-3.5" />
                {copied ? "copied!" : "copy referral link"}
              </button>
            </div>
          </div>
        </div>
        
        {/* Creator Fees */}
        <div className="rounded-lg border border-border bg-card overflow-hidden mb-4">
          <div className="px-4 py-2.5 border-b border-border flex items-center gap-2">
            <Wallet className="h-4 w-4 text-pink-500" />
            <span className="font-display text-xs uppercase tracking-wider">CREATOR FEES</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between font-mono text-sm">
              <span className="text-muted-foreground">unclaimed fees</span>
              <span className="text-pink-500 font-bold">{user.unclaimedFees.toFixed(2)} SOL</span>
            </div>
            <button 
              onClick={() => setShowError(true)}
              className="w-full py-2.5 rounded border border-pink-500/50 bg-pink-500/10 text-pink-500 font-mono text-xs uppercase hover:bg-pink-500/20 transition-colors flex items-center justify-center gap-2"
            >
              <Wallet className="h-3.5 w-3.5" />
              claim creator fees
            </button>
          </div>
        </div>
        
        {/* Tokens Held & Created Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Tokens held */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border font-display text-xs uppercase tracking-wider">
              TOKENS HELD ({user.tokensHeld.length})
            </div>
            {user.tokensHeld.length === 0 ? (
              <div className="p-6 text-center font-mono text-xs text-muted-foreground">no tokens held</div>
            ) : (
              <ul>
                {user.tokensHeld.map((t) => (
                  <li key={t.id} className="px-4 py-3 border-t border-border first:border-t-0 hover:bg-secondary/20">
                    <Link href={`/token/${t.id}`} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{t.emoji}</span>
                        <div>
                          <div className="font-display text-sm uppercase">{t.name}</div>
                          <div className="font-mono text-[10px] text-muted-foreground">${t.ticker}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-xs text-foreground">${(Math.random() * 100).toFixed(2)}</div>
                        <div className={`font-mono text-[10px] ${Math.random() > 0.5 ? "text-destructive" : "text-primary"}`}>
                          {Math.random() > 0.5 ? "-" : "+"}{(Math.random() * 20).toFixed(1)}%
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Tokens created */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border font-display text-xs uppercase tracking-wider">
              TOKENS CREATED ({user.tokensCreated.length})
            </div>
            {user.tokensCreated.length === 0 ? (
              <div className="p-6 text-center font-mono text-xs text-muted-foreground">no tokens created</div>
            ) : (
              <ul>
                {user.tokensCreated.map((t) => {
                  const progress = Math.min(100, (t.marketCap / 69000) * 100)
                  return (
                    <li key={t.id} className="px-4 py-3 border-t border-border first:border-t-0 hover:bg-secondary/20">
                      <Link href={`/token/${t.id}`} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{t.emoji}</span>
                          <div>
                            <div className="font-display text-sm uppercase">{t.name}</div>
                            <div className="font-mono text-[10px] text-muted-foreground">${t.ticker}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-xs text-foreground">${formatK(t.marketCap)}</div>
                          <div className={`font-mono text-[10px] ${progress >= 100 ? "text-primary" : ""}`}>
                            {progress >= 100 ? "100% to grad" : `${progress.toFixed(0)}% to grad`}
                          </div>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </main>
      
      {/* Error Toast */}
      {showError && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="rounded-lg border border-destructive bg-card px-4 py-3 shadow-lg" style={{ boxShadow: "0 0 20px hsl(var(--destructive) / 0.3)" }}>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <div className="font-display text-sm text-destructive">FAILED</div>
                <div className="font-mono text-xs text-muted-foreground">transaction failed — try again</div>
              </div>
              <button 
                onClick={() => setShowError(false)}
                className="ml-2 text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatBox({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: "primary" | "destructive"
}) {
  return (
    <div className="px-3 py-3 border-r border-border last:border-r-0 text-center">
      <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={
          accent === "primary"
            ? "font-display text-lg text-primary"
            : accent === "destructive"
              ? "font-display text-lg text-destructive"
              : "font-display text-lg text-foreground"
        }
      >
        {value}
      </div>
    </div>
  )
}

function formatK(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(2)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}
