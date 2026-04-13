const links = [
  { href: '#', label: 'Docs' },
  { href: '#', label: 'Whitepaper' },
  { href: 'https://twitter.com', label: 'Twitter' },
  { href: 'https://telegram.org', label: 'Telegram' },
] as const

export function FooterSection() {
  return (
    <footer className="border-t border-white/[0.06] bg-black/70 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:flex-row">
        <p className="font-[family-name:var(--font-orbitron)] text-xs tracking-[0.2em] text-white/28">
          © {new Date().getFullYear()} CroniX presale
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/45">
          {links.map(({ href, label }) => (
            <a
              key={label}
              href={href}
              className="focus-ring rounded-lg transition-colors hover:text-white"
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noreferrer' : undefined}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
