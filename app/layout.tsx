import type { Metadata } from "next"
import { Space_Grotesk, JetBrains_Mono, Bungee } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { WalletProvider } from "@/components/wallet-provider"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})
const bungee = Bungee({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
})

export const metadata: Metadata = {
  title: "leverage.fun — leveraged meme launchpad",
  description: "launch leveraged meme coins. 2x, 3x, 5x your favorite perps. fair launch on a bonding curve. you will get rekt.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${bungee.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <WalletProvider>
          {children}
        </WalletProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
