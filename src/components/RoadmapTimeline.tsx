import { motion, useReducedMotion } from 'framer-motion'

const phases = [
  { quarter: 'Q1', title: 'Wallet launch', body: 'Secure custody flows and chain support.' },
  { quarter: 'Q2', title: 'Beta + integrations', body: 'Partners, APIs, and performance hardening.' },
  { quarter: 'Q3', title: 'CroniX token presale', body: 'Community allocation and liquidity prep.' },
  { quarter: 'Q4', title: 'Full ecosystem', body: 'Live economy, seasons, and expansions.' },
] as const

export function RoadmapTimeline() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="relative mx-auto max-w-lg px-4">
      <div
        className="absolute bottom-2 left-[0.6rem] top-2 w-px bg-gradient-to-b from-white/50 via-white/15 to-white/5"
        aria-hidden
      />
      <ul className="space-y-6">
        {phases.map(({ quarter, title, body }, i) => (
          <motion.li
            key={quarter}
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
                {quarter}
              </p>
              <p className="mt-1 font-[family-name:var(--font-orbitron)] text-lg font-semibold text-white">{title}</p>
              <p className="mt-2 text-sm leading-relaxed text-white/42">{body}</p>
            </motion.div>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
