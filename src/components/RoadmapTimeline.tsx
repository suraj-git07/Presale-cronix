import { motion, useReducedMotion } from 'framer-motion'

const phases = [
  {
    period: 'Q1 2026',
    title: 'Launch & Community',
    points: [
      'Token presale goes live with early community access.',
      'Staking and validator program introduced.',
      'Gamified onboarding and reward campaigns begin.',
    ],
  },
  {
    period: 'Q2 2026',
    title: 'Growth & Early Access',
    points: [
      'Partnerships and ecosystem collaborations expand.',
      'Early product prototypes for wallet and gaming released.',
      'Community incentives and engagement systems scale.',
    ],
  },
  {
    period: 'Q3 2026',
    title: 'Product Rollout',
    points: [
      'Non-custodial wallet beta launch with multi-chain support.',
      'ZebraSwap DEX goes live with initial liquidity.',
      'Cronix Crypto Card beta for real-world payments.',
    ],
  },
  {
    period: 'Q4 2026',
    title: 'Ecosystem Expansion',
    points: [
      'Full wallet launch with secure custody flows.',
      'Gaming ecosystem and asset ownership system rollout.',
      'Gamify engine expansion with missions, XP, and rewards.',
    ],
  },
  {
    period: 'Q1-Q2 2027',
    title: 'Core Infrastructure',
    points: [
      'Cronix blockchain mainnet launch.',
      'Validator network expansion and decentralization.',
      'Developer ecosystem, SDKs, and DeFi integrations.',
    ],
  },
  {
    period: 'Q3-Q4 2027',
    title: 'Scale & Global Reach',
    points: [
      'Major exchange listings and institutional partnerships.',
      'DAO governance and community fund launch.',
      'Global expansion across key regions.',
    ],
  },
  {
    period: '2028+',
    title: 'Cronix 2.0',
    points: [
      'Layer 2 scaling and advanced infrastructure.',
      'RWA, DePIN, and real-world integrations.',
      'Full Web3 ecosystem (Wallet + DEX + Gaming + Payments).',
    ],
  },
] as const

export function RoadmapTimeline() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="relative mx-auto max-w-3xl px-4">
      <div
        className="absolute bottom-2 left-[0.6rem] top-2 w-px bg-gradient-to-b from-white/50 via-white/15 to-white/5"
        aria-hidden
      />
      <ul className="space-y-6">
        {phases.map(({ period, title, points }, i) => (
          <motion.li
            key={period}
            initial={reduceMotion ? false : { opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            className="relative flex gap-5 pl-1"
          >
            <div className="relative z-10 flex w-5 shrink-0 justify-center pt-1">
              <motion.div
                whileHover={reduceMotion ? undefined : { scale: 1.12 }}
                className="h-5 w-5 rounded-full border-2 border-white/60 bg-white shadow-[0_0_22px_rgba(255,255,255,0.85),0_0_48px_rgba(255,255,255,0.35),0_0_80px_rgba(255,255,255,0.12)]"
              >
                <span className="pointer-events-none absolute inset-0 -m-2 animate-ping rounded-full border border-white/25 opacity-35" />
              </motion.div>
            </div>
            <motion.div
              whileHover={reduceMotion ? undefined : { y: -3, borderColor: 'rgba(255,255,255,0.22)' }}
              className="surface-3d-subtle min-w-0 flex-1 rounded-2xl p-5 transition-[transform,box-shadow]"
            >
              <p className="font-[family-name:var(--font-orbitron)] text-xs font-semibold tracking-[0.25em] text-white/38">
                {period}
              </p>
              <p className="mt-1 font-[family-name:var(--font-orbitron)] text-lg font-semibold text-white">{title}</p>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-white/42">
                {points.map((point) => (
                  <li key={point} className="flex gap-2">
                    <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-white/45" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
