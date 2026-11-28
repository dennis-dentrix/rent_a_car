import ClassGrid from '@/components/ClassGrid'
import FeatureList from '@/components/FeatureList'
import PriceExplainer from '@/components/PriceExplainer'
import SectionHeading from '@/components/SectionHeading'
import ServicePage from '@/components/ServicePage'
import { copy } from '@/copy/en'
import { getListedClasses, getSearchOptions } from '@/lib/catalogue'
import { pageMetadata } from '@/lib/seo'

const page = copy.servicePages.car_hire

export const metadata = pageMetadata({ ...page.meta, path: page.path })

// Car types with cars to hire, and their daily rates. Hidden when there are none, or when the API does not answer;
// /cars shows the error in full.
function CarTypes({ items }) {
  return (
    <section>
      <SectionHeading title={page.carsTitle} />
      <ClassGrid items={items} isCarousel getHref={(item) => `/cars/${item.slug}`} />
    </section>
  )
}

export default async function CarHirePage() {
  const [classes, search] = await Promise.all([getListedClasses(), getSearchOptions()])
  return (
    <ServicePage pageKey="car_hire" search={search}>
      <FeatureList {...page.lengths} />
      {classes.data?.length > 0 && <CarTypes items={classes.data} />}
      <PriceExplainer />
    </ServicePage>
  )
}
