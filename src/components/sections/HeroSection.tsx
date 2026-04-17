import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

type Particle = { id: number; x: string; y: string; d: number; delay: number; big?: boolean }

const WHITEPAPER_URL = 'https://docs.google.com/document/d/14sGbJi5Sy7dGx2whkLw3-tNgMUhqucn_gnB1ZC5sfnQ/edit?usp=sharing'

export function HeroSection() {
  const reduceMotion = useReducedMotion()
  const particles = useMemo((): Particle[] => {
    if (reduceMotion) return []
    const fine: Particle[] = Array.from({ length: 14 }, (_, i) => ({
      id: i,
      x: `${(i * 37) % 100}%`,
      y: `${(i * 53) % 100}%`,
      d: 4 + (i % 5) * 1.2,
      delay: (i % 10) * 0.12,
    }))
    const big: Particle[] = Array.from({ length: 8 }, (_, i) => ({
      id: 100 + i,
      x: `${(i * 61 + 17) % 100}%`,
      y: `${(i * 47 + 23) % 100}%`,
      d: 10 + (i % 6) * 2,
      delay: (i % 8) * 0.18,
      big: true,
    }))
    return [...fine, ...big]
  }, [reduceMotion])

  return (
    <section
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 pt-16 pb-12"
      style={{ perspective: '1600px' }}
    >
      {/* Very subtle grid — stays black-first */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
      {!reduceMotion ? (
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-[0.1]"
          animate={{ backgroundPosition: ['0px 0px', '48px 48px'] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
          }}
        />
      ) : null}

      <div className="pointer-events-none absolute inset-0">
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className={`absolute rounded-full ${
              p.big ? 'bg-white/70 blur-[1.5px]' : 'bg-white/40 blur-px'
            }`}
            style={{
              left: p.x,
              top: p.y,
              width: p.d,
              height: p.d,
              boxShadow: p.big ? 'var(--glow-sparkle)' : '0 0 10px rgba(255,255,255,0.35), 0 0 20px rgba(255,255,255,0.12)',
            }}
            animate={
              reduceMotion
                ? undefined
                : { opacity: p.big ? [0.3, 0.9, 0.3] : [0.15, 0.55, 0.15], y: [0, p.big ? -18 : -12, 0] }
            }
            transition={{
              duration: p.big ? 5 + (p.id % 4) : 4 + (p.id % 5),
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {!reduceMotion ? (
        <motion.div
          className="pointer-events-none absolute left-1/2 top-[44%] h-[20rem] w-[20rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
          animate={{ scale: [0.94, 1.08, 0.94], opacity: [0.16, 0.28, 0.16], rotate: [0, 180, 360] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
          style={{ boxShadow: '0 0 80px rgba(255,255,255,0.08), inset 0 0 40px rgba(255,255,255,0.05)' }}
        />
      ) : null}

      {!reduceMotion ? (
        <motion.div
          className="pointer-events-none absolute left-1/2 top-[44%] h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
          animate={{ opacity: [0.06, 0.14, 0.06], scale: [0.98, 1.04, 0.98] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 24%, transparent 62%)' }}
        />
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/28 to-transparent shadow-[0_0_20px_rgba(255,255,255,0.25)]" />

      {!reduceMotion && (
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-0"
          animate={{ opacity: [0, 0.8, 0], y: [0, 20, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.6), transparent)',
            boxShadow: '0 0 30px rgba(34,211,238,0.4)',
          }}
        />
      )}

      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20, rotateX: 8 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative z-10 max-w-4xl text-center"
          whileHover={
            reduceMotion
              ? undefined
              : {
                  rotateX: 5,
                  rotateY: -2,
                  scale: 1.02,
                  transition: { type: 'spring', stiffness: 200, damping: 15 },
                }
          }
        >
          <p className="mb-4 font-[family-name:var(--font-orbitron)] text-sm font-semibold tracking-[0.35em] text-white/40 drop-shadow-[0_0_14px_rgba(255,255,255,0.08)]">
            CroniX presale · $CRONIX
          </p>

          <motion.h1
            className="text-3d-hero font-[family-name:var(--font-orbitron)] text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl md:text-7xl"
            animate={
              reduceMotion
                ? undefined
                : {
                    textShadow: [
                      '0 0 20px rgba(34,211,238,0.5), 0 0 40px rgba(34,211,238,0.3)',
                      '0 0 30px rgba(168,85,247,0.5), 0 0 60px rgba(168,85,247,0.3)',
                      '0 0 20px rgba(34,211,238,0.5), 0 0 40px rgba(34,211,238,0.3)',
                    ],
                  }
            }
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            ENTER THE $CRONIX PRESALE
          </motion.h1>

          <p className="mx-auto mt-5 max-w-xl font-[family-name:var(--font-orbitron)] text-base text-white/45 sm:text-lg [text-shadow:0_2px_20px_rgba(0,0,0,0.95)]">
            Secure your CRONIX before launch
          </p>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex items-center justify-center"
          >
            <motion.a
              href={WHITEPAPER_URL}
              target="_blank"
              rel="noreferrer"
              whileHover={reduceMotion ? undefined : { y: -3, scale: 1.02 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              className="focus-ring inline-flex items-center gap-3 rounded-full border border-white/16 bg-white/[0.06] px-6 py-3 font-[family-name:var(--font-orbitron)] text-sm font-semibold uppercase tracking-[0.22em] text-white shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-colors hover:border-white/30 hover:bg-white/[0.1]"
            >
              <span className="h-2 w-2 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.9)]" />
              Whitepaper
            </motion.a>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-12 flex flex-col items-center gap-2"
          animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <p className="font-[family-name:var(--font-orbitron)] text-xs tracking-widest text-white/30 uppercase">Scroll down</p>
          <motion.div
            animate={reduceMotion ? undefined : { y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
          >
            <div className="h-5 w-0.5 bg-gradient-to-b from-cyan-500/50 to-transparent" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
