import { motion } from 'framer-motion'
import { playUiClick } from '@/lib/sound'
import {
  DEMO_RATES,
  type PayAsset,
  computeTokensReceived,
  usePresaleStore,
} from '@/store/presaleStore'

function formatTokens(n: number | null) {
  if (n === null) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(2)}K`
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

export function TokenCalculator() {
  const payWith = usePresaleStore((s) => s.payWith)
  const amount = usePresaleStore((s) => s.amount)
  const setPayWith = usePresaleStore((s) => s.setPayWith)
  const setAmount = usePresaleStore((s) => s.setAmount)

  const tokens = computeTokensReceived(
    payWith,
    amount,
    DEMO_RATES.bnbUsd,
    DEMO_RATES.tokenPriceUsd,
  )

  const toggle = (next: PayAsset) => {
    playUiClick()
    setPayWith(next)
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-widest text-white/38">
          Pay with
        </p>
        <div className="surface-3d-subtle flex rounded-2xl p-1">
          {(['BNB', 'USDT'] as const).map((asset) => {
            const active = payWith === asset
            return (
              <button
                key={asset}
                type="button"
                onClick={() => toggle(asset)}
                className={`focus-ring relative flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? 'text-black'
                    : 'text-white/45 hover:text-white/75'
                }`}
              >
                {active ? (
                  <motion.span
                    layoutId="pay-toggle"
                    className="btn-3d-solid absolute inset-0 -z-10 rounded-xl border border-white/30 bg-white"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                ) : null}
                <span className="relative z-10">{asset}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label htmlFor="pay-amount" className="mb-2 block text-xs font-medium uppercase tracking-widest text-white/38">
          Enter amount ({payWith})
        </label>
        <input
          id="pay-amount"
          type="text"
          inputMode="decimal"
          placeholder="0.0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="focus-ring inset-3d w-full rounded-2xl border border-white/10 bg-[#010101] px-4 py-3 font-mono text-lg text-white placeholder:text-white/25 outline-none transition-colors focus:border-white/32"
        />
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
