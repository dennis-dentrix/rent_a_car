import Button from '@/components/Button'
import ClassGrid from '@/components/ClassGrid'
import CtaBand from '@/components/CtaBand'
import Faq from '@/components/Faq'
import GuidesSection from '@/components/GuidesSection'
import Journey from '@/components/Journey'
import JsonLd from '@/components/JsonLd'
import SearchHero, { SEARCH_ID } from '@/components/SearchHero'
import SectionHeading from '@/components/SectionHeading'
import SeoIntro from '@/components/SeoIntro'
import PriceExplainer from '@/components/PriceExplainer'
import ServicesSection from '@/components/ServicesSection'
import StickySearchCta from '@/components/StickySearchCta'
import { copy } from '@/copy/en'
import HomeCars from '@/components/HomeCars'
import { getSearchOptions, getShowroom } from '@/lib/catalogue'
import { pageMetadata } from '@/lib/seo'
import { faqJsonLd } from '@/lib/structured-data'

export const metadata = pageMetadata({ ...copy.home.meta, path: '/' })

const FEATURED_COUNT = 4

function Featured({ items }) {
  const seeAll = (
    <Button href="/cars" variant="plain" size="compact" className="shrink-0 whitespace-nowrap">
      {copy.home.seeAll}
    </Button>
  )
  return (
    <section>
      <SectionHeading title={copy.home.classesTitle} action={seeAll} />
      <ClassGrid items={items} isCarousel getHref={(item) => `/cars/${item.slug}`} />
    </section>
  )
}

// A failed API call hides its section instead of breaking the page; /cars shows the error in full.
export default async function HomePage() {
  const [{ classes, cars }, search] = await Promise.all([getShowroom(), getSearchOptions()])
  const featured = classes?.slice(0, FEATURED_COUNT) ?? []
  return (
    <div className="flex flex-col gap-16 md:gap-20">
      <SearchHero hero={{}} search={search} />
      <HomeCars cars={cars} />
      {featured.length > 0 && <Featured items={featured} />}
      <ServicesSection />
      <PriceExplainer />
      <Journey />
      <Faq />
      <SeoIntro />
      <GuidesSection />
      <CtaBand />
      <StickySearchCta targetId={SEARCH_ID} />
      <JsonLd data={faqJsonLd(copy.home.faq.items)} />
    </div>
  )
}
