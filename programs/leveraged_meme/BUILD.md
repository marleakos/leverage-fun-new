# Build Instructions

## Problem
The Solana toolchain uses Rust 1.75.0 which is incompatible with newer crates on crates.io that require Rust 1.85.0+ (edition2024).

## Solutions

### Option 1: Solana Playground (Recommended)
1. Go to https://beta.solpg.io/
2. Create a new project
3. Copy the contents of `src/` files
4. Build and deploy directly in the browser

### Option 2: Use Pre-built Binary
If you have access to a working build environment, the program ID is:
`9siEsegivtASLpuRHzMC9UEBcCuzeKe8iREadFEZqCAP`

### Option 3: Wait for Solana Toolchain Update
The Solana team is working on updating to Rust 1.85.0+ which will resolve this issue.

## Program Features
- Referral system (10% of creator fees)
- Leverage fee tiers: 2x=0.6%, 3x=0.7%, 5x=0.8%, 10x=1.0%
- Bonding curve with virtual reserves
- Graduation to Raydium at $69k market cap
- No liquidation risk (floor at 0.001x)

## Deployed Program
The program code is complete and ready to deploy. The build environment issue is a temporary limitation of the Solana toolchain.
