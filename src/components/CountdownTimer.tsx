import { useEffect, useState } from 'react'

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

function formatRemaining(ms: number) {
  if (ms <= 0) return { d: '00', h: '00', m: '00', s: '00' }
  const s = Math.floor(ms / 1000)
  const days = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return { d: pad(days), h: pad(h), m: pad(m), s: pad(sec) }
}



type CountdownTimerProps = {
  targetTimestamp: number
}

export function CountdownTimer({ targetTimestamp }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(() => {
    // Calculate remaining time on initial render based on fixed targetTimestamp
    const diff = targetTimestamp - Date.now()
    return diff > 0 ? diff : 0
  })

  useEffect(() => {
    // Tick down the countdown every second
    const id = window.setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1000
        return next > 0 ? next : 0
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [])

  const { d, h, m, s } = formatRemaining(remaining)

  const blocks = [
    { v: d, u: 'D' },
    { v: h, u: 'H' },
    { v: m, u: 'M' },
    { v: s, u: 'S' },
  ]

  return (
    <div className="surface-3d-subtle min-w-0 w-full overflow-hidden rounded-2xl px-2 py-3 sm:px-3">
      <p className="mb-2 truncate text-center text-xs font-medium uppercase tracking-[0.15em] text-white/38 sm:tracking-[0.2em]">
        PreSale ends In
      </p>
      <div className="grid w-full min-w-0 grid-cols-4 gap-1 sm:gap-1.5">
        {blocks.map(({ v, u }) => (
          <div
            key={u}
            className="inset-3d flex min-w-0 flex-col items-center justify-center rounded-lg border border-white/10 bg-[#010101] px-0.5 py-1.5 shadow-[var(--glow)] sm:rounded-xl sm:py-2"
          >
            <span className="w-full truncate text-center font-[family-name:var(--font-orbitron)] text-sm font-semibold tabular-nums leading-none text-white sm:text-base md:text-lg">
              {v}
            </span>
            <span className="mt-0.5 text-[9px] uppercase tracking-wider text-white/35 sm:text-[10px] sm:tracking-widest">
              {u}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
