import CtaBand from '@/components/CtaBand'
import Faq from '@/components/Faq'
import HomeCars from '@/components/HomeCars'
import JsonLd from '@/components/JsonLd'
import SearchHero, { SEARCH_ID } from '@/components/SearchHero'
import SeoIntro from '@/components/SeoIntro'
import StickySearchCta from '@/components/StickySearchCta'
import TrustPoints from '@/components/TrustPoints'
import { copy } from '@/copy/en'
import { getSearchOptions, getVehicles } from '@/lib/catalogue'
import { pageMetadata } from '@/lib/seo'
import { faqJsonLd } from '@/lib/structured-data'

export const metadata = pageMetadata({ ...copy.home.meta, path: '/' })

// A failed API call hides the cars instead of breaking the page; /cars shows the error in full.
export default async function HomePage() {
  const [vehicles, search] = await Promise.all([getVehicles(), getSearchOptions()])
  return (
    <div className="flex flex-col gap-16 md:gap-20">
      <SearchHero hero={{}} search={search} />
      <HomeCars cars={vehicles.data ?? []} />
      <TrustPoints />
      <Faq />
      <SeoIntro />
      <CtaBand />
      <StickySearchCta targetId={SEARCH_ID} />
      <JsonLd data={faqJsonLd(copy.home.faq.items)} />
    </div>
  )
}
