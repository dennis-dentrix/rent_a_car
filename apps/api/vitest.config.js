import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.js', 'tests/**/*.test.js'],
    // Database and API tests need the local Supabase running: npm run test:db
    exclude: ['node_modules', ...(process.env.DB_TESTS ? [] : ['tests/integration/**'])],
    fileParallelism: false,
  },
})
