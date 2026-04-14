import { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useConnection, useAccount } from 'wagmi'
import { bsc } from 'viem/chains'
import { CountdownTimer } from '@/components/CountdownTimer'
import { ProgressBar } from '@/components/ProgressBar'
import { TokenCalculator } from '@/components/TokenCalculator'
import { WalletConnectButton } from '@/components/WalletConnectButton'
import { playUiClick } from '@/lib/sound'
import {
  DEMO_PRESALE,
  DEMO_RATES,
  computeTokensReceived,
  getProgressPercentage,
  isAmountExceedsCapacity,
  usePresaleStore,
} from '@/store/presaleStore'

function formatUsd(n: number) {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export function PresaleCard() {
  const reduceMotion = useReducedMotion()
  const { isConnected } = useConnection()
  const { chainId } = useAccount()
  const isHydrating = usePresaleStore((s) => s.isHydrating)
  const finishHydration = usePresaleStore((s) => s.finishHydration)
  const amount = usePresaleStore((s) => s.amount)
  const raisedUsd = usePresaleStore((s) => s.raisedUsd)
  const nextTierEndsAt = usePresaleStore((s) => s.nextTierEndsAt)

  useEffect(() => {
    const t = window.setTimeout(() => finishHydration(), 800)
    return () => window.clearTimeout(t)
  }, [finishHydration])

  const tokens = computeTokensReceived(
    amount,
    DEMO_RATES.tokenPriceUsd,
  )
  const exceedsCapacity = isAmountExceedsCapacity(amount, raisedUsd)
  const progressPct = Math.round(getProgressPercentage(raisedUsd))
  const canBuy = isConnected && chainId === bsc.id && tokens !== null && tokens > 0 && !exceedsCapacity

  const onBuy = () => {
    playUiClick()
    if (!canBuy) return
    
  }

  return (
    <motion.section
      id="presale"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-lg px-4 py-16 [perspective:1400px]"
    >
      <motion.div
        className="surface-3d rounded-2xl p-6 sm:p-8"
        style={{ transformStyle: 'preserve-3d' }}
        whileHover={
          reduceMotion
            ? undefined
            : { rotateX: 2.5, rotateY: -1.5, y: -5, transition: { type: 'spring', stiffness: 280, damping: 22 } }
        }
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="font-[family-name:var(--font-orbitron)] text-xl font-semibold tracking-wide text-white sm:text-2xl">
            CroniX presale
          </h2>
          <span className="rounded-full border border-white/12 bg-[#050505] px-3 py-1 font-[family-name:var(--font-orbitron)] text-xs font-semibold tracking-wider text-white/55">
            $CRONIX
          </span>
        </div>

        <div className={isHydrating ? 'shimmer rounded-xl' : ''}>
          <div className="mb-4 space-y-2">
            <div className="flex justify-between text-xs text-white/38">
              <span>Progress</span>
              <span className="font-mono text-white/55">{progressPct}%</span>
            </div>
            <ProgressBar value={progressPct} isLoading={isHydrating} />
          </div>

          <p className="mb-6 text-center text-sm text-white/45">
            <span className="font-mono text-white">{formatUsd(raisedUsd)}</span>
            <span className="text-white/22"> / </span>
            <span className="font-mono text-white/75">{formatUsd(DEMO_PRESALE.capUsd)}</span>
            <span className="block text-xs text-white/28">Total raised / Hard cap</span>
          </p>
        </div>

        <div className="mb-6 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="surface-3d-subtle min-w-0 rounded-2xl px-4 py-3">
            <p className="text-xs uppercase tracking-widest text-white/38">Current price</p>
            <p className="mt-1 font-mono text-lg text-white">{DEMO_PRESALE.currentPriceLabel}</p>
          </div>
          <div className="min-w-0">
            <CountdownTimer targetTimestamp={nextTierEndsAt} />
          </div>
        </div>

        <TokenCalculator />

        {!isConnected ? (
          <div className="mt-8">
            <WalletConnectButton className="w-full" />
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
            <WalletConnectButton className="w-full sm:flex-1" />
            <button
              type="button"
              disabled={!canBuy}
              onClick={onBuy}
              className={`focus-ring btn-3d-solid w-full rounded-2xl border border-white/25 px-6 py-3.5 text-sm font-bold uppercase tracking-[0.15em] transition-all sm:flex-1 ${
                chainId === bsc.id
                  ? 'bg-green-500 text-black hover:bg-green-400 disabled:bg-green-300/50'
                  : 'bg-white text-black hover:bg-neutral-100 disabled:bg-[#0a0a0a] disabled:text-white/35 disabled:border-white/8 disabled:shadow-none'
              }`}
            >
              {chainId !== bsc.id ? 'Switch to BSC' : 'Buy CRONIX'}
            </button>
          </div>
        )}
      </motion.div>
    </motion.section>
  )
}
