import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Lets tests use the same "@/" imports as the app code (see jsconfig.json), and read the JSX in component files,
// which are plain .js files.
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  esbuild: { include: /\.js$/, exclude: /node_modules/, loader: 'jsx', jsx: 'automatic' },
})
