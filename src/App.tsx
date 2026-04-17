import { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useConnection, useAccount } from 'wagmi'
import { CosmicBackdrop } from '@/components/CosmicBackdrop'
import { ScrollTracker } from '@/components/ScrollTracker'
import { ToastContainer } from '@/components/ToastContainer'
import { PresaleCard } from '@/components/PresaleCard'
import { FooterSection } from '@/components/sections/FooterSection'
import { HeroSection } from '@/components/sections/HeroSection'
import { HowToBuySection } from '@/components/sections/HowToBuySection'
import { RoadmapSection } from '@/components/sections/RoadmapSection'
import { TokenomicsSection } from '@/components/sections/TokenomicsSection'
import { useToastStore } from '@/store/toastStore'

export default function App() {
  const { isConnected } = useConnection()
  const { chainId } = useAccount()
  const reduceMotion = useReducedMotion()
  const addToast = useToastStore((state) => state.addToast)
  const isWrongNetwork = isConnected && chainId && chainId !== 56

  useEffect(() => {
    if (!isWrongNetwork && isConnected && chainId === 56) {
      addToast(' Network Switched to BSC Mainnet', 'success', 5000)
    }
  }, [isConnected, isWrongNetwork, chainId, addToast])

  return (
    <>
      <CosmicBackdrop />
      <ScrollTracker />
      <div className="relative z-10 min-h-svh bg-transparent text-white antialiased">
        <motion.div
          initial={reduceMotion ? false : 'hidden'}
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.08,
                delayChildren: 0.06,
              },
            },
          }}
        >
          {[
            <HeroSection key="hero" />,
            <PresaleCard key="presale" />,
            <TokenomicsSection key="tokenomics" />,
            <RoadmapSection key="roadmap" />,
            <HowToBuySection key="how-to-buy" />,
            <FooterSection key="footer" />,
          ].map((section) => (
            <motion.div
              key={section.key}
              variants={{
                hidden: { opacity: 0, y: 18 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
              {section}
            </motion.div>
          ))}
        </motion.div>
      </div>
      <ToastContainer />
    </>
  )
}
