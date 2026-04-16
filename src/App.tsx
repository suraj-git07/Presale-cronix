import { useEffect } from 'react'
import { useConnection, useAccount } from 'wagmi'
import { CosmicBackdrop } from '@/components/CosmicBackdrop'
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
      <div className="relative z-10 min-h-svh bg-transparent text-white antialiased">
        <HeroSection />
        <PresaleCard />
        <TokenomicsSection />
        <RoadmapSection />
        <HowToBuySection />
        <FooterSection />
      </div>
      <ToastContainer />
    </>
  )
}
