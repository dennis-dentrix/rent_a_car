import Band from '@/components/Band'
import ClassGrid from '@/components/ClassGrid'
import Eyebrow from '@/components/Eyebrow'
import FeatureCards from '@/components/FeatureCards'
import PriceExplainer from '@/components/PriceExplainer'
import ServicePage from '@/components/ServicePage'
import { copy } from '@/copy/en'
import { getClasses, getSearchOptions } from '@/lib/catalogue'
import { pageMetadata } from '@/lib/seo'

const page = copy.servicePages.car_hire

export const metadata = pageMetadata({ ...page.meta, path: page.path })

// Live car types and their daily rates. A failed API call hides this section; /cars shows the error in full.
function CarTypes({ items }) {
  return (
    <Band>
      <Eyebrow>{copy.home.eyebrows.fleet}</Eyebrow>
      <h2 className="mb-6 text-title-2 md:text-title-1">{page.carsTitle}</h2>
      <ClassGrid items={items} isCarousel getHref={(item) => `/cars/${item.slug}`} />
    </Band>
  )
}

export default async function CarHirePage() {
  const [classes, search] = await Promise.all([getClasses(), getSearchOptions()])
  return (
    <ServicePage pageKey="car_hire" search={search}>
      <FeatureCards {...page.lengths} />
      {classes.data?.length > 0 && <CarTypes items={classes.data} />}
      <PriceExplainer />
    </ServicePage>
  )
}
