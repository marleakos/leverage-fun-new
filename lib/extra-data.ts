export type Trader = {
  rank: number
  user: string
  pnl: number
  volume: number
  trades: number
  winRate: number
  liquidations: number
}

export const traders: Trader[] = [
  { rank: 1, user: "9xQe...4Rk", pnl: 482400, volume: 2840000, trades: 412, winRate: 71, liquidations: 3 },
  { rank: 2, user: "Hk2p...9Lm", pnl: 312800, volume: 1920000, trades: 298, winRate: 64, liquidations: 7 },
  { rank: 3, user: "Zx81...2Ap", pnl: 244100, volume: 1640000, trades: 244, winRate: 68, liquidations: 4 },
  { rank: 4, user: "Mn4q...7Vc", pnl: 189200, volume: 1410000, trades: 188, winRate: 59, liquidations: 12 },
  { rank: 5, user: "Pl9k...3Nb", pnl: 142500, volume: 988000, trades: 156, winRate: 62, liquidations: 6 },
  { rank: 6, user: "Ty3w...8Df", pnl: 118400, volume: 812000, trades: 122, winRate: 55, liquidations: 9 },
  { rank: 7, user: "Qa8r...1Ws", pnl: 98200, volume: 740000, trades: 102, winRate: 60, liquidations: 5 },
  { rank: 8, user: "Vb2x...5Hg", pnl: 76300, volume: 612000, trades: 88, winRate: 57, liquidations: 8 },
  { rank: 9, user: "Cx7n...4Jk", pnl: 54200, volume: 488000, trades: 71, winRate: 53, liquidations: 11 },
  { rank: 10, user: "Re5t...8Yu", pnl: 41100, volume: 392000, trades: 64, winRate: 51, liquidations: 7 },
]

export type FeeRow = { label: string; value: string; note: string }
export const fees: FeeRow[] = [
  { label: "Deploy token", value: "0.1 SOL", note: "one-time, paid by creator" },
  { label: "Trading fee", value: "0.5%", note: "every buy / sell on the bonding curve" },
  { label: "Leverage fee", value: "0.1% / day", note: "borrow cost for the perp position" },
  { label: "Graduation fee", value: "1% of LP", note: "at $69k mcap, migrates to Raydium" },
  { label: "Creator royalty", value: "0.1%", note: "paid to deployer on every trade" },
]

export const faqs = [
  {
    q: "what is a leveraged meme token?",
    a: "every token launched here is backed by a perp position (SOL-PERP, BTC-PERP, ETH-PERP) at 2x / 3x / 5x. the token's price tracks the underlying perp times the leverage. if the position liquidates, the token goes to zero.",
  },
  {
    q: "how does graduation work?",
    a: "tokens trade on a bonding curve until $69,000 market cap. at graduation the LP is migrated to raydium and the perp position is closed out into the pool.",
  },
  {
    q: "what is liquidation distance?",
    a: "the % move in the underlying that would liquidate the backing perp. lower = more dangerous. tokens under 15% show a 'near liq' warning.",
  },
  {
    q: "long vs short tokens?",
    a: "LONG tokens go up when the underlying goes up, SHORT tokens go up when it goes down. both are leveraged.",
  },
  {
    q: "where does the perp run?",
    a: "drift protocol on solana. price oracle is pyth.",
  },
]
