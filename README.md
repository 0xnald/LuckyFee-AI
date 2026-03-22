# LuckyFee AI

A decentralized fee-sharing reward pool on Solana, powered by [Bags](https://bags.fm/apps).

Users join a pool by sending 0.01 SOL. Every 5 minutes, a random winner is selected and receives 98% of the pool. The remaining 2% is retained as a Bags trading fee.

## How It Works

1. Connect your Solana wallet
2. Enter the pool (0.01 SOL per entry)
3. Wait for the 5-minute round to end
4. A winner is randomly selected
5. Winner clicks "Claim" to receive SOL directly to their wallet

Even a single participant wins their round.

## Stack

- **Next.js 14** — App Router, API routes
- **Solana Wallet Adapter** — Phantom, Solflare, Backpack, and all Wallet Standard wallets
- **MongoDB** — Shared pool state, draw history, claim tracking
- **Bags API** — Token feed, fee sharing, trade routing
- **Tailwind CSS** — Dark DeFi dashboard UI

## Setup

```bash
npm install
cp .env.example .env.local
# Fill in your keys
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `NEXT_PUBLIC_TREASURY_WALLET` | Wallet that receives pool entries |
| `TREASURY_PRIVATE_KEY` | Treasury private key for auto-payouts |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | Solana RPC (use [Helius](https://helius.dev)) |
| `NEXT_PUBLIC_BAGS_API_KEY` | Bags API key from [dev.bags.fm](https://dev.bags.fm) |

## Deploy

```bash
vercel
```

## Links

- [Bags](https://bags.fm/apps)
- [Bags API Docs](https://docs.bags.fm)
