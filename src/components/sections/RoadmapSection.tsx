import { motion, useReducedMotion } from 'framer-motion'
import { RoadmapTimeline } from '@/components/RoadmapTimeline'

export function RoadmapSection() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="border-t border-white/[0.04] bg-black/50 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <motion.h2
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center font-[family-name:var(--font-orbitron)] text-3xl font-semibold tracking-wide text-white sm:text-4xl"
        >
          Cronix Roadmap
        </motion.h2>
        <RoadmapTimeline />
      </div>
    </section>
  )
}
