import { brand } from '@carvo/shared/brand'
import Link from 'next/link'
import AskButton from '@/components/AskButton'
import ConsentLink from '@/components/ConsentLink'
import Logo from '@/components/Logo'
import ThemeToggle from '@/components/ThemeToggle'
import { copy } from '@/copy/en'
import { topLinks } from '@/lib/nav'

const ITEM = 'flex min-h-touch items-center text-left text-label-2 hover:text-label'

function PageLink({ href, label }) {
  return (
    <Link href={href} className={ITEM}>
      {label}
    </Link>
  )
}

// The header's pages with "How it works" before the last, so the group starts and ends as the header does.
const hireItems = () => {
  const links = [...topLinks]
  links.splice(-1, 0, { href: '/#how', label: copy.nav.how })
  return links.map((link) => <PageLink key={link.href} {...link} />)
}

const helpItems = () => [
  <AskButton key="ask" className={ITEM}>
    {copy.footer.message}
  </AskButton>,
  <PageLink key="guides" href="/blog" label={copy.footer.guides} />,
  <PageLink key="privacy" href="/privacy" label={copy.footer.privacy} />,
  <ConsentLink key="consent" className={ITEM} />,
  <PageLink key="operators" href="/operators" label={copy.footer.operators} />,
]

function Group({ title, items }) {
  return (
    <div>
      <p className="mb-1 text-callout font-semibold">{title}</p>
      <ul className="text-callout">
        {items.map((item) => (
          <li key={item.key}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Two short named groups of links, the appearance choice, and the maker line. The descriptor lives here, not in the
 * header. Links point only at pages that exist.
 */
export default function Footer() {
  return (
    <footer className="mt-16 border-t border-separator bg-bg-grouped">
      <div className="mx-auto flex max-w-page flex-col gap-8 px-gutter py-10 md:flex-row md:justify-between md:px-6 lg:px-10">
        <div className="flex max-w-xs flex-col items-start gap-4">
          <Logo />
          <p className="text-callout text-label-2">{copy.footer.descriptor}</p>
          <ThemeToggle />
        </div>
        <nav aria-label={copy.footer.nav} className="grid gap-8 min-[25em]:grid-cols-2 md:gap-16">
          <Group title={copy.footer.hire} items={hireItems()} />
          <Group title={copy.footer.help} items={helpItems()} />
        </nav>
      </div>
      <p className="mx-auto max-w-page border-t border-separator px-gutter py-5 text-footnote text-label-2 md:px-6 lg:px-10">
        {copy.footer.maker(brand.legalName)}
      </p>
    </footer>
  )
}
