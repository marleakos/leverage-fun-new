# Leveraged Meme Program

A Solana program for leveraged meme token trading with bonding curves.

## Features

- **Leverage Trading**: 2x, 3x, 5x, 10x leverage options
- **No Liquidation Risk**: Tokens can't be liquidated
- **Bonding Curve**: Automated market making until graduation
- **Referral System**: 10% of creator fees go to referrers
- **Fee Structure**: 
  - Base trading fee: 0.5%
  - Leverage fees: 2x=+0.1%, 3x=+0.2%, 5x=+0.3%, 10x=+0.5%

## Program ID

```
9siEsegivtASLpuRHzMC9UEBcCuzeKe8iREadFEZqCAP
```

## Build & Deploy

```bash
anchor build
anchor deploy
```

## Instructions

- `initialize_token`: Create a new leveraged meme token
- `buy`: Buy tokens with SOL
- `sell`: Sell tokens for SOL
- `graduate`: Graduate token to AMM when threshold reached
- `claim_fees`: Claim creator fees
- `claim_referral_rewards`: Claim referral rewards
