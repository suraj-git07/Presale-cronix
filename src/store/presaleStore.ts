import { create } from 'zustand'

export type PayAsset = 'USDT'

export const DEMO_RATES = {
  tokenPriceUsd: 0.05,
} as const

// Hard cap is fixed - only gets updated if presale parameters change
export const DEMO_PRESALE = {
  capUsd: 2_000_000,
  currentPriceLabel: '$0.05 / CRONIX',
} as const

type PresaleState = {
  amount: string
  isHydrating: boolean
  /** Unix ms when next price tier activates */
  nextTierEndsAt: number
  /** Total USDT raised so far - gets updated as users make purchases */
  raisedUsd: number
  setAmount: (value: string) => void
  finishHydration: () => void
  /** Add amount to total raised (called when user completes purchase) */
  addRaisedAmount: (amountUsdt: number) => void
  /** Directly set raised amount (for API syncing or manual updates) */
  setRaisedUsd: (amount: number) => void
}

export function computeTokensReceived(
  amount: string,
  tokenPriceUsd: number,
): number | null {
  const raw = amount.replace(/,/g, '').trim()
  if (!raw) return null
  const n = Number.parseFloat(raw)
  if (!Number.isFinite(n) || n <= 0) return null
  return n / tokenPriceUsd
}


/**
 * Calculate remaining USDT capacity in presale
 * Needs to be called with store state as parameter since functions can't access store directly
 */
export function getRemainingCapacity(raisedUsd: number): number {
  return DEMO_PRESALE.capUsd - raisedUsd
}

/**
 * Calculate presale progress percentage
 */
export function getProgressPercentage(raisedUsd: number): number {
  const pct = (raisedUsd / DEMO_PRESALE.capUsd) * 100
  return Math.min(pct, 100) // Cap at 100%
}

/**
 * Check if amount exceeds remaining capacity
 */
export function isAmountExceedsCapacity(amount: string, raisedUsd: number): boolean {
  const raw = amount.replace(/,/g, '').trim()
  if (!raw) return false
  const n = Number.parseFloat(raw)
  if (!Number.isFinite(n)) return false
  return n > getRemainingCapacity(raisedUsd)
}

export const usePresaleStore = create<PresaleState>((set) => ({
  amount: '',
  isHydrating: true,
  nextTierEndsAt: Date.now() + 1000 * 60 * 60 * 48,
  raisedUsd: 0, // Initial demo value
  setAmount: (amount) => set({ amount }),
  finishHydration: () => set({ isHydrating: false }),
  addRaisedAmount: (amountUsdt) =>
    set((state) => ({
      raisedUsd: Math.min(state.raisedUsd + amountUsdt, DEMO_PRESALE.capUsd),
    })),
  setRaisedUsd: (amount) => set({ raisedUsd: Math.max(0, Math.min(amount, DEMO_PRESALE.capUsd)) }),
}))
