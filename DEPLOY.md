# Automated Deployment with GitHub Actions

This repository includes a GitHub Actions workflow to automatically build and deploy the Solana program.

## Setup

1. Go to your GitHub repository: https://github.com/marleakos/leverage-fun-new

2. Click on **Settings** → **Secrets and variables** → **Actions**

3. Click **New repository secret**

4. Add a secret with:
   - **Name**: `WALLET_PRIVATE_KEY`
   - **Value**: Your wallet private key as a JSON array:
   ```
   [236,193,61,72,139,71,63,225,212,210,207,151,234,245,252,180,228,201,106,202,191,147,21,65,167,185,242,172,43,239,205,92,89,4,45,171,50,33,20,247,223,111,146,26,154,216,87,244,0,112,96,86,254,31,177,96,111,30,180,214,142,249,157,196]
   ```

5. Go to **Actions** tab in your repository

6. Click on **Build and Deploy Solana Program**

7. Click **Run workflow** → **Run workflow**

The workflow will:
- Build the program
- Deploy to devnet
- Update the Program ID in the code
- Push the changes back to GitHub

## Requirements

- Your wallet must have devnet SOL (at least 0.5 SOL for fresh deploy)
- The workflow runs on GitHub's servers (not locally)
