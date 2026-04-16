import { useEffect, useRef, useState } from 'react'
import { useConnect, useConnection, useDisconnect, useSwitchChain, useAccount } from 'wagmi'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { playUiClick } from '@/lib/sound'

const BSC_MAINNET_CHAIN_ID = 56

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

type WalletConnectButtonProps = {
  className?: string
  id?: string
}

export function WalletConnectButton({ className = '', id }: WalletConnectButtonProps) {
  const { address, isConnected, status } = useConnection()
  const { chainId } = useAccount()
  const { connectors, mutate: connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const [menuOpen, setMenuOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const hasInitialized = useRef(false)

  // On connect: switch to BSC mainnet
  useEffect(() => {
    if (isConnected && !hasInitialized.current) {
      hasInitialized.current = true
      if (chainId !== BSC_MAINNET_CHAIN_ID) {
        switchChain({ chainId: BSC_MAINNET_CHAIN_ID })
      }
    }
  }, [isConnected, chainId, switchChain])

  // If user changes network: disconnect
  useEffect(() => {
    if (isConnected && hasInitialized.current && chainId && chainId !== BSC_MAINNET_CHAIN_ID) {
      console.log('🚫 Wrong network detected - disconnecting')
      disconnect()
    }
  }, [isConnected, chainId, disconnect])

  useEffect(() => {
    if (!menuOpen) return
    const close = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [menuOpen])

  const onConnect = () => {
    playUiClick()
    const primary = connectors[0]
    if (primary) connect({ connector: primary })
  }

  const baseBtn =
    'focus-ring btn-3d inline-flex items-center justify-center gap-2 rounded-2xl border border-white/14 bg-[#060606] px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:border-white/32 hover:bg-[#0a0a0a] disabled:opacity-50'

  if (!isConnected || !address) {
    return (
      <button
        id={id}
        type="button"
        className={`${baseBtn} ${className}`}
        onClick={onConnect}
        disabled={isPending || status === 'connecting' || connectors.length === 0}
      >
        {isPending || status === 'connecting' ? 'Connecting…' : 'Connect Wallet'}
      </button>
    )
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        id={id}
        type="button"
        className={`${baseBtn} font-mono text-xs sm:text-sm`}
        onClick={() => {
          playUiClick()
          setMenuOpen((o) => !o)
        }}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
      >
        <span className="flex items-center gap-2">
          {/* Green dot indicator */}
          <span className="inline-flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
          {shortAddress(address)}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="surface-3d-subtle absolute right-0 z-50 mt-2 min-w-[11rem] overflow-hidden rounded-2xl bg-[#050505] py-1"
            role="menu"
          >
            <button
              type="button"
              role="menuitem"
              className="focus-ring w-full px-4 py-2.5 text-left text-sm text-white/55 hover:bg-white/[0.06] hover:text-white"
              onClick={() => {
                playUiClick()
                disconnect()
                setMenuOpen(false)
              }}
            >
              Disconnect
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
