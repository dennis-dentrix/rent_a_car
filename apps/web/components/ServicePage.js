import CtaBand from '@/components/CtaBand'
import Faq from '@/components/Faq'
import GuidesSection from '@/components/GuidesSection'
import Journey from '@/components/Journey'
import JsonLd from '@/components/JsonLd'
import SearchHero, { SEARCH_ID } from '@/components/SearchHero'
import ServiceList from '@/components/ServiceList'
import StickySearchCta from '@/components/StickySearchCta'
import TellAndRules from '@/components/TellAndRules'
import { copy } from '@/copy/en'
import { breadcrumbJsonLd, faqJsonLd, serviceJsonLd } from '@/lib/structured-data'

/**
 * One service line's page: a hero with the search set to that line, the services it covers, any extra
 * sections for this line (`children`), what to bring, the steps, the questions, and a closing call to act.
 * The markup is built from the same text the page shows.
 */
export default function ServicePage({ pageKey, search, children }) {
  const page = copy.servicePages[pageKey]
  const { steps, faq } = page
  return (
    <div className="flex flex-col gap-14 md:gap-24">
      <JsonLd
        data={serviceJsonLd({
          name: page.hero.title,
          description: page.meta.description,
          path: page.path,
        })}
      />
      <JsonLd data={faqJsonLd(faq.items)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: copy.cars.crumbs.home, path: '/' },
          { name: page.crumb, path: page.path },
        ])}
      />
      <SearchHero hero={page.hero} search={search} initialGroup={pageKey} />
      <ServiceList {...page.list} />
      {children}
      <TellAndRules tell={page.tell} />
      <Journey eyebrow={steps.eyebrow} title={steps.title} steps={steps.items} />
      <Faq {...faq} />
      <GuidesSection />
      <CtaBand />
      <StickySearchCta targetId={SEARCH_ID} />
    </div>
  )
}
