import {
  Briefcase,
  CarFront,
  ClipboardCheck,
  FileCheck,
  Handshake,
  Search,
  ShieldCheck,
  Tag,
  Users,
} from 'lucide-react'
import AskButton from '@/components/AskButton'
import Breadcrumbs from '@/components/Breadcrumbs'
import Button from '@/components/Button'
import Checklist from '@/components/Checklist'
import Eyebrow from '@/components/Eyebrow'
import Faq from '@/components/Faq'
import FeatureCards from '@/components/FeatureCards'
import Hero from '@/components/Hero'
import Journey from '@/components/Journey'
import { JoinButton, SignInButton } from '@/components/JoinCta'
import JsonLd from '@/components/JsonLd'
import { copy } from '@/copy/en'
import { pageMetadata } from '@/lib/seo'
import { breadcrumbJsonLd, faqJsonLd } from '@/lib/structured-data'

const page = copy.operators

export const metadata = pageMetadata({ ...page.meta, path: page.path })

const TRAIL = [
  { name: copy.classPage.home, path: '/' },
  { name: page.crumb, path: page.path },
]

function Join() {
  const { eyebrow, title, text, create, signIn } = page.join
  return (
    <section className="mx-auto w-full max-w-3xl scroll-mt-24 rounded-sheet bg-hero p-6 text-on-hero md:p-10">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="text-title-2 md:text-title-1">{title}</h2>
      <p className="mt-2 max-w-xl text-body text-on-hero-2">{text}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <JoinButton createLabel={create} variant="light" />
        <SignInButton label={signIn} variant="glass" />
      </div>
    </section>
  )
}

function Documents() {
  const { title, items, note } = page.documents
  return (
    <section className="mx-auto w-full max-w-3xl">
      <Checklist
        title={title}
        items={items}
        note={note}
        icon={FileCheck}
        iconClass="text-primary"
      />
    </section>
  )
}

function Talk() {
  const { title, text, action, message } = page.talk
  return (
    <section className="rounded-sheet bg-bg-grouped p-6 md:p-10">
      <h2 className="text-title-2 md:text-title-1">{title}</h2>
      <p className="mt-2 max-w-xl text-body text-label-2">{text}</p>
      <AskButton variant="tonal" isFullWidth={false} defaultMessage={message} className="mt-5">
        {action}
      </AskButton>
    </section>
  )
}

export default function OperatorsPage() {
  const { steps, faq } = page
  return (
    <div className="flex flex-col gap-14 md:gap-24">
      <JsonLd data={breadcrumbJsonLd(TRAIL)} />
      <JsonLd data={faqJsonLd(faq.items)} />
      <Breadcrumbs trail={TRAIL} />
      <Hero {...page.hero} hasSearchBelow={false}>
        <JoinButton createLabel={page.hero.apply} variant="light" />
        <AskButton variant="glass" isFullWidth={false}>
          {page.hero.ask}
        </AskButton>
      </Hero>
      <FeatureCards {...page.why} icons={[Tag, Search, ShieldCheck]} />
      <FeatureCards
        {...page.offer}
        icons={[CarFront, Users, Briefcase, ClipboardCheck, FileCheck, Handshake]}
      />
      <Journey eyebrow={steps.eyebrow} title={steps.title} steps={steps.items} />
      <Documents />
      <Join />
      <Talk />
      <Faq {...faq} />
    </div>
  )
}
