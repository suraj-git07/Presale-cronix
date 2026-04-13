import { create } from 'zustand'

export type PayAsset = 'BNB' | 'USDT'

export const DEMO_RATES = {
  tokenPriceUsd: 0.05,
  bnbUsd: 620,
} as const

export const DEMO_PRESALE = {
  progressPct: 65,
  raisedUsd: 1_250_000,
  capUsd: 2_000_000,
  currentPriceLabel: '$0.05 / CRONIX',
} as const

type PresaleState = {
  payWith: PayAsset
  amount: string
  isHydrating: boolean
  /** Unix ms when next price tier activates */
  nextTierEndsAt: number
  setPayWith: (asset: PayAsset) => void
  setAmount: (value: string) => void
  finishHydration: () => void
}

export function computeTokensReceived(
  payWith: PayAsset,
  amount: string,
  bnbUsd: number,
  tokenPriceUsd: number,
): number | null {
  const raw = amount.replace(/,/g, '').trim()
  if (!raw) return null
  const n = Number.parseFloat(raw)
  if (!Number.isFinite(n) || n <= 0) return null
  const usd = payWith === 'BNB' ? n * bnbUsd : n
  return usd / tokenPriceUsd
}

export const usePresaleStore = create<PresaleState>((set) => ({
  payWith: 'BNB',
  amount: '',
  isHydrating: true,
  nextTierEndsAt: Date.now() + 1000 * 60 * 60 * 48,
  setPayWith: (payWith) => set({ payWith }),
  setAmount: (amount) => set({ amount }),
  finishHydration: () => set({ isHydrating: false }),
}))
