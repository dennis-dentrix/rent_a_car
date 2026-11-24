import { fileURLToPath } from 'node:url'
import { remoteImagePatterns } from './lib/media.js'

// Sent with every page. The page's own scripts and styles are left open (Next.js writes inline ones), so the policy
// closes what can be closed without them: no framing by other sites (clickjacking), no plug-ins, no other base
// address, and forms that post only to this site.
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  {
    key: 'Content-Security-Policy',
    value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
  },
  ...(process.env.NODE_ENV === 'production'
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' }]
    : []),
]

// Sign-in pages and the session answer are about one person and are never kept by the browser or a shared cache.
const noStore = [{ key: 'Cache-Control', value: 'private, no-store' }]

const repositoryRoot = fileURLToPath(new URL('../..', import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone build for the Docker container on Oracle Cloud. The monorepo root is traced so the
  // shared package is included.
  output: 'standalone',
  outputFileTracingRoot: repositoryRoot,
  transpilePackages: ['@rent-a-car/shared'],
  poweredByHeader: false,
  // Photos and guide images kept on a separate host (the media base address) may be served through next/image.
  // In development that host is the local storage on 127.0.0.1, which next/image refuses unless told to allow it.
  images: {
    remotePatterns: remoteImagePatterns(process.env.NEXT_PUBLIC_MEDIA_BASE_URL),
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== 'production',
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/auth/:path*', headers: noStore },
      { source: '/account', headers: noStore },
      { source: '/settings', headers: noStore },
    ]
  },
  // In development the web app proxies /api to the API app, as Caddy does in production.
  async rewrites() {
    if (!process.env.API_URL) return []
    return [{ source: '/api/:path*', destination: `${process.env.API_URL}/api/:path*` }]
  },
}

export default nextConfig
