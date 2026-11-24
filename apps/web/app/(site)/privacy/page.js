import JsonLd from '@/components/JsonLd'
import LegalPage from '@/components/LegalPage'
import { copy } from '@/copy/en'
import { pageMetadata } from '@/lib/seo'
import { breadcrumbJsonLd } from '@/lib/structured-data'

const text = copy.privacy

export const metadata = pageMetadata({ ...text.meta, path: text.path })

export default function PrivacyPage() {
  const trail = [
    { name: copy.classPage.home, path: '/' },
    { name: text.crumb, path: text.path },
  ]
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(trail)} />
      <LegalPage text={text} />
    </>
  )
}
