"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { Menu, X, Wallet, Loader2, Search, User } from "lucide-react"

const NAV = [
  { href: "/", label: "[board]" },
  { href: "/create", label: "[create]" },
  { href: "/how-to", label: "[how to]" },
  { href: "/docs", label: "[docs]" },
]

export function Header() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const { connected, publicKey, disconnect, connecting } = useWallet()
  const { setVisible } = useWalletModal()

  const handleConnect = () => {
    setVisible(true)
  }

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-3">
        {/* Logo */}
        <Link href="/" className="font-display text-xl leading-none shrink-0 text-primary" onClick={() => setMenuOpen(false)}>
          LEVERAGE.FUN
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-mono">
          {NAV.map((n) => {
            const active = pathname === n.href || (n.href !== "/" && pathname.startsWith(n.href))
            return (
              <Link
                key={n.href}
                href={n.href}
                className={active ? "text-primary font-bold px-2" : "text-muted-foreground hover:text-foreground px-2"}
              >
                {n.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {/* Search */}
          <div className="hidden sm:flex items-center gap-2 bg-secondary rounded px-3 py-1.5 border border-border">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="search ticker / contract" 
              className="bg-transparent text-xs font-mono outline-none w-40 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          
          {connected ? (
            <>
              <Link 
                href={`/user/${publicKey?.toString().slice(0, 6)}`}
                className="inline-flex h-8 items-center gap-1.5 rounded border border-border bg-secondary px-3 font-mono text-xs hover:border-foreground"
              >
                <User className="h-3 w-3" />
                profile
              </Link>
              <button 
                onClick={disconnect}
                className="inline-flex h-8 items-center rounded border border-primary bg-primary/10 px-3 font-mono text-xs hover:bg-primary/20"
              >
                {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
              </button>
            </>
          ) : (
            <button 
              onClick={handleConnect}
              disabled={connecting}
              className="inline-flex h-8 items-center rounded border border-border bg-secondary px-3 font-mono text-xs hover:border-foreground disabled:opacity-50"
            >
              {connecting ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Wallet className="h-3 w-3 mr-1" />
              )}
              {connecting ? "connecting..." : "connect"}
            </button>
          )}
          
          {/* Hamburger — mobile only */}
          <button
            className="md:hidden flex h-8 w-8 items-center justify-center rounded border border-border bg-secondary"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <nav className="md:hidden border-t border-border bg-card px-3 py-3 flex flex-col gap-1">
          {NAV.map((n) => {
            const active = pathname === n.href || (n.href !== "/" && pathname.startsWith(n.href))
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2.5 rounded font-mono text-sm ${
                  active
                    ? "bg-primary/15 text-primary font-bold"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {n.label}
              </Link>
            )
          })}
          <div className="mt-2 pt-2 border-t border-border space-y-2">
            {connected ? (
              <>
                <Link 
                  href={`/user/${publicKey?.toString().slice(0, 6)}`}
                  onClick={() => setMenuOpen(false)}
                  className="w-full h-9 rounded border border-border bg-secondary font-mono text-xs hover:border-foreground flex items-center justify-center gap-1.5"
                >
                  <User className="h-3 w-3" />
                  profile
                </Link>
                <button 
                  onClick={() => { disconnect(); setMenuOpen(false); }}
                  className="w-full h-9 rounded border border-primary bg-primary/10 font-mono text-xs hover:bg-primary/20"
                >
                  {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
                </button>
              </>
            ) : (
              <button 
                onClick={() => { handleConnect(); setMenuOpen(false); }}
                disabled={connecting}
                className="w-full h-9 rounded border border-border bg-secondary font-mono text-xs hover:border-foreground disabled:opacity-50"
              >
                {connecting ? "connecting..." : "connect wallet"}
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
