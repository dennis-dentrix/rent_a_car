import { brand } from '@carvo/shared/brand'
import Link from 'next/link'
import AskButton from '@/components/AskButton'
import ConsentLink from '@/components/ConsentLink'
import Logo from '@/components/Logo'
import { copy } from '@/copy/en'
import { topLinks } from '@/lib/nav'

/** The descriptor and maker line live here, not in the header. Links point only at pages that exist. */
export default function Footer() {
  // The same pages as the header, then how it works, then the in-app question form.
  const links = [
    ...topLinks,
    { href: '/#how', label: copy.nav.how },
    { href: '/blog', label: copy.footer.guides },
    { href: '/operators', label: copy.footer.operators },
    { href: '/privacy', label: copy.footer.privacy },
  ]
  return (
    <footer className="mt-16 border-t border-separator bg-bg-grouped">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-4 py-10 md:flex-row md:justify-between md:px-6 lg:px-10">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-3 text-callout text-label-2">{copy.footer.descriptor}</p>
        </div>
        <nav aria-label={copy.footer.nav}>
          <ul className="flex flex-col gap-3 text-callout">
            {links.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="text-label-2 hover:text-label">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <AskButton className="text-label-2 hover:text-label">{copy.footer.message}</AskButton>
            </li>
            <li>
              <ConsentLink className="text-label-2 hover:text-label" />
            </li>
          </ul>
        </nav>
      </div>
      <p className="mx-auto max-w-[1280px] border-t border-separator px-4 py-5 text-footnote text-label-2 md:px-6 lg:px-10">
        {copy.footer.maker(brand.legalName)}
      </p>
    </footer>
  )
}
