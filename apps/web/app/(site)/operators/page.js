import AskButton from '@/components/AskButton'
import Breadcrumbs from '@/components/Breadcrumbs'
import Button from '@/components/Button'
import Checklist from '@/components/Checklist'
import Faq from '@/components/Faq'
import FeatureList from '@/components/FeatureList'
import Hero from '@/components/Hero'
import Journey from '@/components/Journey'
import { JoinButton, SignInButton } from '@/components/JoinCta'
import JsonLd from '@/components/JsonLd'
import SectionHeading from '@/components/SectionHeading'
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
  const { title, text, create, signIn } = page.join
  return (
    <section className="w-full scroll-mt-24 rounded-sheet bg-hero p-6 text-on-hero md:p-10 [&_:focus-visible]:outline-on-hero">
      <h2 className="text-title-2 md:text-title-1-lg">{title}</h2>
      <p className="mt-2 max-w-xl text-body text-on-hero-2">{text}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <JoinButton createLabel={create} variant="light" />
        <SignInButton label={signIn} variant="glass" />
      </div>
    </section>
  )
}

function Documents() {
  return (
    <section className="w-full max-w-3xl">
      <Checklist {...page.documents} />
    </section>
  )
}

function Talk() {
  const { title, text, action, message } = page.talk
  return (
    <section>
      <SectionHeading title={title} className="mb-0">
        {text}
      </SectionHeading>
      <AskButton variant="tonal" isFullWidth={false} defaultMessage={message} className="mt-5">
        {action}
      </AskButton>
    </section>
  )
}

export default function OperatorsPage() {
  const { steps, faq } = page
  return (
    <div className="flex flex-col gap-16 md:gap-20">
      <JsonLd data={breadcrumbJsonLd(TRAIL)} />
      <JsonLd data={faqJsonLd(faq.items)} />
      <Breadcrumbs trail={TRAIL} />
      <Hero {...page.hero} hasSearchBelow={false}>
        <JoinButton createLabel={page.hero.apply} variant="light" />
        <AskButton variant="glass" isFullWidth={false}>
          {page.hero.ask}
        </AskButton>
      </Hero>
      <FeatureList {...page.why} />
      <FeatureList {...page.offer} />
      <Journey title={steps.title} steps={steps.items} />
      <Documents />
      <Join />
      <Talk />
      <Faq {...faq} />
    </div>
  )
}
