import './globals.css'
import { Inter } from 'next/font/google'
import { brand } from '@carvo/shared/brand'
import JsonLd from '@/components/JsonLd'
import { ToastProvider } from '@/components/Toast'
import { SITE_URL } from '@/lib/site'
import { organizationJsonLd } from '@/lib/structured-data'
import { themeInitScript } from '@/lib/theme'

const inter = Inter({
  subsets: ['latin'],
  axes: ['opsz'],
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
    <html lang="en-KE" className={inter.variable} data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <JsonLd data={organizationJsonLd()} />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
