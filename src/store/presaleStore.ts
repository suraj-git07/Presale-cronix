import { create } from 'zustand'

export type PayAsset = 'USDT'

export const DEMO_RATES = {
  tokenPriceUsd: 0.05,
} as const

// Hard cap is fixed - only gets updated if presale parameters change
export const DEMO_PRESALE = {
  capUsd: 25_000_000, // 500k tokens * 0.05 USDT = 25M max
  currentPriceLabel: '$0.05 / CRONIX',
} as const

type PresaleState = {
  amount: string
  isHydrating: boolean
  /** Unix ms when next price tier activates */
  nextTierEndsAt: number
  /** Total USDT raised so far - calculated from totalTokensSold * 0.05 */
  raisedUsd: number
  /** Total tokens sold from contract (wei) */
  totalTokensSold: number
  /** Max supply of tokens (wei) */
  maxSupply: number
  /** Max supply in USDT value */
  maxSupplyUsd: number
  /** Tokens purchased by current user (from blockchain) */
  userTokensBought: number
  /** Whether claiming phase is allowed (from contract) */
  claimAllowed: boolean
  /** User's USDT balance (from blockchain) */
  userUsdtBalance: string
  setAmount: (value: string) => void
  finishHydration: () => void
  /** Add amount to total raised (called when user completes purchase) */
  addRaisedAmount: (amountUsdt: number) => void
  /** Directly set raised amount (for API syncing or manual updates) */
  setRaisedUsd: (amount: number) => void
  /** Update total tokens sold from contract (wei) */
  setTotalTokensSold: (amount: number) => void
  /** Update max supply from contract (wei) */
  setMaxSupply: (amount: number) => void
  /** Calculate and set max supply USDT value */
  setMaxSupplyUsd: (amount: number) => void
  /** Update user tokens bought from blockchain */
  setUserTokensBought: (amount: number) => void
  /** Update claim allowed status from blockchain */
  setClaimAllowed: (allowed: boolean) => void
  /** Update user's USDT balance */
  setUserUsdtBalance: (balance: string) => void
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
  raisedUsd: 0, // Calculated from totalTokensSold
  totalTokensSold: 0, // From contract
  maxSupply: 0, // From contract (500k * 1e18)
  maxSupplyUsd: DEMO_PRESALE.capUsd, // From maxSupply calculation
  userTokensBought: 0, // Will be fetched from blockchain
  claimAllowed: false, // Will be fetched from blockchain
  userUsdtBalance: '0', // Will be fetched from blockchain
  setAmount: (amount) => set({ amount }),
  finishHydration: () => set({ isHydrating: false }),
  addRaisedAmount: (amountUsdt) =>
    set((state) => ({
      raisedUsd: Math.min(state.raisedUsd + amountUsdt, state.maxSupplyUsd),
    })),
  setRaisedUsd: (amount) => set({ raisedUsd: Math.max(0, amount) }),
  setTotalTokensSold: (amount) => set({ totalTokensSold: Math.max(0, amount) }),
  setMaxSupply: (amount) => set({ maxSupply: Math.max(0, amount) }),
  setMaxSupplyUsd: (amount) => set({ maxSupplyUsd: Math.max(0, amount) }),
  setUserTokensBought: (amount) => set({ userTokensBought: Math.max(0, amount) }),
  setClaimAllowed: (allowed) => set({ claimAllowed: allowed }),
  setUserUsdtBalance: (balance) => set({ userUsdtBalance: balance }),
}))
