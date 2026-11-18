import { fileURLToPath } from 'node:url'

const repositoryRoot = fileURLToPath(new URL('../..', import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone build for the Docker container on Oracle Cloud. The monorepo root is traced so the
  // shared package is included.
  output: 'standalone',
  outputFileTracingRoot: repositoryRoot,
  transpilePackages: ['@rent-a-car/shared'],
  poweredByHeader: false,
  // In development the web app proxies /api to the API app, as Caddy does in production.
  async rewrites() {
    if (!process.env.API_URL) return []
    return [{ source: '/api/:path*', destination: `${process.env.API_URL}/api/:path*` }]
  },
}

export default nextConfig
