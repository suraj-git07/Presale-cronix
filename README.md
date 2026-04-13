# CroniX presale dashboard

Token **CroniX**, ticker **CRONIX**. React (Vite) + TypeScript + Tailwind CSS v4 + Framer Motion + Zustand + wagmi/viem. Grayscale gaming-style presale UI.

## Setup

```bash
nvm use
npm install
npm run dev
```

Required runtime: Node 20.19+ (recommended: Node 22 via `.nvmrc`).

## Environment

Copy `.env.example` to `.env` and set:

- **`VITE_WALLETCONNECT_PROJECT_ID`** — optional; enables the WalletConnect connector from [WalletConnect Cloud](https://cloud.walletconnect.com/). Without it, only the injected browser wallet (e.g. MetaMask) is available.
- **`VITE_BSC_RPC_URL`** — optional custom BSC RPC; viem’s default public transport is used if unset.

## Build

```bash
nvm use
npm run build
npm run preview
```
