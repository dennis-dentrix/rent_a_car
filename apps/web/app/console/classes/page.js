import { nairobiDate } from '@carvo/shared'
import AdminPage from '@/components/AdminPage'
import ClassPrices from '@/components/ClassPrices'
import PriceHistory from '@/components/PriceHistory'
import { copy } from '@/copy/en'
import { getClasses } from '@/lib/catalogue'
import { classPriceRows } from '@/lib/class-rates'
import { consoleGet, requireOperator } from '@/lib/console'
import { CONSOLE_RESOURCES } from '@/lib/console-resources'

const text = copy.classPrices

export const metadata = { title: text.title }

const formProps = {
  resource: 'classes',
  scope: 'console',
  fields: CONSOLE_RESOURCES.classes.fields,
  labels: { ...copy.adminSetup.resources.classes.fields, price_kes: text.newPrice },
  refs: {},
}

// One page for what a company hires out and what it charges: each class with its price, then the dated history.
export default async function ConsoleClassesPage() {
  const { token } = await requireOperator()
  const [classes, rates, listed] = await Promise.all([
    consoleGet('/operator/classes', token, { limit: 100 }),
    consoleGet('/operator/rates', token, { limit: 100 }),
    getClasses(),
  ])
  const lists = {
    classes: classes.data ?? [],
    ownRates: rates.data ?? [],
    listed: listed.data ?? [],
  }
  return (
    <AdminPage
      title={text.title}
      subtitle={text.subtitle}
      hasError={Boolean(classes.error || rates.error)}
    >
      <ClassPrices rows={classPriceRows(lists, nairobiDate(new Date()))} formProps={formProps} />
      <PriceHistory rates={lists.ownRates} classes={lists.classes} />
    </AdminPage>
  )
}
