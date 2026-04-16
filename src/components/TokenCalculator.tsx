import { motion } from 'framer-motion'
import React from 'react'
import {
  DEMO_RATES,
  computeTokensReceived,
  isAmountExceedsCapacity,
  usePresaleStore,
} from '@/store/presaleStore'

function formatTokens(n: number | null) {
  if (n === null) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(2)}K`
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

function formatUsd(n: number) {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export function TokenCalculator() {
  const amount = usePresaleStore((s) => s.amount)
  const raisedUsd = usePresaleStore((s) => s.raisedUsd)
  const maxSupplyUsd = usePresaleStore((s) => s.maxSupplyUsd)
  const setAmount = usePresaleStore((s) => s.setAmount)

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow numbers and one decimal point
    const validValue = value.replace(/[^\d.]/g, '')
    // Prevent multiple decimal points
    const finalValue = validValue.split('.').length > 2 
      ? validValue.substring(0, validValue.lastIndexOf('.'))
      : validValue
    setAmount(finalValue)
  }

  const tokens = computeTokensReceived(
    amount,
    DEMO_RATES.tokenPriceUsd,
  )

  const remainingCapacity = maxSupplyUsd - raisedUsd
  const exceedsCapacity = isAmountExceedsCapacity(amount, raisedUsd)

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="pay-amount" className="text-xs font-medium uppercase tracking-widest text-white/38">
            Enter amount (USDT)
          </label>
        </div>
        <input
          id="pay-amount"
          type="text"
          inputMode="decimal"
          placeholder="0.0"
          value={amount}
          onChange={handleAmountChange}
          className={`focus-ring inset-3d w-full rounded-2xl border px-4 py-3 font-mono text-lg text-white placeholder:text-white/25 outline-none transition-colors ${
            exceedsCapacity
              ? 'border-red-500/50 bg-red-950/20 focus:border-red-500'
              : 'border-white/10 bg-[#010101] focus:border-white/32'
          }`}
        />
        {exceedsCapacity && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-xs text-red-400"
          >
            Amount exceeds remaining capacity ({formatUsd(remainingCapacity)} available)
          </motion.p>
        )}
      </div>

      <div className="surface-3d-subtle rounded-2xl px-4 py-3">
        <p className="text-xs uppercase tracking-widest text-white/38">You receive (est.)</p>
        <p className="mt-1 font-[family-name:var(--font-orbitron)] text-2xl font-semibold tracking-tight text-white">
          {formatTokens(tokens)}{' '}
          <span className="text-base font-normal text-white/45">CRONIX</span>
        </p>
      </div>
    </div>
  )
}
