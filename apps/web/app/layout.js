import './globals.css'
import { Nunito_Sans } from 'next/font/google'
import { brand } from '@carvo/shared/brand'
import AlertsProvider from '@/components/AlertsProvider'
import { AnalyticsProvider } from '@/components/AnalyticsProvider'
import ConsentBanner from '@/components/ConsentBanner'
import JsonLd from '@/components/JsonLd'
import { ToastProvider } from '@/components/Toast'
import { SITE_URL } from '@/lib/site'
import { organizationJsonLd } from '@/lib/structured-data'
import { themeInitScript } from '@/lib/theme'

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: brand.name, template: `%s | ${brand.name}` },
  description:
    'Hire a car in Kenya from vetted rental companies, for a day, a month, or longer. With or without a driver.',
}

// Phone first: draw under the notch, light by default, never block pinch zoom.
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'light',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en-KE" className={nunitoSans.variable} data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <JsonLd data={organizationJsonLd()} />
        <AnalyticsProvider>
          <ToastProvider>
            <AlertsProvider>{children}</AlertsProvider>
          </ToastProvider>
          <ConsentBanner />
        </AnalyticsProvider>
      </body>
    </html>
  )
}
