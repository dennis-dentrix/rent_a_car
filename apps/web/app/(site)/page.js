import Band from '@/components/Band'
import Button from '@/components/Button'
import ClassGrid from '@/components/ClassGrid'
import CtaBand from '@/components/CtaBand'
import Eyebrow from '@/components/Eyebrow'
import Faq from '@/components/Faq'
import GoodToKnow from '@/components/GoodToKnow'
import GuidesSection from '@/components/GuidesSection'
import Journey from '@/components/Journey'
import JsonLd from '@/components/JsonLd'
import SearchHero, { SEARCH_ID } from '@/components/SearchHero'
import SeoIntro from '@/components/SeoIntro'
import PriceExplainer from '@/components/PriceExplainer'
import ServicesSection from '@/components/ServicesSection'
import StickySearchCta from '@/components/StickySearchCta'
import TrustRow from '@/components/TrustRow'
import { copy } from '@/copy/en'
import { getClasses, getSearchOptions } from '@/lib/catalogue'
import { pageMetadata } from '@/lib/seo'
import { faqJsonLd } from '@/lib/structured-data'

export const metadata = pageMetadata({ ...copy.home.meta, path: '/' })

const FEATURED_COUNT = 4

function Featured({ items }) {
  return (
    <Band>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <Eyebrow>{copy.home.eyebrows.fleet}</Eyebrow>
          <h2 className="text-title-2 md:text-title-1">{copy.home.classesTitle}</h2>
        </div>
        <Button href="/cars" variant="plain" size="compact" className="shrink-0 whitespace-nowrap">
          {copy.home.seeAll}
        </Button>
      </div>
      <ClassGrid items={items} isCarousel getHref={(item) => `/cars/${item.slug}`} />
    </Band>
  )
}

// A failed API call hides its section instead of breaking the page; /cars shows the error in full.
export default async function HomePage() {
  const [classes, search] = await Promise.all([getClasses(), getSearchOptions()])
  const featured = classes.data?.slice(0, FEATURED_COUNT) ?? []
  return (
    <div className="flex flex-col gap-14 md:gap-24">
      <SearchHero hero={{}} search={search} />
      <TrustRow />
      <SeoIntro />
      <ServicesSection />
      {featured.length > 0 && <Featured items={featured} />}
      <PriceExplainer />
      <Journey />
      <GoodToKnow />
      <GuidesSection />
      <Faq />
      <CtaBand />
      <StickySearchCta targetId={SEARCH_ID} />
      <JsonLd data={faqJsonLd(copy.home.faq.items)} />
    </div>
  )
}
