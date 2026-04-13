import type { CSSProperties } from 'react'

type RingConfig = {
  sizeClass: string
  duration: number
  reverse: boolean
  starCount: number
  starClass: string
  opacity: number
}

const RINGS: RingConfig[] = [
  {
    sizeClass: 'size-[min(92vw,780px)]',
    duration: 130,
    reverse: false,
    starCount: 20,
    starClass: 'h-[2.5px] w-[2.5px] shadow-[0_0_10px_rgba(255,255,255,0.5)]',
    opacity: 0.48,
  },
  {
    sizeClass: 'size-[min(68vw,560px)]',
    duration: 88,
    reverse: true,
    starCount: 14,
    starClass: 'h-[2px] w-[2px] shadow-[0_0_6px_rgba(255,255,255,0.4)]',
    opacity: 0.42,
  },
  {
    sizeClass: 'size-[min(48vw,380px)]',
    duration: 52,
    reverse: false,
    starCount: 10,
    starClass: 'h-[1.5px] w-[1.5px] shadow-[0_0_5px_rgba(255,255,255,0.35)]',
    opacity: 0.36,
  },
]

function spinStyle(reverse: boolean, durationSec: number): CSSProperties {
  return {
    willChange: 'transform',
    animationName: reverse ? 'cosmic-rotate-rev' : 'cosmic-rotate',
    animationDuration: `${durationSec}s`,
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  }
}

function StarOrbitRing({ config }: { config: RingConfig }) {
  const step = 360 / config.starCount

  return (
    <div className="pointer-events-none absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2">
      <div
        className={`cosmic-anim ${config.sizeClass} rounded-full border border-white/[0.03]`}
        style={{
          opacity: config.opacity,
          ...spinStyle(config.reverse, config.duration),
        }}
      >
        {Array.from({ length: config.starCount }, (_, i) => (
          <div
            key={i}
            className="absolute inset-0 flex justify-center"
            style={{ transform: `rotate(${i * step}deg)` }}
          >
            <span
              className={`mt-[2px] shrink-0 rounded-full bg-white/78 ${config.starClass}`}
              aria-hidden
            />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Fixed void + soft accretion disks + orbital stars.
 * No filter:blur, no SVG noise, no Framer — keeps scrolling on the compositor.
 */
export function CosmicBackdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black [contain:strict]"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_52%_42%_at_50%_36%,#030303_0%,#000000_32%,#000000_100%)]" />

      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 38%, transparent 12%, rgba(0,0,0,0.35) 42%, rgba(0,0,0,0.88) 72%, #000 100%)',
        }}
      />

      <div className="pointer-events-none absolute left-1/2 top-[34%] -translate-x-1/2 -translate-y-1/2">
        <div
          className="cosmic-anim h-[min(92vh,780px)] w-[min(150vw,1300px)] rounded-[50%] opacity-[0.14]"
          style={{
            background:
              'conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(255,255,255,0.09) 42deg, transparent 95deg, rgba(255,255,255,0.04) 175deg, transparent 235deg, rgba(255,255,255,0.07) 295deg, transparent 360deg)',
            ...spinStyle(false, 150),
          }}
        />
      </div>

      <div className="pointer-events-none absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2">
        <div
          className="cosmic-anim h-[min(58vh,520px)] w-[min(115vw,980px)] rounded-[50%] opacity-[0.11]"
          style={{
            background:
              'conic-gradient(from 200deg at 50% 50%, transparent 0deg, rgba(255,255,255,0.06) 85deg, transparent 165deg, rgba(255,255,255,0.04) 255deg, transparent 360deg)',
            ...spinStyle(true, 100),
          }}
        />
      </div>

      <div className="absolute left-1/2 top-[38%] size-[min(32vw,200px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black shadow-[inset_0_0_72px_rgba(0,0,0,1),0_0_100px_rgba(0,0,0,0.98)] ring-1 ring-white/[0.06]" />

      {RINGS.map((cfg, i) => (
        <StarOrbitRing key={i} config={cfg} />
      ))}
    </div>
  )
}
