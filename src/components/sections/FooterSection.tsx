import { motion, useReducedMotion } from 'framer-motion'

const WHITEPAPER_URL = 'https://docs.google.com/document/d/14sGbJi5Sy7dGx2whkLw3-tNgMUhqucn_gnB1ZC5sfnQ/edit?usp=sharing'

const links = [
  { href: WHITEPAPER_URL, label: 'Whitepaper' },
  { href: 'https://x.com/cronixlive', label: 'Twitter' },
  { href: 'https://t.me/cronixlive', label: 'Telegram' },
] as const

export function FooterSection() {
  const reduceMotion = useReducedMotion()

  return (
    <motion.footer
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden border-t border-white/[0.06] bg-black/70 py-10"
    >
      {!reduceMotion ? (
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"
          animate={{ x: ['-20%', '20%', '-20%'], opacity: [0.18, 0.55, 0.18] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      ) : null}

      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:flex-row">
        <motion.p
          animate={reduceMotion ? undefined : { opacity: [0.28, 0.52, 0.28] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="font-[family-name:var(--font-orbitron)] text-xs tracking-[0.2em] text-white/28"
        >
          © {new Date().getFullYear()} CroniX presale
        </motion.p>
        <motion.nav
          initial={reduceMotion ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
          }}
          className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/45"
        >
          {links.map(({ href, label }, index) => (
            <motion.a
              key={label}
              href={href}
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.4, delay: index * 0.02 },
                },
              }}
              whileHover={reduceMotion ? undefined : { y: -3, color: 'rgba(255,255,255,1)' }}
              className="focus-ring rounded-lg transition-colors hover:text-white"
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noreferrer' : undefined}
            >
              <span className="inline-flex items-center gap-2">
                <motion.span
                  animate={
                    reduceMotion
                      ? undefined
                      : { scale: [1, 1.35, 1], opacity: [0.35, 0.85, 0.35] }
                  }
                  transition={{ duration: 2.8 + index * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                  className="h-1.5 w-1.5 rounded-full bg-white/70"
                />
                {label}
              </span>
            </motion.a>
          ))}
        </motion.nav>
      </div>
    </motion.footer>
  )
}
