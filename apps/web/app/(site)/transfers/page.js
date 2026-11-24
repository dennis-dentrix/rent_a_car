import ServicePage from '@/components/ServicePage'
import { copy } from '@/copy/en'
import { getSearchOptions } from '@/lib/catalogue'
import { pageMetadata } from '@/lib/seo'

const page = copy.servicePages.transfers

export const metadata = pageMetadata({ ...page.meta, path: page.path })

export default async function TransfersPage() {
  return <ServicePage pageKey="transfers" search={await getSearchOptions()} />
}
