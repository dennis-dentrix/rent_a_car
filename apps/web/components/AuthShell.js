import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'
import { brand } from '@carvo/shared/brand'
import ArcBackdrop from '@/components/ArcBackdrop'
import Logo from '@/components/Logo'
import { copy } from '@/copy/en'

const text = copy.auth.shell

/** The panel beside the form on a wide screen: what the service promises, over the brand's arc. */
function BrandPanel() {
  return (
    <aside className="relative hidden flex-col justify-between overflow-hidden bg-hero p-12 text-on-hero lg:flex">
      <ArcBackdrop className="absolute -right-32 -top-24 h-[720px] w-[720px] text-on-hero" />
      <Link href="/" className="relative z-10 inline-flex w-fit items-center gap-2 text-title-2">
        <Logo variant="mark" tone="current" size={32} />
        {brand.name}
      </Link>
      <div className="relative z-10 max-w-md">
        <h2 className="text-display">{text.panelTitle}</h2>
        <ul className="mt-8 flex flex-col gap-4 text-body text-on-hero-2">
          {text.points.map((point) => (
            <li key={point} className="flex items-start gap-3">
              <Check size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}

/**
 * The frame for signing in, creating an account, and every step between. It has no site menu, search, currency, footer,
 * or tab bar: someone here has one job, and every other link is a way to lose it. The logo and a way back are all that
 * is left. On a wide screen the brand panel sits beside the form; on a phone the form has the whole screen.
 */
export default function AuthShell({ children }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <BrandPanel />
      <div className="flex flex-col bg-bg">
        <header className="pt-safe flex items-center justify-between px-4 py-3 md:px-8">
          <Link href="/" aria-label={copy.nav.home} className="lg:invisible">
            <Logo />
          </Link>
          <Link
            href="/"
            className="state-layer inline-flex min-h-compact items-center gap-1 rounded-control px-3 text-callout font-medium text-label-2"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            {text.back}
          </Link>
        </header>
        <main className="flex flex-1 items-start justify-center px-4 pb-12 pt-4 md:items-center md:px-8 md:pt-0">
          <div className="w-full max-w-sm animate-rise">{children}</div>
        </main>
      </div>
    </div>
  )
}
