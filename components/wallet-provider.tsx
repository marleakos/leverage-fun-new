"use client"

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { 
  PhantomWalletAdapter, 
  SolflareWalletAdapter,
  CoinbaseWalletAdapter,
  TrustWalletAdapter,
  LedgerWalletAdapter,
  MathWalletAdapter,
  Coin98WalletAdapter
} from "@solana/wallet-adapter-wallets"
import { clusterApiUrl } from "@solana/web3.js"
import { useMemo, ReactNode } from "react"

import "@solana/wallet-adapter-react-ui/styles.css"

export function WalletProvider({ children }: { children: ReactNode }) {
  const network = WalletAdapterNetwork.Devnet
  const endpoint = process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl(network)

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new TrustWalletAdapter(),
      new LedgerWalletAdapter(),
      new MathWalletAdapter(),
      new Coin98WalletAdapter(),
    ],
    []
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  )
}
