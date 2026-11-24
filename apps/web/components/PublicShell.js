import Footer from '@/components/Footer'
import Header from '@/components/Header'
import TabBar from '@/components/TabBar'
import { copy } from '@/copy/en'
import { customerTabs } from '@/lib/nav'

// Room for the fixed tab bar and the home indicator on phones.
const TAB_CLEARANCE = 'pb-[calc(theme(spacing.tabbar)+env(safe-area-inset-bottom))] lg:pb-0'

/** Public and account pages: header, content, footer, and the phone tab bar. */
export default function PublicShell({ suggestions, children }) {
  return (
    <div className={TAB_CLEARANCE}>
      <Header suggestions={suggestions} />
      <main className="mx-auto min-h-[60dvh] max-w-[1280px] px-4 py-6 md:px-6 lg:px-10">
        {children}
      </main>
      <Footer />
      <TabBar items={customerTabs} label={copy.nav.main} />
    </div>
  )
}
