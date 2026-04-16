import { motion, useReducedMotion } from 'framer-motion'
import { CheckCircle2, Coins, Wallet, Zap } from 'lucide-react'

const steps = [
  { icon: Wallet, title: 'Connect wallet', text: 'Use MetaMask or any WalletConnect wallet.' },
  { icon: Coins, title: 'Enter amount', text: 'Pick BNB or USDT and type how much to contribute.' },
  { icon: Zap, title: 'Confirm transaction', text: 'Review gas and approve in your wallet.' },
  {
    icon: CheckCircle2,
    title: 'Claim tokens',
    text: 'CRONIX is credited per the live CroniX presale rate.',
  },
] as const

export function HowToBuySection() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="border-t border-white/[0.04] bg-black/40 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <motion.h2
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center font-[family-name:var(--font-orbitron)] text-3xl font-semibold tracking-wide text-white sm:text-4xl"
        >
          How to buy CroniX
        </motion.h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <motion.div
              key={title}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: i * 0.05 }}
              whileHover={reduceMotion ? undefined : { y: -3, borderColor: 'rgba(255,255,255,0.2)' }}
              className="surface-3d flex gap-4 rounded-2xl p-6 transition-[box-shadow,border-color]"
            >
              <div className="inset-3d flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-[#020202] text-white shadow-[var(--glow)]">
                <Icon className="h-6 w-6" strokeWidth={1.25} />
              </div>
              <div>
                <p className="font-[family-name:var(--font-orbitron)] text-xs font-semibold tracking-widest text-white/38">
                  Step {i + 1}
                </p>
                <h3 className="mt-1 font-[family-name:var(--font-orbitron)] text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm text-white/42">{text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
