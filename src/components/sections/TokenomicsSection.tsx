import { useId } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

type RingProps = { label: string; value: string; pct: number; sub: string; gradId: string }

function Ring({ label, value, pct, sub, gradId }: RingProps) {
  const r = 52
  const c = 2 * Math.PI * r
  const offset = c * (1 - pct / 100)

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative h-36 w-36">
        <svg className="-rotate-90" width="144" height="144" viewBox="0 0 144 144" aria-hidden>
          <circle cx="72" cy="72" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
          <circle
            cx="72"
            cy="72"
            r={r}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-1000"
          />
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a1a1aa" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-[family-name:var(--font-orbitron)] text-lg font-bold text-white">{value}</span>
          <span className="text-[10px] uppercase tracking-widest text-white/35">{sub}</span>
        </div>
      </div>
      <p className="mt-3 max-w-[10rem] text-sm font-medium text-white/45">{label}</p>
    </div>
  )
}

const cardData: Omit<RingProps, 'gradId'>[] = [
  { label: 'Total supply', value: '100M', pct: 100, sub: 'CRONIX' },
  { label: 'Pre-sale', value: '5M', pct: 5, sub: '5% allocation' },
  { label: 'Founder & team', value: '10M', pct: 10, sub: '10% allocation' },
  { label: 'Treasury', value: '40M', pct: 40, sub: '40% allocation' },
  { label: 'Advisors', value: '8M', pct: 8, sub: '8% allocation' },
  { label: 'Partnership & exchange', value: '15M', pct: 15, sub: '15% allocation' },
  { label: 'Ecosystem', value: '20M', pct: 20, sub: '20% allocation' },
  { label: 'Public sale', value: '2M', pct: 2, sub: '2% allocation' },
]

export function TokenomicsSection() {
  const reduceMotion = useReducedMotion()
  const uid = useId().replace(/:/g, '')

  return (
    <section className="border-t border-white/[0.04] bg-black/55 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <motion.h2
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center font-[family-name:var(--font-orbitron)] text-3xl font-semibold tracking-wide text-white sm:text-4xl"
        >
          CroniX tokenomics
        </motion.h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cardData.map((card, i) => (
            <motion.div
              key={card.label}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.06 }}
              whileHover={reduceMotion ? undefined : { y: -4, borderColor: 'rgba(255,255,255,0.2)' }}
              className="surface-3d flex flex-col items-center rounded-2xl px-6 py-8 transition-[transform,box-shadow]"
            >
              <Ring {...card} gradId={`${uid}-g-${i}`} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
