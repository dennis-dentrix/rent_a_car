import { defineCloudflareConfig } from '@opennextjs/cloudflare'

// No incremental cache yet: pages that ask for `revalidate` fetch from the API each time. The API already marks its
// public answers for Cloudflare's cache. An R2 cache (see the adapter's caching guide) can be added later.
export default defineCloudflareConfig()
