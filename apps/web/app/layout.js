import './globals.css'
import { brand } from '@rent-a-car/shared/brand'

export const metadata = {
  title: { default: brand.name, template: `%s | ${brand.name}` },
  description: 'Executive car hire, chauffeur service, and airport transfers in Kenya.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en-KE">
      <body>{children}</body>
    </html>
  )
}
