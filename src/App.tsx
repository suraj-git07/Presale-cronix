import { CosmicBackdrop } from '@/components/CosmicBackdrop'
import { PresaleCard } from '@/components/PresaleCard'
import { FooterSection } from '@/components/sections/FooterSection'
import { HeroSection } from '@/components/sections/HeroSection'
import { HowToBuySection } from '@/components/sections/HowToBuySection'
import { RoadmapSection } from '@/components/sections/RoadmapSection'
import { TokenomicsSection } from '@/components/sections/TokenomicsSection'

export default function App() {
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
    </>
  )
}
