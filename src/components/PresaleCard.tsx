import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useConnection, useAccount } from 'wagmi'

const BSC_MAINNET_CHAIN_ID = 56
import { formatUnits } from 'viem'
import { CountdownTimer } from '@/components/CountdownTimer'
import { ProgressBar } from '@/components/ProgressBar'
import { TokenCalculator } from '@/components/TokenCalculator'
import { WalletConnectButton } from '@/components/WalletConnectButton'
import { playUiClick } from '@/lib/sound'
import { fetchInitialPresaleData } from '@/lib/presaleData'
import { usePresaleContract } from '@/hooks/usePresaleContract'
import { useBuyTokensFlow } from '@/hooks/useBuyTokensFlow'
import { useTokenBalances } from '@/hooks/useTokenBalances'
import {
  DEMO_PRESALE,
  DEMO_RATES,
  computeTokensReceived,
  isAmountExceedsCapacity,
  usePresaleStore,
} from '@/store/presaleStore'

export function PresaleCard() {
  const reduceMotion = useReducedMotion()
  const { isConnected } = useConnection()
  const { chainId } = useAccount()
  const [networkSwitchFailed, setNetworkSwitchFailed] = useState(false)
  const networkCheckRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  // Persist last known tokens sold - shows cached value when disconnected
  const [lastKnownTokensSold, setLastKnownTokensSold] = useState(() => {
    const stored = localStorage.getItem('lastKnownTokensSold')
    return stored ? BigInt(stored) : 0n
  })

  // Initialize presale data from contract on mount (no wallet needed)
  useEffect(() => {
    const initializePresaleData = async () => {
      // Only fetch if we don't have cached data
      if (localStorage.getItem('lastKnownTokensSold')) {
        return
      }

      try {
        const tokensSold = await fetchInitialPresaleData()
        if (tokensSold > 0n) {
          setLastKnownTokensSold(tokensSold)
          localStorage.setItem('lastKnownTokensSold', tokensSold.toString())
        }
      } catch (_error) {
        console.error('Failed to fetch initial presale data:', _error)
        // Silent fail - will show 0 progress
      }
    }

    initializePresaleData()
  }, [])
  
  // Store state
  const isHydrating = usePresaleStore((s) => s.isHydrating)
  const finishHydration = usePresaleStore((s) => s.finishHydration)
  const amount = usePresaleStore((s) => s.amount)
  const raisedUsd = usePresaleStore((s) => s.raisedUsd)
  const maxSupplyUsd = usePresaleStore((s) => s.maxSupplyUsd)
  const userTokensBought = usePresaleStore((s) => s.userTokensBought)
  const claimAllowed = usePresaleStore((s) => s.claimAllowed)
  const setUserTokensBought = usePresaleStore((s) => s.setUserTokensBought)
  const setClaimAllowed = usePresaleStore((s) => s.setClaimAllowed)
  const setRaisedUsd = usePresaleStore((s) => s.setRaisedUsd)
  const setMaxSupply = usePresaleStore((s) => s.setMaxSupply)
  const setMaxSupplyUsd = usePresaleStore((s) => s.setMaxSupplyUsd)
  const nextTierEndsAt = usePresaleStore((s) => s.nextTierEndsAt)

  // Web3 hooks
  const { tokensBoughtByUser, totalTokensSold, claimAllowed: contractClaimAllowed, isClaiming, onClaimTokens, refetchTokensBought, refetchPresaleInfo, refetchTotalTokensSold } = usePresaleContract()
  const { step, label, isBusy, isDone, errorMsg, onBuy } = useBuyTokensFlow(amount)
  const { usdtBalanceFormatted } = useTokenBalances()

  // Track claim state to detect when claim completes
  const prevIsClaimingRef = useRef(isClaiming)

  // Sync Web3 data to store: totalTokensSold -> raisedUsd
  useEffect(() => {
    if (totalTokensSold) {
      const tokensSoldBig = totalTokensSold as bigint
      // Update last known value and persist to localStorage
      setLastKnownTokensSold(tokensSoldBig)
      localStorage.setItem('lastKnownTokensSold', tokensSoldBig.toString())
      
      const tokensSoldNumber = Number(formatUnits(tokensSoldBig, 18))
      const calculatedRaisedUsd = tokensSoldNumber * DEMO_RATES.tokenPriceUsd
      setRaisedUsd(calculatedRaisedUsd)
    }
  }, [totalTokensSold, setRaisedUsd])

  // Fallback: use last known tokens sold when not connected to blockchain
  useEffect(() => {
    if (!isConnected && lastKnownTokensSold > 0n) {
      const tokensSoldNumber = Number(formatUnits(lastKnownTokensSold, 18))
      const calculatedRaisedUsd = tokensSoldNumber * DEMO_RATES.tokenPriceUsd
      setRaisedUsd(calculatedRaisedUsd)
    }
  }, [isConnected, lastKnownTokensSold, setRaisedUsd])

  // Sync max supply from the configured presale allocation.
  useEffect(() => {
    const maxSupplyTokens = DEMO_PRESALE.capTokens
    const calculatedMaxUsd = maxSupplyTokens * DEMO_RATES.tokenPriceUsd
    setMaxSupply(maxSupplyTokens * 1e18) // Store as wei
    setMaxSupplyUsd(calculatedMaxUsd)
  }, [setMaxSupply, setMaxSupplyUsd])

  useEffect(() => {
    if (tokensBoughtByUser !== undefined && tokensBoughtByUser !== null) {
      const tokensBought = Number(formatUnits(tokensBoughtByUser as bigint, 18))
      setUserTokensBought(tokensBought)
    }
  }, [tokensBoughtByUser, setUserTokensBought])

  useEffect(() => {
    if (contractClaimAllowed !== undefined) {
      setClaimAllowed(contractClaimAllowed)
    }
  }, [contractClaimAllowed, setClaimAllowed])

  useEffect(() => {
    const t = window.setTimeout(() => finishHydration(), 800)
    return () => window.clearTimeout(t)
  }, [finishHydration])

  const tokens = computeTokensReceived(amount, DEMO_RATES.tokenPriceUsd)
  const exceedsCapacity = isAmountExceedsCapacity(amount, raisedUsd)
  const amountNum = Number(amount.replace(/,/g, '').trim()) || 0
  const isBelowMinimum = amountNum > 0 && amountNum < 15
  const progressPct = Math.round((raisedUsd / maxSupplyUsd) * 100)
  const canBuy = isConnected && chainId === BSC_MAINNET_CHAIN_ID && tokens !== null && tokens > 0 && !exceedsCapacity && !isBelowMinimum

  // Monitor network switch status - show alert if still on wrong network after 3 seconds
  useEffect(() => {
    const isWrongNetwork = isConnected && chainId !== BSC_MAINNET_CHAIN_ID
    
    if (isWrongNetwork) {
      if (networkCheckRef.current) clearTimeout(networkCheckRef.current)
      networkCheckRef.current = setTimeout(() => {
        setNetworkSwitchFailed(true)
      }, 3000)
    } else {
      if (networkCheckRef.current) {
        clearTimeout(networkCheckRef.current)
        networkCheckRef.current = null
      }
    }
    
    return () => {
      if (networkCheckRef.current) clearTimeout(networkCheckRef.current)
    }
  }, [isConnected, chainId])

  const handleBuyClick = async () => {
    playUiClick()
    onBuy()
  }

  // Refetch all data when transaction is successful
  useEffect(() => {
    if (isDone) {
      // Refetch all contract data with delay for block confirmation
      setTimeout(() => {
        refetchTokensBought?.()
        refetchPresaleInfo?.()
        refetchTotalTokensSold?.()
      }, 3000)
      
      // Reset the amount after successful purchase
      usePresaleStore.setState({ amount: '' })
    }
  }, [isDone, refetchTokensBought, refetchPresaleInfo, refetchTotalTokensSold])

  // Refetch balance immediately when claim is done
  useEffect(() => {
    // Check if claim was in progress and now it's done
    if (prevIsClaimingRef.current && !isClaiming) {
      // Immediate refetch
      refetchTokensBought?.()
      
      // Multiple refetch attempts at different intervals to catch the data update
      setTimeout(() => {
        refetchTokensBought?.()
      }, 1000)
      
      setTimeout(() => {
        refetchTokensBought?.()
      }, 2500)
      
      setTimeout(() => {
        refetchTokensBought?.()
      }, 4000)
    }
    // Update the ref for next time
    prevIsClaimingRef.current = isClaiming
  }, [isClaiming, refetchTokensBought])

  const onClaim = async () => {
    playUiClick()
    try {
      await onClaimTokens()
    } catch (error) {
      console.error('Claim failed:', error)
    }
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
        className="surface-3d rounded-2xl p-8 sm:p-10 py-10 sm:py-12"
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
            <span className="font-mono text-white">{(raisedUsd / DEMO_RATES.tokenPriceUsd).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            <span className="text-white/22"> / </span>
            <span className="font-mono text-white/75">{(maxSupplyUsd / DEMO_RATES.tokenPriceUsd).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            <span className="block text-xs text-white/28">Tokens sold / Max supply</span>
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
        
        {/* Show minimum amount warning */}
        {isBelowMinimum && (
          <p className="text-xs text-yellow-400 px-2 mt-2"> Minimum purchase is $15 USDT</p>
        )}

        {/* Show network switch failed alert */}
        {networkSwitchFailed && isConnected && chainId !== BSC_MAINNET_CHAIN_ID && (
          <p className="text-xs text-white px-3 mt-2 rounded-lg py-2.5 border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 shadow-[0_0_15px_rgba(34,211,238,0.2)] font-semibold">
             Please manually switch your network to BSC Mainnet
          </p>
        )}

        {/* User holdings - show when connected */}
        {isConnected && (
          <div className="mb-6 grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-2">
            <div className="surface-3d-subtle min-w-0 rounded-2xl px-4 py-3">
              <p className="text-xs uppercase tracking-widest text-white/38">Your Claimable CRONIX</p>
              <p className="mt-1 font-[family-name:var(--font-orbitron)] text-lg font-semibold text-white">
                {userTokensBought > 0 ? userTokensBought.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0'}
              </p>
            </div>
            <div className="surface-3d-subtle min-w-0 rounded-2xl px-4 py-3">
              <p className="text-xs uppercase tracking-widest text-white/38">Your USDT</p>
              <p className="mt-1 font-[family-name:var(--font-orbitron)] text-lg font-semibold text-white">
                {usdtBalanceFormatted && usdtBalanceFormatted !== '0' ? parseFloat(usdtBalanceFormatted).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0'}
              </p>
            </div>
          </div>
        )}

        {!isConnected ? (
          <div className="mt-8">
            <WalletConnectButton className="w-full" />
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
            <WalletConnectButton className="w-full sm:w-auto sm:flex-shrink-0" />
            <div className="flex flex-col gap-3 flex-1">
              {/* Claim button - show ONLY when claiming is allowed */}
              {claimAllowed ? (
                <button
                  type="button"
                  disabled={isClaiming || userTokensBought === 0}
                  onClick={onClaim}
                  className={`focus-ring btn-3d-solid w-full rounded-2xl border px-6 py-3.5 text-sm font-mono font-bold tracking-wider transition-all ${
                    userTokensBought > 0
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-black border-cyan-400/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] cursor-pointer'
                      : 'bg-gray-500 text-white/60 border-white/10 cursor-not-allowed'
                  }`}
                >
                  {isClaiming ? 'Claiming...' : userTokensBought > 0 ? `Claim ${userTokensBought.toFixed(0)} Tokens` : 'No Tokens to Claim'}
                </button>
              ) : (
                <>
                  {/* Buy button - show only when claiming is NOT allowed */}
                  <button
                    type="button"
                    disabled={(!canBuy && step === 'idle') || isBusy || isDone}
                    onClick={handleBuyClick}
                    className={`focus-ring btn-3d-solid w-full rounded-2xl border px-6 py-3.5 text-sm font-mono font-bold tracking-wider transition-all ${
                      canBuy && step === 'idle'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-black border-green-400/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] cursor-pointer'
                        : 'bg-green-500/50 text-white/60 border-green-400/20 cursor-not-allowed'
                    }`}
                  >
                    {label}
                  </button>

                  {/* Show error message if any */}
                  {errorMsg && (
                    <p className="text-xs text-red-400 mt-2">{errorMsg}</p>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </motion.section>
  )
}
