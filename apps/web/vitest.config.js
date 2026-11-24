import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Lets tests use the same "@/" imports as the app code (see jsconfig.json).
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
})
