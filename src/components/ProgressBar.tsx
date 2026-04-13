import { motion, useReducedMotion } from 'framer-motion'

type ProgressBarProps = {
  value: number
  isLoading?: boolean
  className?: string
}

export function ProgressBar({ value, isLoading, className = '' }: ProgressBarProps) {
  const reduceMotion = useReducedMotion()
  const pct = Math.min(100, Math.max(0, value))

  return (
    <div
      className={`inset-3d relative h-4 w-full overflow-hidden rounded-full border border-white/10 bg-[#010101] ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className="relative h-full rounded-full bg-gradient-to-b from-white via-neutral-200 to-neutral-400"
        style={{
          boxShadow:
            'inset 0 2px 0 rgba(255,255,255,0.65), inset 0 -6px 12px rgba(0,0,0,0.25), var(--glow-strong)',
        }}
        initial={reduceMotion ? { width: `${pct}%` } : { width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: reduceMotion ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }}
      />
      {isLoading ? (
        <div
          className="pointer-events-none absolute inset-0 shimmer opacity-70"
          aria-hidden
        />
      ) : null}
    </div>
  )
}
