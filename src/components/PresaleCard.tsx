import { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useConnection } from 'wagmi'
import { CountdownTimer } from '@/components/CountdownTimer'
import { ProgressBar } from '@/components/ProgressBar'
import { TokenCalculator } from '@/components/TokenCalculator'
import { WalletConnectButton } from '@/components/WalletConnectButton'
import { playUiClick } from '@/lib/sound'
import {
  DEMO_PRESALE,
  DEMO_RATES,
  computeTokensReceived,
  usePresaleStore,
} from '@/store/presaleStore'

function formatUsd(n: number) {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export function PresaleCard() {
  const reduceMotion = useReducedMotion()
  const { isConnected } = useConnection()
  const isHydrating = usePresaleStore((s) => s.isHydrating)
  const finishHydration = usePresaleStore((s) => s.finishHydration)
  const payWith = usePresaleStore((s) => s.payWith)
  const amount = usePresaleStore((s) => s.amount)
  const nextTierEndsAt = usePresaleStore((s) => s.nextTierEndsAt)

  useEffect(() => {
    const t = window.setTimeout(() => finishHydration(), 800)
    return () => window.clearTimeout(t)
  }, [finishHydration])

  const tokens = computeTokensReceived(
    payWith,
    amount,
    DEMO_RATES.bnbUsd,
    DEMO_RATES.tokenPriceUsd,
  )
  const canBuy = isConnected && tokens !== null && tokens > 0

  const onBuy = () => {
    playUiClick()
    if (!canBuy) return
    // Stub until presale contract + ABI are wired
    window.alert(
      'CroniX on-chain presale is not configured yet. Connect wallet and use this UI as a demo.',
    )
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
              <span className="font-mono text-white/55">{DEMO_PRESALE.progressPct}%</span>
            </div>
            <ProgressBar value={DEMO_PRESALE.progressPct} isLoading={isHydrating} />
          </div>

          <p className="mb-6 text-center text-sm text-white/45">
            <span className="font-mono text-white">{formatUsd(DEMO_PRESALE.raisedUsd)}</span>
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

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          {!isConnected ? (
            <WalletConnectButton className="w-full sm:flex-1" />
          ) : (
            <p className="text-center text-sm text-white/42 sm:flex-1 sm:text-left">
              Wallet connected — enter an amount to buy CRONIX in the CroniX presale.
            </p>
          )}
          <button
            type="button"
            disabled={!canBuy}
            onClick={onBuy}
            className="focus-ring btn-3d-solid w-full rounded-2xl border border-white/25 bg-white px-6 py-3.5 text-sm font-bold uppercase tracking-[0.15em] text-black transition-all hover:bg-neutral-100 disabled:cursor-not-allowed disabled:border-white/8 disabled:bg-[#0a0a0a] disabled:text-white/35 disabled:shadow-none sm:w-auto sm:min-w-[10rem]"
          >
            Buy CRONIX
          </button>
        </div>
      </motion.div>
    </motion.section>
  )
}
