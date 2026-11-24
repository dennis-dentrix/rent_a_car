import { fileURLToPath } from 'node:url'
import { remoteImagePatterns } from './lib/media.js'

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
  // In development the web app proxies /api to the API app, as Caddy does in production.
  async rewrites() {
    if (!process.env.API_URL) return []
    return [{ source: '/api/:path*', destination: `${process.env.API_URL}/api/:path*` }]
  },
}

export default nextConfig
